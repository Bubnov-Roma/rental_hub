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
│   └── 📁 styles/                # Styles
├── 📁 tests/
│   ├── 📁 unit/                  # Unit tests
│   ├── 📁 integration/           # integration tests
│   └── 📁 e2e/                   # Playwright tests
├── 📁 prisma/                    # ORM
├── 📁 supabase/                  # Supabase 
└── 📁 .docs/                     # Documentations