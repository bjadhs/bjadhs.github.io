const projectsData = [
  {
    "id": "ember-on-toorak",
    "title": "Ember on Toorak",
    "shortDescription": "A full-stack luxury restaurant platform with scroll-driven animations, dynamic menu, real-time reservations, and an AI-powered chat concierge backed by a role-protected admin dashboard.",
    "fullDescription": "Ember on Toorak is a full-stack luxury restaurant platform built for an upscale fire-driven steakhouse in Melbourne. The site delivers a cinematic brand experience with scroll-driven animations, a dynamic menu system, real-time reservations, and an AI-powered chat concierge — all backed by a role-protected admin dashboard.\n\nEvery design decision balances visual storytelling with operational utility: guests get an immersive, smooth-scrolling experience while staff manage menus, bookings, and job listings from a single authenticated interface.\n\nThe architecture follows a modern serverless pattern — Next.js 15 App Router handles SSR and API routes, Prisma ORM connects to Neon Postgres over HTTP, and Clerk secures admin access with JWT-based role enforcement. I implemented transactional email flows via SendGrid, built an AI chat widget using the Vercel AI SDK with OpenAI tool calling, and designed a multi-theme CSS system with runtime switching. Security was treated as a first-class concern: CSP headers, HSTS in production, and strict middleware gating on all admin endpoints.",
    "techStack": ["Next.js 15", "React 19", "TypeScript", "Tailwind CSS v4", "Neon Postgres", "Prisma ORM", "Clerk", "Framer Motion", "Lenis", "Vercel AI SDK", "OpenAI API", "SendGrid", "React Email", "Zod", "Zustand"],
    "images": [
      "./images/emberontoorak/home_main_theme.jpeg",
      "./images/emberontoorak/menu_green.jpeg",
      "./images/emberontoorak/booking_pink.jpeg",
      "./images/emberontoorak/chat_brown.jpeg",
      "./images/emberontoorak/reservation_brown.jpeg",
      "./images/emberontoorak/reservation_light.jpeg",
      "./images/emberontoorak/light.jpeg"
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
      "./images/hiday/home.jpg",
      "./images/hiday/tasks.jpg",
      "./images/hiday/task.jpg",
      "./images/hiday/session.jpg",
      "./images/hiday/timeline.jpg",
      "./images/hiday/settings.jpg",
      "./images/hiday/auth.jpg"
    ],
    "projectUrl": "https://hiday-one.vercel.app/",
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
    "projectUrl": "https://ecomm-5xbtn.sevalla.app/",
    "githubUrl": null
  },
  {
    "id": "memory-game",
    "title": "Memory Game",
    "shortDescription": "A fun memory card game built with React and Tailwind CSS. Test your memory by matching pairs of fruits!",
    "fullDescription": "A fun little memory card game built with React and TailwindCSS. Players test their memory by matching pairs of fruit-themed cards.\n\nFeatures include score tracking for moves and matches, smooth card flip animations with a win celebration, responsive desktop and mobile design, and auto-shuffle for fresh game layouts on every new round.",
    "techStack": ["React", "Tailwind CSS", "Vite"],
    "images": [
      "./images/memory_game/game.jpg",
      "./images/memory_game/game1.jpg",
      "./images/memory_game/game2.jpg"
    ],
    "projectUrl": "https://memory-game-tau-virid.vercel.app/",
    "githubUrl": "https://github.com/bjadhs/memory_game"
  }
];
