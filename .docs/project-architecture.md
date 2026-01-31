::: mermaid
graph TB
    subgraph "Presentation Layer"
        UI[UI Components]
        Pages[Next.js Pages]
        API[API Routes]
    end
    
    subgraph "Application Layer"
        Services[Services]
        UseCases[Use Cases]
        Hooks[React Hooks]
    end
    
    subgraph "Domain Layer"
        Entities[Entities/Models]
        ValueObjects[Value Objects]
        DomainServices[Domain Services]
    end
    
    subgraph "Infrastructure Layer"
        Repositories[Repositories]
        External[External APIs]
        DB[(Database)]
    end
    
    UI --> Pages
    Pages --> API
    API --> Services
    Services --> UseCases
    UseCases --> Repositories
    Repositories --> DB
    UseCases --> DomainServices
    DomainServices --> Entities
    

:::