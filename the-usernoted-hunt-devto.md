---
title: "The Notification That Ate My MacBook: A Debugging Story"
published: false
description: How a forgotten time-tracking app pinned macOS's usernoted daemon at 99% CPU — and how one log command cracked it open after every obvious fix failed.
tags: macos, debugging, productivity, tutorial
---

*How a deleted-in-the-end time-tracking app pinned a macOS daemon at 99% CPU for who knows how long — and how every "obvious" fix failed before a one-line log command cracked it open.*

---

## 📖 It started with the wrong question

"My Mac is heating up. What's using all the RAM?"

That's how it began — a warm laptop, a whirring fan, and the completely reasonable assumption that memory was the villain. It's the question everyone asks, and it's almost always the wrong one.

Thirty seconds of `ps` and `memory_pressure` later, the RAM theory was dead: **65% free memory, zero swap used**. Nothing was starving. But sorting processes by CPU instead of memory turned up something strange sitting quietly at the top:

```
 99.7  36928   635  /usr/sbin/usernoted
```

`usernoted`. The macOS notification daemon. A background process whose entire job is to pop little banners in the corner of your screen — burning **an entire CPU core, continuously**, while using a laughable 16 MB of RAM.

That was the heat. Not Chrome with its forty tabs. Not VS Code. A system daemon nobody has ever consciously interacted with.

> 📝 **Note:** heat is a CPU problem wearing a RAM costume. Fans respond to power draw, and power draw follows CPU cycles. When a machine runs hot, sort by CPU first.

## 🐛 The two-second respawn

The classic move — `killall usernoted` — worked for exactly two seconds. The daemon relaunched (they always do; `launchd` sees to that) and was back at 97% before the shell prompt returned.

That respawn told us something important: this wasn't a transient glitch or a stuck request. Something *persistent* — data sitting on disk — was feeding the spin. Kill the process all you want; it reloads the same poison on every boot.

So the question changed from "what process?" to "what data?"

## 🔍 Reading the daemon's mind

macOS ships a wonderful and underused tool called `sample`, which snapshots a process's call stacks. Pointed at the spinning daemon, it returned the smoking mechanism in beautiful, damning detail:

```
-[UNCalendarNotificationTrigger nextTriggerDateAfterDate:withRequestedDate:]
  Calendar.nextDate(after:matching:options:)
    Calendar._enumerateDatesStep(...)
      Calendar.dateAfterMatchingWeekOfYear(...)
```

Translation: somewhere in the notification store sat a **scheduled repeating notification** whose date rule the system could not resolve. Foundation's calendar engine was trying to compute "when does this fire next?" — and looping *forever* on the week-of-year component. Not crashing. Not erroring. Just spinning, politely and eternally, at 99%.

We had the murder weapon. We did not have the murderer.

## ❌ The graveyard of reasonable theories

Here's where the hunt got humbling. The stack trace screamed "calendar," so we did what any sane person would do — we went after calendar data. One suspect at a time, with a proper measurement after each kill (more on that later):

**Suspect #1: A Google account synced to Calendar.** Google-synced recurring events with exotic rules are a known source of cursed date math. Removed the account. *Still pinned at 96%.*

**Suspect #2: Calendar.app's notification toggle.** Flipped off in System Settings. *Still pinned.* (And a lesson hiding inside: the toggle suppresses *delivery* — it doesn't unschedule triggers already sitting in the store.)

**Suspect #3: A suspect calendar, deleted outright.** *Still pinned.*

**Suspects #4–6: Three leftover calendars from old task-manager apps**, unsubscribed in one sweep. Task and todo apps that "integrate with Apple Calendar" love writing recurring events with alerts, and uninstalling the app leaves the events behind. A genuinely great theory. *Still pinned.*

**Suspect #7: The "Work" calendar itself**, exported to `.ics` and grepped for `BYWEEKNO` — the one recurrence keyword that maps exactly onto the week-of-year loop in the stack. Ninety-three events, every recurrence rule bounded and boring. *Clean.*

Meanwhile, every attempt to just *read the notification store directly* hit a wall. The legacy database at `com.apple.notificationcenter/db2/db`? **Zero bytes** — deprecated, empty, a decoy that half the internet's fix-it guides still tell you to delete. The real store? Locked behind macOS's privacy walls, unreadable even after granting Full Disk Access, because the Calendar data sits behind its *own* separate permission category.

Six suspects. Six alibis. The daemon spun on, byte-for-byte the same stack trace, as if mocking the entire investigation.

## 💡 The one-line command that broke the case

At this point the user — tired of watching calendars get executed for crimes they didn't commit — made a simple suggestion:

> "Did you try `log show --predicate 'process == \"usernoted\"' --info --last 5m`? Check once."

I had. Hours earlier. It had returned *nothing*, and I'd written the log avenue off.

Except — it hadn't returned nothing. It had **never run at all**.

Running it this time, without error-suppression, the shell coughed up the truth:

```
(eval):log:1: too many arguments
```

