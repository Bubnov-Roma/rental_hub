rental_hub/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── (marketing)/       
│   │   │   └── page.tsx            # public page
│   │   ├── equipment/
│   │   │   └── [id]/page.tsx       # public page
│   │   ├── booking/
│   │   │   └── [id]/page.tsx      # public pages
│   │   ├── (dashboard)/            # User page ( private page )
│   │   ├── (admin)/                # Admin-panel ( private page )
│   │   ├── api/                    # API endpoints
│   │   │   └── bookings/route.ts
│   │   ├── layout.tsx              # Root layout
│   │   └── page.tsx                # main page
│   ├── components/                 # Components
│   │   ├── core/                   # Business-components (Pure)
│   │   │   ├── EquipmentCard/EquipmentCard.tsx
│   │   │   ├── Filters/Filters.tsx
│   │   │   ├── CategoriesGrid.tsx 
│   │   │   └── EquipmentGrid.tsx 
│   │   ├── forms/
│   │   │   ├── AuthForm.tsx
│   │   │   ├── form-utils.ts   
│   │   │   ├── index.ts
│   │   │   └── ProfileForm.tsx
│   │   ├── layouts/
│   │   │      ├── HeroSection.tsx   
│   │   │      ├── HowItWorks.tsx
│   │   │      └── Testimonials.tsx
│   │   └── ui/
│   │       ├── button.tsx
│   │       ├── calendar.tsx
│   │       ├── card.tsx
│   │       ├── checkbox.tsx
│   │       ├── dateTimeRangePicker.tsx
│   │       ├── dialog.tsx
│   │       ├── EquipmentCard.tsx
│   │       ├── form.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── popover.tsx
│   │       ├── select.tsx
│   │       ├── separator.tsx
│   │       ├── tabs.tsx
│   │       └── textarea.tsx
│   ├── core/                       # Core (Domain-Driven Design)
│   │   ├── domain/                 # Domain logic
│   │   │    └── entities/ Equipment.ts # Interface
│   │   ├── application/            # Use Cases
│   │   ├── infrastructure/         # External dependencies
│   │   └── shared/                 # Shared utils
│   ├── hooks/                      # Custom hooks
│   │   ├── index.ts
│   │   ├── useEquipment.ts
│   │   └── useEquipmentDetails.ts
│   ├── lib/                        # Configs, clients
│   │   ├── auth.ts
│   │   ├── security.ts
│   │   ├── supabase.ts
│   │   └── utils.ts
│   ├── schemas/
│   │   ├── auth-schema.ts
│   │   └── profile-schema.ts
│   ├── utils/
│   │   └── error-handler.ts
│   ├── stores/                     # Zustand stores
│   └── styles/
│       ├─ tokens.css        ← design-tokens(colors, radius, shadow, glow)
│       ├─ themes.css        ← light / dark themes
│       ├─ effects.css       ← glass, glow, neumorphism
│       ├─ globals.css       ← reset + tailwind base
│       └─ components/
│          ├─ card.module.css
│          ├─ panel.module.css
│          └─ glow.module.css
├── tests/
│   ├── unit/                  # Unit tests
│   ├── integration/           # integration tests
│   └── e2e/                   # Playwright tests
├── prisma/                    # ORM
├── supabase/                  # Supabase 
└── .docs/                     # Documentations