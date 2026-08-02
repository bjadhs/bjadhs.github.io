const projectsData = [
  {
    "id": "ember-on-toorak",
    "title": "Ember on Toorak",
    "shortDescription": "A full-stack luxury restaurant platform with scroll-driven animations, dynamic menu, real-time reservations, and an AI-powered chat concierge backed by a role-protected admin dashboard.",
    "fullDescription": "Ember on Toorak is a full-stack luxury restaurant platform built for an upscale fire-driven steakhouse in Melbourne. The site delivers a cinematic brand experience with scroll-driven animations, a dynamic menu system, real-time reservations, and an AI-powered chat concierge — all backed by a role-protected admin dashboard.\n\nEvery design decision balances visual storytelling with operational utility: guests get an immersive, smooth-scrolling experience while staff manage menus, bookings, and job listings from a single authenticated interface.\n\nThe architecture follows a modern serverless pattern — Next.js 15 App Router handles SSR and API routes, Prisma ORM connects to Neon Postgres over HTTP, and Clerk secures admin access with JWT-based role enforcement. I implemented transactional email flows via SendGrid, built an AI chat widget using the Vercel AI SDK with OpenAI tool calling, and designed a multi-theme CSS system with runtime switching. Security was treated as a first-class concern: CSP headers, HSTS in production, and strict middleware gating on all admin endpoints.",
    "techStack": ["Next.js 15", "React 19", "TypeScript", "Tailwind CSS v4", "Neon Postgres", "Prisma ORM", "Clerk", "Framer Motion", "Lenis", "Vercel AI SDK", "OpenAI API", "SendGrid", "React Email", "Zod", "Zustand"],
    "images": [
      "./images/emberontoorak/home_main_theme.webp",
      "./images/emberontoorak/menu_green.webp",
      "./images/emberontoorak/booking_pink.webp",
      "./images/emberontoorak/chat_brown.webp",
      "./images/emberontoorak/reservation_brown.webp",
      "./images/emberontoorak/reservation_light.webp",
      "./images/emberontoorak/light.webp"
    ],
    "projectUrl": "https://emberontoorak.vercel.app/",
    "githubUrl": null
  },
  {
    "id": "hiday",
    "title": "Hiday",
    "shortDescription": "Time tracking that doesn't look like a spreadsheet.",
    "fullDescription": "Hiday brings a neo-brutalist design edge to personal productivity — thick borders, sharp shadows, and bold violet-on-amber theming in both light and dark modes. One-tap tracking, advanced analytics (pie charts, bar charts, trend lines), flexible tagging, and goal streaks across iOS, Android, and web. Built for people who want their tools to work hard and look good doing it.",
    "techStack": ["Next.js 16", "React 19", "Tailwind CSS v4", "Supabase", "Zustand", "React Query", "shadcn/ui", "Radix UI", "Lucide"],
    "images": [
      "./images/hiday/home.webp",
      "./images/hiday/tasks.webp",
      "./images/hiday/task.webp",
      "./images/hiday/session.webp",
      "./images/hiday/timeline.webp",
      "./images/hiday/settings.webp",
      "./images/hiday/auth.webp"
    ],
    "projectUrl": "https://hiday-one.vercel.app/",
    "githubUrl": null
  },
  {
    "id": "anytomd",
    "title": "AnyToMD",
    "shortDescription": "A local-first workspace that turns PDFs, DOCX, and handwriting into clean Markdown — then refines, translates, and renders the result, all on your own machine against your own API keys.",
    "fullDescription": "AnyToMD is a local-first workspace that turns documents into Markdown — and then does something useful with the result. Everything runs on your own machine against your own API keys; files never leave the box unless you point a step at a hosted model yourself.\n\nConvert. Drop in a PDF or DOCX and get clean Markdown back. PDFs go through a confidence ladder — direct text extraction first, falling back to OCR when a page turns out to be scanned or image-only — while DOCX is converted structurally, tables included. Converted output streams into the page as it is produced, and can be refined afterwards with an AI pass.\n\nRead handwriting. Photograph a handwritten page and have a vision model transcribe it, then correct the transcription against your own reference samples so the model learns the quirks of one particular hand.\n\nWork in Nepali. A dedicated studio for Devanagari source material: extract entities, draft and revise long-form stories through a multi-stage pipeline, keep prompts and evaluations under version control, and render finished pieces into narrated video runs.\n\nGenerate media. Text-to-video and text-to-image lanes are backed by a curated catalogue of hosted models, each with its capabilities and real measured per-generation cost recorded up front, so you can see what a job will cost before you run it. Completed jobs are kept in a browsable history with their prompts, settings, and actual spend.\n\nKeep a library. Everything produced lands in one searchable place, tagged and re-openable, rather than scattered across download folders.\n\nThree pieces run side by side: a Next.js web application, which is the whole user interface and the API surface; a Python conversion service, which handles PDF text extraction and OCR; and a set of shared TypeScript packages for the AI provider plumbing and DOCX handling.\n\nModel choices are not baked in. Each task — transcription, description, revision — is a named role, and any role can be re-pointed at a different local or hosted model from the interface, without a restart. Local models are preferred where they are good enough; hosted ones are there for the jobs that need them.",
    "techStack": ["Next.js", "TypeScript", "Python", "Ollama", "OpenRouter", "OCR"],
    "images": [
      "./images/anytomd/anytomd1.webp",
      "./images/anytomd/anytomd2.webp",
      "./images/anytomd/anytomd3.webp",
      "./images/anytomd/anytomd4.webp"
    ],
    "projectUrl": null,
    "githubUrl": null
  },
  {
    "id": "floating-notes",
    "title": "FloatingNotes",
    "shortDescription": "An always-on-top macOS panel holding Markdown notes, todos, a per-note focus timer, and one-click Claude CLI agent runs — stored as ordinary files you own, with no database or account.",
    "fullDescription": "FloatingNotes is a desktop app (Electron + React) that lives as a compact panel floating above whatever I'm working in — an editor, a browser, a fullscreen video call. It is four tools that happen to share one window, because in practice they're the same activity: plain Markdown notes grouped into color-coded projects; todos, where any note flips into a structured checklist and back losing nothing; per-note focus tracking, so time is attributed to the thing it was spent on; and command presets — saved Claude CLI prompts that run against a project directory.\n\nEverything is stored as ordinary files in ~/Documents/FloatingNotes — one .md per note, one folder per project. No database, no account, no sync service. If the app disappeared tomorrow, the notes are still readable in any text editor.\n\nEvery tool I tried solved a quarter of the problem and forced a context switch for the rest. The window itself was the first problem: notes apps live in the dock, behind whatever I'm actually doing, and the act of switching to them is enough friction that the thought is gone by the time I get there. So the window floats at screen-saver level — above fullscreen apps, visible on all Spaces — and collapses to a 72px draggable icon when I want it out of the way but not gone. Minimize and restore keep the same corner anchored, so the window never wanders across the screen over a day of use.\n\nNotes and tasks are the same object. In every other tool they're separate apps with separate inboxes. Here a note becomes a todo list by toggling a mode: the app inserts a sentinel comment and rewrites the bullets as GFM task lines. Toggle it back and you get prose again. Checked state lives in the Markdown itself, so there's no second source of truth to drift out of sync — and the file is still a normal file the whole time.\n\nTime needs to attach to work, not to a separate timer app. A pomodoro that doesn't know what you were doing produces a number you can't act on. Here the timer starts on a note, banks its minutes against that note, survives an app restart mid-session, and rolls up into daily and 30-day charts. Duration is displayed in pomodoros rather than raw minutes — a unit I can actually plan a day in.\n\nAgents should run where the work is described. I write the prompt in a note, next to the context that produced it. Command presets close that last gap: a saved prompt, a model, and a working directory, launched with one click and streaming results back into the same panel — plus the 5-hour and 7-day usage windows on a bar at the bottom, so I know what's left before starting something long.\n\nOn the notes side: one folder per project and one .md per note in a Finder-visible root you can relocate, with line 1 of the file as the title — no frontmatter, no metadata files to corrupt. Autosave fires half a second after you stop typing and on blur. There's Markdown preview, rename in place, drag-to-reorder, moving a note between projects, and a done state that dims and collapses completed notes under a divider. Connectors link notes to each other across projects, and a filesystem watcher pushes external edits into the app live, so editing a note in another editor just works.\n\nThe focus timer offers 25/45/60/90m presets with a configurable global pomodoro unit, pause and resume with the in-flight session persisted, an overrun bell every 15 minutes past target, and 12 ambience tracks with sequential or random rotation. Per-note totals and individual run records are editable and deletable — a timer left running overnight shouldn't poison the data.\n\nCommand presets run in two modes. Terminal mode opens a real Terminal.app window with readable output and your normal global Claude config, for runs you want to watch. In-app headless mode spawns claude with stream-json output, parses the NDJSON live into the panel, and settles with the final answer plus session id, duration, and cost — cancellable mid-run, resumable afterwards in either mode. One safety detail worth naming: neither mode ever interpolates user text into a shell line. The Terminal path writes the prompt, model, cwd, and description to temp files and generates a script that reads them back, so no metacharacter is ever interpreted; the headless path passes an argv array with shell disabled.\n\nThe architecture is two processes joined by exactly one seam. The main process handles the filesystem, projects, settings, Claude CLI spawning and stream parsing, AppleScript automation, and window management; preload declares the entire contract as a documented contextBridge surface; a single Zustand store holds all app state; pure dependency-free logic lives in its own directory; and Zod schemas validate everything crossing the IPC boundary.\n\nTwo decisions carry most of the design. Files are the source of truth, not app state — notes are Markdown, todo checked-state is the checkbox in the line, and order and completion live in sidecar JSON next to the notes, so nothing needs migrating because there's no schema to migrate. And every IPC response is parsed with Zod before it reaches state, with field-level catches rather than object-level ones — so one malformed value degrades to its default instead of collapsing the whole object. That distinction is load-bearing: an object-level catch on the settings schema would have silently wiped every saved preset and API key on a single bad field.\n\nAn Electron app is two processes, and screenshotting the real window needs a screen-recording permission the build process doesn't have — so verification splits along the same seam as the architecture. Renderer changes run in a dev harness: the real store, real components, and real CSS in a plain browser tab against a stubbed API, driven by Playwright reading the DOM and computed styles, which is how a dark-theme contrast bug got caught that a screenshot never would have. Main-process changes are verified in the actual Electron app, because the harness stub is the thing under test there. Pure logic has plain node tests with no DOM at all.\n\nv0.1.0, macOS-only, MIT-licensed, built for one user. No backend, no database, no telemetry.",
    "techStack": ["Electron 43", "React 18", "Vite 6", "Zustand 5", "Zod 4", "dnd-kit", "Playwright", "Claude Code CLI", "Firecrawl", "OpenRouter", "AppleScript", "electron-builder"],
    "images": [
      "./images/floating_notes/fn1.webp",
      "./images/floating_notes/fn2.webp",
      "./images/floating_notes/fn3.webp",
      "./images/floating_notes/fn4.webp"
    ],
    "projectUrl": null,
    "githubUrl": null
  },
  {
    "id": "ecommerce-platform",
    "title": "E-commerce Platform",
    "shortDescription": "A full-featured e-commerce platform with user authentication, product management, cart functionality, and an admin dashboard.",
    "fullDescription": "A production-grade e-commerce platform built from the ground up with a React frontend and Node.js backend. Features include user authentication with Clerk, product catalog with search and filtering, shopping cart with persistent state, order management, and a comprehensive admin dashboard for inventory control.\n\nThe platform supports real-time inventory updates, responsive design for all devices, and a clean UI built with Tailwind CSS. The admin dashboard provides analytics, product CRUD operations, and order fulfillment workflows.",
    "techStack": ["React", "Node.js", "MongoDB", "Clerk"],
    "images": [
      "./images/ecom/ecom1.webp",
      "./images/ecom/ecom2.webp"
    ],
    "projectUrl": "https://ecom.bijbrin.cloud",
    "githubUrl": null
  },
  {
    "id": "memory-game",
    "title": "Memory Game",
    "shortDescription": "A fun memory card game built with React and Tailwind CSS. Test your memory by matching pairs of fruits!",
    "fullDescription": "A fun little memory card game built with React and TailwindCSS. Players test their memory by matching pairs of fruit-themed cards.\n\nFeatures include score tracking for moves and matches, smooth card flip animations with a win celebration, responsive desktop and mobile design, and auto-shuffle for fresh game layouts on every new round.",
    "techStack": ["React", "Tailwind CSS", "Vite"],
    "images": [
      "./images/memory_game/game.webp",
      "./images/memory_game/game1.webp",
      "./images/memory_game/game2.webp"
    ],
    "projectUrl": "https://memory-game-tau-virid.vercel.app/",
    "githubUrl": "https://github.com/bjadhs/memory_game"
  }
];