The session shell was **zsh**, and zsh has a *builtin* command named `log` — an ancient login-watching utility — which had been silently shadowing `/usr/bin/log` the entire time. Every one of my earlier log queries had failed instantly, and my tidy little `2>/dev/null` had swallowed the error, converting "command failed" into "logs are empty." I had abandoned the single most direct diagnostic in the toolbox because of a name collision and my own muffler on stderr.

One character path fix — `/usr/bin/log show ...` — and the culprit was on screen in under five seconds:

```
NotificationRecord app:"com.glimsoft.Timelines"
  req:"Timelines-engagement-longtail-one"
  category:"GSNotificationCategory_Reengagement"
  ...authorizationStatus: Denied...
```

Repeated. **Dozens of times per second.**

## 🎯 The culprit: a nag that couldn't take no for an answer

**Timelines** — a time-tracking app, long forgotten, still sitting in `/Applications`, not even running — had at some point scheduled two repeating "re-engagement" notifications. The names say everything: `engagement-longtail-one` and `engagement-longtail-two`. These are the "hey, come back and use me!" nags that growth teams schedule far into the future.

And here's the poison pill: at some point, the user had **denied** the app notification permission. Perfectly normal thing to do. But the scheduled requests didn't get cleaned up — they stayed in the daemon's store, repeating triggers for notifications that could never be shown. So `usernoted` sat in an eternal cycle: compute the next fire date (spinning through the pathological week-of-year path), attempt delivery, get refused by the permission system, reschedule, repeat. Forever. On every boot.

Not a calendar event. Not a Google sync artifact. A **re-engagement notification from an unused app, colliding with a denied permission**, feeding a genuine infinite-loop bug in Apple's date-matching code.

The trap in the stack trace, in hindsight: `UNCalendarNotificationTrigger` is the API class *any* app uses to schedule a date-based local notification. The word "calendar" in the class name refers to calendar *math*, not Calendar-the-app. The stack named the mechanism precisely and pointed at the owner not at all — and we spent hours interrogating the app whose name happened to match.

## ✅ The kill, verified

Delete `/Applications/Timelines.app`. Restart the daemon. Measure:

```
before:  8.0s of CPU time per 8s window   (~99%, sustained, every boot)
after:   0.38s total, zero growth          (idle)
loop frames in stack sample: 0
```

Fan quiet. Lap cool. Case closed.

## 🛠️ TL;DR — if your Mac is hot and usernoted (or disnoted) is the culprit

1. **Confirm it's spinning** (not a snapshot artifact) by diffing CPU time over a window:
   ```
   PID=$(pgrep -x usernoted); T1=$(ps -o time= -p $PID); sleep 10; ps -o time= -p $PID
   ```
   Near-equal = idle. Grew ~10s = pinned.
2. **See what it's stuck on:** `sample $(pgrep -x usernoted) 3`
3. **Ask it who's to blame** (full path — see the zsh gotcha below):
   ```
   /usr/bin/log show --predicate 'process == "usernoted"' --info --last 5m
   ```
4. **Look for one bundle ID repeating relentlessly**, especially a repeating notification with `authorizationStatus: Denied`. Delete/fix that app. Done — no reboot, no database wipe.

## 📚 What this hunt actually teaches

**Empty output is only evidence if the command actually ran.** `2>/dev/null` turns failures into false negatives — the most expensive kind, because they close doors that were open. Never suppress stderr on the *first* run of a diagnostic. And beware shell builtins shadowing real binaries: `log`, `time`, `stat`, `print`. When in doubt, `command -v` or the absolute path.

**A stack trace names the mechanism, not the owner.** Before acting on a class name in a stack, ask: *who can instantiate this?* If the answer is "anyone," go find attribution data — logs, records, receipts — before executing suspects.

**Measure with counters, not snapshots.** `top -l 1` lied to us mid-hunt, showing 0.0% for a fully pinned process (the first `top` sample has no interval to diff against). The measurement that never lies: read the process's cumulative CPU time, sleep N seconds, read it again. A monotonic counter differenced over wall-clock time cannot be fooled.

**Uninstalled ≠ gone, and denied ≠ deleted.** Apps leave scheduled notifications, calendar events, and login items behind like fingerprints. And denying a permission doesn't purge the requests that permission would have served — it can, apparently, turn them into tiny perpetual-motion machines.

**And the meta-lesson:** the breakthrough came from the person who said *"did you actually try the log?"* — re-running a supposedly exhausted avenue and refusing to trust a silent result. The best debugging move of the whole session wasn't a clever command. It was skepticism about a negative.

> ⚠️ **Warning:** if your Mac is hot and `usernoted` is at the top of Activity Monitor's CPU tab, don't start by deleting notification databases the internet tells you about — half of them are empty decoys. Start with `/usr/bin/log show --predicate 'process == "usernoted"' --last 5m --info` and let the daemon tell you, in its own words, who is wasting its life.

---

*Epilogue: the underlying infinite loop — `Calendar.nextDate(matching:)` hanging forever on unsatisfiable components — is Apple's bug; no app data should be able to do that to a system daemon. Reported via Feedback Assistant. The re-engagement notifications that never gave up? Those are on the app. There's something poetic about an app whose parting gift, after being ignored, was to quietly cook the machine it lived on.*
