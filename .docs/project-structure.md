rental_hub/
├── 📁 src/
│   ├── 📁 app/                   # Next.js App Router
│   │   ├── 📁 (marketing)/       # Marketing (public pages)
│   │   ├── 📁 (dashboard)/       # User page
│   │   ├── 📁 (admin)/           # Admin-panel
│   │   ├── 📁 api/               # API endpoints
│   │   ├── layout.tsx            # Root layout
│   │   └── page.tsx              # main page
│   ├── 📁 core/                  # Core (Domain-Driven Design)
│   │   ├── 📁 domain/            # Domain logic
│   │   ├── 📁 application/       # Use Cases
│   │   ├── 📁 infrastructure/    # External dependencies
│   │   └── 📁 shared/            # Shared utils
│   ├── 📁 components/            # Components
│   │   ├── 📁 core/              # Business-components (Pure)
│   │   ├── 📁 ui/                # UI components (shadcn/ui)
│   │   └── 📁 layouts/           # Layouts
│   ├── 📁 hooks/                 # Custom hooks
│   ├── 📁 lib/                   # Configs, clients
│   ├── 📁 stores/                # Zustand stores
│   └── 📁 styles/
│       ├─ tokens.css        ← design-tokens(colors, radius, shadow, glow)
│       ├─ themes.css        ← light / dark themes
│       ├─ effects.css       ← glass, glow, neumorphism
│       ├─ globals.css       ← reset + tailwind base
│       └─ 📁 components/
│          ├─ card.module.css
│          ├─ panel.module.css
│          └─ glow.module.css
├── 📁 tests/
│   ├── 📁 unit/                  # Unit tests
│   ├── 📁 integration/           # integration tests
│   └── 📁 e2e/                   # Playwright tests
├── 📁 prisma/                    # ORM
├── 📁 supabase/                  # Supabase 
└── 📁 .docs/                     # Documentations