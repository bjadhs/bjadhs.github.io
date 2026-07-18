// Blog post data — metadata + inline markdown content.
// Inlined (like projects.js) so it works on file:// and GitHub Pages with no fetch/CORS.
// Rendered to HTML by the tiny markdown parser in post.js.

const blogPosts = [
  {
    id: "the-usernoted-hunt",
    title: "The Notification That Ate My MacBook: A Debugging Story",
    date: "2026-07-15",
    readingTime: "9 min read",
    category: "Debugging",
    icon: "fa-bug",
    excerpt:
      "How a deleted-in-the-end time-tracking app pinned a macOS daemon at 99% CPU for who knows how long — and how every “obvious” fix failed before a one-line log command cracked it open.",
    content: `*How a deleted-in-the-end time-tracking app pinned a macOS daemon at 99% CPU for who knows how long — and how every "obvious" fix failed before a one-line log command cracked it open.*

---

## 📖 It started with the wrong question

"My Mac is heating up. What's using all the RAM?"

That's how it began — a warm laptop, a whirring fan, and the completely reasonable assumption that memory was the villain. It's the question everyone asks, and it's almost always the wrong one.

Thirty seconds of \`ps\` and \`memory_pressure\` later, the RAM theory was dead: **65% free memory, zero swap used**. Nothing was starving. But sorting processes by CPU instead of memory turned up something strange sitting quietly at the top:

\`\`\`
 99.7  36928   635  /usr/sbin/usernoted
\`\`\`

\`usernoted\`. The macOS notification daemon. A background process whose entire job is to pop little banners in the corner of your screen — burning **an entire CPU core, continuously**, while using a laughable 16 MB of RAM.

That was the heat. Not Chrome with its forty tabs. Not VS Code. A system daemon nobody has ever consciously interacted with.

📝 Note: heat is a CPU problem wearing a RAM costume. Fans respond to power draw, and power draw follows CPU cycles. When a machine runs hot, sort by CPU first.

## 🐛 The two-second respawn

The classic move — \`killall usernoted\` — worked for exactly two seconds. The daemon relaunched (they always do; \`launchd\` sees to that) and was back at 97% before the shell prompt returned.

That respawn told us something important: this wasn't a transient glitch or a stuck request. Something *persistent* — data sitting on disk — was feeding the spin. Kill the process all you want; it reloads the same poison on every boot.

So the question changed from "what process?" to "what data?"

## 🔍 Reading the daemon's mind

macOS ships a wonderful and underused tool called \`sample\`, which snapshots a process's call stacks. Pointed at the spinning daemon, it returned the smoking mechanism in beautiful, damning detail:

\`\`\`
-[UNCalendarNotificationTrigger nextTriggerDateAfterDate:withRequestedDate:]
  Calendar.nextDate(after:matching:options:)
    Calendar._enumerateDatesStep(...)
      Calendar.dateAfterMatchingWeekOfYear(...)
\`\`\`

Translation: somewhere in the notification store sat a **scheduled repeating notification** whose date rule the system could not resolve. Foundation's calendar engine was trying to compute "when does this fire next?" — and looping *forever* on the week-of-year component. Not crashing. Not erroring. Just spinning, politely and eternally, at 99%.

We had the murder weapon. We did not have the murderer.

## ❌ The graveyard of reasonable theories

Here's where the hunt got humbling. The stack trace screamed "calendar," so we did what any sane person would do — we went after calendar data. One suspect at a time, with a proper measurement after each kill (more on that later):

**Suspect #1: A Google account synced to Calendar.** Google-synced recurring events with exotic rules are a known source of cursed date math. Removed the account. *Still pinned at 96%.*

**Suspect #2: Calendar.app's notification toggle.** Flipped off in System Settings. *Still pinned.* (And a lesson hiding inside: the toggle suppresses *delivery* — it doesn't unschedule triggers already sitting in the store.)

**Suspect #3: A suspect calendar, deleted outright.** *Still pinned.*

**Suspects #4–6: Three leftover calendars from old task-manager apps**, unsubscribed in one sweep. Task and todo apps that "integrate with Apple Calendar" love writing recurring events with alerts, and uninstalling the app leaves the events behind. A genuinely great theory. *Still pinned.*

**Suspect #7: The "Work" calendar itself**, exported to \`.ics\` and grepped for \`BYWEEKNO\` — the one recurrence keyword that maps exactly onto the week-of-year loop in the stack. Ninety-three events, every recurrence rule bounded and boring. *Clean.*

Meanwhile, every attempt to just *read the notification store directly* hit a wall. The legacy database at \`com.apple.notificationcenter/db2/db\`? **Zero bytes** — deprecated, empty, a decoy that half the internet's fix-it guides still tell you to delete. The real store? Locked behind macOS's privacy walls, unreadable even after granting Full Disk Access, because the Calendar data sits behind its *own* separate permission category.

Six suspects. Six alibis. The daemon spun on, byte-for-byte the same stack trace, as if mocking the entire investigation.

## 💡 The one-line command that broke the case

At this point the user — tired of watching calendars get executed for crimes they didn't commit — made a simple suggestion:

> "Did you try \`log show --predicate 'process == "usernoted"' --info --last 5m\`? Check once."

I had. Hours earlier. It had returned *nothing*, and I'd written the log avenue off.

Except — it hadn't returned nothing. It had **never run at all**.

Running it this time, without error-suppression, the shell coughed up the truth:

\`\`\`
(eval):log:1: too many arguments
\`\`\`

The session shell was **zsh**, and zsh has a *builtin* command named \`log\` — an ancient login-watching utility — which had been silently shadowing \`/usr/bin/log\` the entire time. Every one of my earlier log queries had failed instantly, and my tidy little \`2>/dev/null\` had swallowed the error, converting "command failed" into "logs are empty." I had abandoned the single most direct diagnostic in the toolbox because of a name collision and my own muffler on stderr.

One character path fix — \`/usr/bin/log show ...\` — and the culprit was on screen in under five seconds:

\`\`\`
NotificationRecord app:"com.glimsoft.Timelines"
  req:"Timelines-engagement-longtail-one"
  category:"GSNotificationCategory_Reengagement"
  ...authorizationStatus: Denied...
\`\`\`

Repeated. **Dozens of times per second.**

## 🎯 The culprit: a nag that couldn't take no for an answer

**Timelines** — a time-tracking app, long forgotten, still sitting in \`/Applications\`, not even running — had at some point scheduled two repeating "re-engagement" notifications. The names say everything: \`engagement-longtail-one\` and \`engagement-longtail-two\`. These are the "hey, come back and use me!" nags that growth teams schedule far into the future.

And here's the poison pill: at some point, the user had **denied** the app notification permission. Perfectly normal thing to do. But the scheduled requests didn't get cleaned up — they stayed in the daemon's store, repeating triggers for notifications that could never be shown. So \`usernoted\` sat in an eternal cycle: compute the next fire date (spinning through the pathological week-of-year path), attempt delivery, get refused by the permission system, reschedule, repeat. Forever. On every boot.

Not a calendar event. Not a Google sync artifact. A **re-engagement notification from an unused app, colliding with a denied permission**, feeding a genuine infinite-loop bug in Apple's date-matching code.

The trap in the stack trace, in hindsight: \`UNCalendarNotificationTrigger\` is the API class *any* app uses to schedule a date-based local notification. The word "calendar" in the class name refers to calendar *math*, not Calendar-the-app. The stack named the mechanism precisely and pointed at the owner not at all — and we spent hours interrogating the app whose name happened to match.

## ✅ The kill, verified

Delete \`/Applications/Timelines.app\`. Restart the daemon. Measure:

\`\`\`
before:  8.0s of CPU time per 8s window   (~99%, sustained, every boot)
after:   0.38s total, zero growth          (idle)
loop frames in stack sample: 0
\`\`\`

Fan quiet. Lap cool. Case closed.

## 📚 What this hunt actually teaches

**Empty output is only evidence if the command actually ran.** \`2>/dev/null\` turns failures into false negatives — the most expensive kind, because they close doors that were open. Never suppress stderr on the *first* run of a diagnostic. And beware shell builtins shadowing real binaries: \`log\`, \`time\`, \`stat\`, \`print\`. When in doubt, \`command -v\` or the absolute path.

**A stack trace names the mechanism, not the owner.** Before acting on a class name in a stack, ask: *who can instantiate this?* If the answer is "anyone," go find attribution data — logs, records, receipts — before executing suspects.

**Measure with counters, not snapshots.** \`top -l 1\` lied to us mid-hunt, showing 0.0% for a fully pinned process (the first \`top\` sample has no interval to diff against). The measurement that never lies: read the process's cumulative CPU time, sleep N seconds, read it again. A monotonic counter differenced over wall-clock time cannot be fooled.

**Uninstalled ≠ gone, and denied ≠ deleted.** Apps leave scheduled notifications, calendar events, and login items behind like fingerprints. And denying a permission doesn't purge the requests that permission would have served — it can, apparently, turn them into tiny perpetual-motion machines.

**And the meta-lesson:** the breakthrough came from the person who said *"did you actually try the log?"* — re-running a supposedly exhausted avenue and refusing to trust a silent result. The best debugging move of the whole session wasn't a clever command. It was skepticism about a negative.

⚠️ Warning: if your Mac is hot and \`usernoted\` is at the top of Activity Monitor's CPU tab, don't start by deleting notification databases the internet tells you about — half of them are empty decoys. Start with \`/usr/bin/log show --predicate 'process == "usernoted"' --last 5m --info\` and let the daemon tell you, in its own words, who is wasting its life.

---

*Epilogue: the underlying infinite loop — \`Calendar.nextDate(matching:)\` hanging forever on unsatisfiable components — is Apple's bug; no app data should be able to do that to a system daemon. Reported via Feedback Assistant. The re-engagement notifications that never gave up? Those are on Glimsoft. There's something poetic about an app whose parting gift, after being ignored, was to quietly cook the machine it lived on.*`,
  },
  {
    id: "vibe-coding-harness-engineering",
    title: "Vibe Coding, Done Seriously: Harness Engineering Beyond the CLI",
    date: "2026-07-16",
    readingTime: "11 min read",
    category: "AI Engineering",
    icon: "fa-terminal",
    excerpt:
      "“Vibe coding” gets dismissed as autocomplete with vibes. Done properly it's the opposite — reading every concept, plan, and turn of the conversation, then building a harness of skills, MCP, logging, and a self-growing wiki on top of whatever CLI you use.",
    content: `"Vibe coding" gets used two ways. One is the lazy version: accept the autocomplete, run it, hope. The other — the one that actually ships production software — is a discipline. It means steering a capable model with so much context and structure that the *vibe* is just the surface; underneath is an engineered system. This is a deep dive into the serious version.

## 🧭 The uncomfortable truth: you get out what you put in

The single biggest predictor of output quality isn't the model. It's how much of the *thinking* you let the model see. Skim the plan and rubber-stamp it, and you inherit whatever the model guessed. Read every concept, every plan, every turn of the conversation — and correct the small wrong assumptions early — and the quality compounds.

> The people getting mediocre results aren't using worse models. They're reading less. They approve plans they didn't understand and merge diffs they didn't trace.

📝 Note: treat the model's plan like a junior engineer's design doc. If you can't restate why each step exists, you're not ready to approve it — and the cheapest place to catch a wrong assumption is in the plan, not the diff.

## 🧱 The CLI is the floor, not the ceiling

Claude Code, Codex, OpenCode, Cursor's CLI — these give you a capable agent loop: read files, run tools, edit code, observe results. That's the *floor*. The teams pulling ahead treat the base agent as a substrate and build a harness on top of it. Three layers do most of the work:

- **Skills** — packaged, reusable instructions for recurring tasks (a deploy runbook, a review checklist, a repo-specific workflow). The model stops re-deriving how you do things every session.
- **MCP** — a typed bridge to your real systems: the database, the ticket tracker, the browser, the internal API. The agent stops guessing about state it could just *read*.
- **Harness engineering** — the glue you write around the agent: logging, memory, verification gates, and a knowledge base that outlives any single session.

## 🔌 MCP: stop guessing at state you can read

Most bad agent output is a confident guess about something knowable. Which columns does that table have? What did the failing test actually print? Is that feature flag on in staging? An MCP server turns each of those from a guess into a lookup.

\`\`\`
agent  ──▶  MCP server  ──▶  Postgres / GitHub / browser / internal API
       ◀──   typed result ◀──
\`\`\`

The payoff isn't magic; it's boring and enormous: the agent operates on facts. A schema it queried instead of imagined. A log line it read instead of assumed. Every source of ground truth you wire in removes a whole class of hallucination.

## 🗂️ Harness engineering: the part nobody demos

Here's where "vibe coding" stops being a vibe. The differentiator is the scaffolding you build *around* the agent — the stuff that never shows up in a flashy demo but decides whether the thing is trustworthy on day 90.

**Logging your own runs.** Keep a per-project log of what was attempted, what worked, and — critically — what *didn't*. A running \`WrongWayRight.md\` of "the first approach was wrong, here's the better one, here's why" is worth more than any amount of clever prompting. It stops you and the model from re-walking dead ends.

**A self-growing wiki.** The most underrated move is having the agent maintain its own knowledge base: one fact per note, linked to related notes, indexed so it loads next session. Over weeks it becomes a map of your system that the model helped draw and now reads from. The wiki compounds — each session starts smarter than the last because it inherits what the previous one learned.

\`\`\`
session 1  ─▶  writes notes ─▶  wiki
session 2  ─▶  reads wiki + writes notes ─▶  wiki
session 3  ─▶  reads a smarter wiki ...  (context compounds)
\`\`\`

💡 Tip: the wiki should record what was *non-obvious* — the constraint that isn't in the code, the reason a tempting approach fails. Don't log what the repo already tells you; log what it took a session to learn.

## 🔁 The loop that actually produces quality

Put together, the serious version of vibe coding is a loop, not a one-shot:

- **Frame** the task and let the model plan — then read the plan and correct assumptions.
- **Ground** it with MCP so it acts on real state, not guesses.
- **Execute** in small, reviewable steps; trace every diff you approve.
- **Verify** by driving the actual behavior, not just green tests.
- **Record** the wrong turns and the hard-won facts into your logs and wiki.
- **Repeat** — and the harness makes the next pass start further ahead.

⚠️ Warning: the failure mode of vibe coding isn't the model writing bad code — it's you shipping code you never understood. Speed without comprehension is a loan against future debugging, and the interest rate is brutal. The harness exists to keep comprehension cheap, not to replace it.

## 🎯 The takeaway

The base CLI makes an agent *capable*. Skills make it *consistent*. MCP makes it *grounded*. And the harness you build — logs, verification, a wiki that grows — makes it *trustworthy over time*. "Vibe coding" isn't the absence of engineering. Done seriously, it's engineering the environment the model works in, then reading closely enough to steer it. The vibe is real. It's just sitting on top of a lot of deliberate structure.`,
  },
  {
    id: "rag-that-doesnt-hallucinate",
    title: "Building a RAG Pipeline That Doesn't Hallucinate Your Docs",
    date: "2026-06-28",
    readingTime: "7 min read",
    category: "AI Engineering",
    icon: "fa-robot",
    excerpt:
      "Retrieval-augmented generation is easy to demo and hard to trust. Here are the three failure modes that quietly wreck answer quality — and the guardrails that fixed them.",
    content: `Retrieval-augmented generation looks trivial in a tutorial: embed your docs, stuff the top matches into a prompt, done. Then you ship it, and the model confidently cites a policy that doesn't exist. Here's what actually moves the needle from "cute demo" to "answers you'd put your name on."

## 🧩 Chunking is a product decision, not a default

The first instinct is to split on a fixed character count. Don't. A 512-character window happily cuts a table in half or severs a sentence from the heading that gives it meaning.

\`\`\`js
// Naive — splits mid-thought
const chunks = splitEvery(text, 512);

// Better — respect structure, then size
const chunks = splitByHeadings(text)
  .flatMap((section) => packByTokens(section, { max: 400, overlap: 60 }));
\`\`\`

Overlap matters more than people expect. A 15% overlap keeps the sentence that answers the question from falling into the gap between two chunks.

📝 Note: measure retrieval quality *before* you touch the model. If the right chunk isn't in the top-k, no amount of prompt engineering will save the answer.

## 🎯 Ground every claim or refuse

The single highest-leverage change: instruct the model to answer *only* from the retrieved context, and to say "I don't have that" when the context is silent.

> You are answering strictly from the provided sources. If the answer is not in the sources, say you don't know. Never invent policy, numbers, or names.

Pair that with **inline citations** back to the source chunk. The moment every sentence has to point at a retrieved passage, hallucinations become visible — and rare.

## 🔍 Rerank before you trust the top-k

Vector similarity is a coarse filter. Cosine distance will happily rank a keyword-matching but irrelevant chunk above the one that actually answers the question. A lightweight cross-encoder reranker over the top 20 candidates, keeping the best 5, consistently bought me the biggest accuracy jump for the least code.

\`\`\`
retrieve top 20 (cheap, fast)  →  rerank (accurate, slower)  →  keep top 5
\`\`\`

## ✅ The scorecard that keeps you honest

Ship an eval set of real questions with known answers, and run it on every change:

- **Retrieval hit rate** — is the right chunk in the top-k?
- **Faithfulness** — is every claim supported by a retrieved passage?
- **Refusal accuracy** — does it say "I don't know" when it should?

⚠️ Warning: don't tune your pipeline against the same three questions you demoed with. A pipeline that aces the demo and fails the eval set is the default outcome, not the exception.

RAG isn't hard because the model is weak. It's hard because retrieval is a search problem wearing a generation costume — and search problems reward measurement over vibes.`,
  },
  {
    id: "dependency-free-portfolio",
    title: "From file:// to Production: Keeping a Portfolio Dependency-Free",
    date: "2026-06-10",
    readingTime: "5 min read",
    category: "Frontend",
    icon: "fa-code",
    excerpt:
      "No framework, no build step, no node_modules. Why this site is still plain HTML, CSS, and JavaScript — and the small patterns that make that scale further than you'd think.",
    content: `Every few months I'm tempted to rewrite this portfolio in the framework of the season. I never do, and the reasons have gotten more convincing over time. Here's the case for staying vanilla — and the patterns that make it hold up.

## 📦 The build step you don't have can't break

There's no \`npm install\`, no bundler config, no lockfile drift. I can open \`index.html\` with a double-click and it just works — the exact same file that ships to production. That property is worth more than it sounds:

- The site opens over \`file://\` *and* over HTTPS with zero changes.
- There's nothing to keep up to date, so link rot and CVE churn simply don't apply.
- A future me (or an AI agent) can read the whole thing top to bottom in one sitting.

📝 Note: "no build step" only stays true if you refuse to reach for tools that require one. The discipline is the feature.

## 🧱 Data as a plain JS array

Instead of a CMS, content lives in a small data file the browser loads directly:

\`\`\`js
const projects = [
  { id: "hiday", title: "Hiday", tags: ["Next.js", "Supabase"] },
  // ...
];
\`\`\`

The listing page renders cards from it; a detail page reads \`?id=\` from the URL and renders the matching entry. Adding content means editing an array — no database, no admin panel, no deploy pipeline beyond \`git push\`.

## 🎨 Theme with CSS variables, switch with one class

Light and dark mode is a set of custom properties and a single toggled class on \`<body>\`:

\`\`\`css
:root        { --bg: #f8fafc; --text: #1e293b; }
body.dark-theme { --bg: #0f172a; --text: #f8fafc; }
\`\`\`

Every component reads \`var(--bg)\` and \`var(--text)\`, so the entire site re-themes from one checkbox. No context provider, no re-render, no flash.

## ✅ When would I actually reach for a framework?

Honestly — when there's shared, interactive state that outgrows the DOM: a dashboard with live data, optimistic updates, real-time sync. For a content site that's mostly read, the framework is overhead I'd be paying to solve problems I don't have.

⚠️ Warning: "vanilla" is not a virtue by itself. The moment you're hand-rolling a reactive state system in plain JS, you've rebuilt a framework badly — that's the signal to adopt a real one.

The best stack is the one whose failure modes you never have to think about. For a portfolio, that's still a folder of files.`,
  },
];
