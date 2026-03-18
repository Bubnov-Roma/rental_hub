linza/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── (admin)/                # Admin-panel ( private page )
│   │   │   ├── layout.tsx  
│   │   │   └── admin/              
│   │   │       └── page.tsx       
│   │   ├── (dashboard)/            # # User page ( private page ) Группа лэйаута (Sidebar и т.д.)
│   │   │   ├── layout.tsx          # Здесь лежит Sidebar и проверка Auth
│   │   │   │
│   │   │   └── dashboard/          # папка dashboard внутри группы
│   │   │       ├── page.tsx        # /dashboard
│   │   │       ├── bookings/       
│   │   │       │   └── page.tsx    # /dashboard/bookings
│   │   │       └── profile/        
│   │   │           └── page.tsx    # /dashboard/profile 
│   │   ├── actions/                # Admin-panel ( private page )
│   │   │   └── auth.ts       
│   │   ├── api/                    # API endpoints
│   │   │   └── bookings/route.ts
│   │   ├── auth/                    # API endpoints
│   │   │   ├── forgot-password/page.tsx       
│   │   │   ├── login/page.tsx    
│   │   │   └── register/page.tsx
│   │   ├── booking/
│   │   │   ├── page.tsx            # public pages Страница каталога (/equipment)
│   │   │   └── [id]/
│   │   │       └── page.tsx        # Страница товара (/equipment/123)
│   │   ├── equipment/
│   │   │   └── [id]/page.tsx       # public page
│   │   ├── pricing/
│   │   │   └── page.tsx            # /pricing
│   │   │
│   │   ├── how-it-works/
│   │   │   └── page.tsx            # /how-it-works
│   │   ├── global.css
│   │   ├── layout.tsx              # Root layout
│   │   └── page.tsx                # main page
│   ├── components/                 # Components
│   │   ├── admin/                  
│   │   │   ├── AdminHeader.tsx
│   │   │   └── AdminSidebar.tsx
│   │   ├── core/                   # Business-components (Pure)
│   │   │   ├── EquipmentCard/EquipmentCard.tsx
│   │   │   ├── Filters/Filters.tsx
│   │   │   ├── CategoriesGrid.tsx 
│   │   │   └── EquipmentGrid.tsx 
│   │   ├── dashboard/
│   │   │   └── Sidebar.tsx
│   │   ├── forms/
│   │   │   ├── AuthForm.tsx
│   │   │   ├── form-utils.ts   
│   │   │   ├── index.ts
│   │   │   └── ProfileForm.tsx
│   │   ├── layouts/
│   │   │      ├── Footer.tsx   
│   │   │      ├── Header.tsx
│   │   │      ├── HeroSection.tsx   
│   │   │      ├── HowItWorks.tsx
│   │   │      ├── Testimonials.tsx
│   │   │      └── UserMenu.tsx
│   │   ├── shared/
│   │   │   └── SignOutButton.tsx
│   │   └── ui/
│   │       ├── alert-dialog.tsx
│   │       ├── button.tsx
│   │       ├── calendar.tsx
│   │       ├── card.tsx
│   │       ├── checkbox.tsx
│   │       ├── dateTimeRangePicker.tsx
│   │       ├── dialog.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── EquipmentCard.tsx
│   │       ├── form.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── popover.tsx
│   │       ├── select.tsx
│   │       ├── separator.tsx
│   │       ├── sonner.tsx
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
│   │   ├── useAuth.ts
│   │   ├── useEquipment.ts
│   │   └── useEquipmentDetails.ts
│   ├── lib/                        # Configs, clients
│   │   ├── prisma/
│   │   │   └── prisma.ts
│   │   └── supabase/
│   │       ├── client.ts
│   │       ├── middleware.ts
│   │       └── server.ts
│   ├── providers/ 
│   │   ├── auth-provider.ts
│   │   └── unsaved-changes-guard.ts
│   ├── schemas/
│   │   ├── auth-schema.ts
│   │   └── profile-schema.ts
│   ├── state/                      # Zustand stores
│   │   └── use-unsaved-changes.ts
│   ├── styles/
│   │   ├─ tokens.css        ← design-tokens(colors, radius, shadow, glow)
│   │   ├─ themes.css        ← light / dark themes
│   │   ├─ effects.css       ← glass, glow, neumorphism
│   │   ├─ globals.css       ← reset + tailwind base
│   │   └─ components/
│   │      ├─ card.module.css
│   │      ├─ panel.module.css
│   │      └─ glow.module.css
│   ├── utils/
│   │   ├── utils.ts
│   │   ├── index.ts
│   │   └── error-handler.ts
│   └── proxy.ts               # Next 16.0.10 middleware file
├── tests/
│   ├── unit/                  # Unit tests
│   ├── integration/           # integration tests
│   └── e2e/                   # Playwright tests
├── prisma/                    # ORM
├── scripts/ 
└── .docs/                     # Documentations