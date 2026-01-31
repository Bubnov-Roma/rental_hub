```erDiagram
    User ||--o{ Booking : places
    User ||--o{ Review : writes
    User {
        uuid id PK
        string email UK
        string name
        string phone
        string avatar_url
        jsonb metadata
        timestamp created_at
        timestamp updated_at
    }
    
    Equipment ||--o{ Booking : includes
    Equipment ||--o{ EquipmentImage : has
    Equipment ||--o{ Review : receives
    Equipment {
        uuid id PK
        string title
        string description
        string category
        decimal price_per_day
        boolean is_available
        jsonb specifications
        timestamp created_at
        timestamp updated_at
    }
    
    Booking ||--o{ BookingItem : contains
    Booking {
        uuid id PK
        uuid user_id FK
        string status
        timestamp start_date
        timestamp end_date
        decimal total_amount
        jsonb metadata
        timestamp created_at
        timestamp updated_at
    }
    
    EquipmentImage {
        uuid id PK
        uuid equipment_id FK
        string url
        integer order_index
    }
    
    Review {
        uuid id PK
        uuid user_id FK
        uuid equipment_id FK
        integer rating
        text comment
        timestamp created_at
    }
    
    Category {
        uuid id PK
        string name
        string slug UK
        string icon
        integer order
    }
```