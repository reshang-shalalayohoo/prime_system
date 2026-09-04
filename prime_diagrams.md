# PRIME System — Diagrams

## 1. Database Schema (Entity-Relationship Diagram)

```mermaid
erDiagram
    users {
        INTEGER id PK
        TEXT username UK
        TEXT email UK
        TEXT password_hash
        TEXT full_name
        TEXT role "farmer | admin"
        INTEGER is_active "0 | 1"
        TEXT created_at
        TEXT updated_at
    }

    fields {
        INTEGER id PK
        TEXT name
        TEXT location
        REAL area_hectares
        TEXT crop_type "Default: Palay"
        TEXT growth_stage "Seedling | Vegetative | Reproductive | Ripening"
        INTEGER user_id FK
        INTEGER is_active
        TEXT created_at
        TEXT updated_at
    }

    devices {
        INTEGER id PK
        TEXT device_code UK
        TEXT api_key UK
        TEXT device_name
        INTEGER field_id FK
        TEXT status "online | offline | fault"
        REAL battery_level
        TEXT last_communication
        TEXT created_at
        TEXT updated_at
    }

    sensor_readings {
        INTEGER id PK
        INTEGER device_id FK
        INTEGER field_id FK
        REAL soil_moisture
        REAL water_level
        REAL nitrogen
        REAL phosphorus
        REAL potassium
        INTEGER is_valid
        TEXT raw_data
        TEXT timestamp
    }

    reference_values {
        INTEGER id PK
        TEXT nutrient "nitrogen | phosphorus | potassium"
        TEXT growth_stage
        REAL min_sufficient
        REAL max_sufficient
        TEXT unit "mg/kg"
        INTEGER updated_by FK
        TEXT created_at
        TEXT updated_at
    }

    recommendations {
        INTEGER id PK
        INTEGER sensor_reading_id FK
        INTEGER field_id FK
        TEXT n_status "Deficient | Sufficient | Excess"
        TEXT p_status "Deficient | Sufficient | Excess"
        TEXT k_status "Deficient | Sufficient | Excess"
        TEXT fertilizer_type
        TEXT application_rate
        TEXT recommendation_text
        TEXT created_at
    }

    fertilizer_logs {
        INTEGER id PK
        INTEGER field_id FK
        INTEGER user_id FK
        TEXT fertilizer_type
        REAL amount_kg
        TEXT notes
        TEXT applied_at
        TEXT created_at
    }

    alerts {
        INTEGER id PK
        INTEGER field_id FK
        INTEGER user_id FK
        TEXT type "nutrient_deficiency | nutrient_excess | invalid_reading | device_offline | system"
        TEXT message
        TEXT severity "info | warning | critical"
        INTEGER is_read
        TEXT created_at
    }

    activity_logs {
        INTEGER id PK
        INTEGER user_id FK
        TEXT action
        TEXT entity_type
        INTEGER entity_id
        TEXT details
        TEXT timestamp
    }

    users ||--o{ fields : "owns"
    users ||--o{ fertilizer_logs : "records"
    users ||--o{ alerts : "receives"
    users ||--o{ activity_logs : "performs"
    users ||--o{ reference_values : "configures"
    fields ||--o{ devices : "has"
    fields ||--o{ sensor_readings : "receives"
    fields ||--o{ recommendations : "generates"
    fields ||--o{ fertilizer_logs : "applied to"
    fields ||--o{ alerts : "triggers"
    devices ||--o{ sensor_readings : "sends"
    sensor_readings ||--|| recommendations : "produces"
```

---

## 2. Activity Diagram — Sensor Ingestion Pipeline

This shows the flow from when an ESP32 sensor sends a reading through the complete processing pipeline.

```mermaid
flowchart TD
    Start(["ESP32 Sends<br/>Sensor Reading"]) --> A["Receive HTTP POST<br/>/api/sensors/readings"]
    A --> B{"Validate<br/>Device API Key"}
    B -->|Invalid| R1["Return 401<br/>Unauthorized"]
    B -->|Valid| C["Update Device Status<br/>to Online"]
    C --> D{"Validate Sensor<br/>Reading Values"}
    D -->|Invalid Values| E["Save Reading<br/>(is_valid = false)"]
    E --> F["Create Alert:<br/>Invalid Reading"]
    F --> G["Broadcast via Socket.io<br/>(new-sensor-reading)"]
    G --> R2["Return 201<br/>with Validation Errors"]
    
    D -->|Valid Values| H["Save Reading<br/>(is_valid = true)"]
    H --> I["Fetch SSNM/NOPT<br/>Reference Values for<br/>Growth Stage"]
    I --> J["Classify Each Nutrient"]
    
    J --> J1{"Nitrogen<br/>vs Reference"}
    J1 -->|Below Min| K1["N = Deficient"]
    J1 -->|Within Range| K2["N = Sufficient"]
    J1 -->|Above Max| K3["N = Excess"]
    
    J --> J2{"Phosphorus<br/>vs Reference"}
    J2 -->|Below Min| L1["P = Deficient"]
    J2 -->|Within Range| L2["P = Sufficient"]
    J2 -->|Above Max| L3["P = Excess"]
    
    J --> J3{"Potassium<br/>vs Reference"}
    J3 -->|Below Min| M1["K = Deficient"]
    J3 -->|Within Range| M2["K = Sufficient"]
    J3 -->|Above Max| M3["K = Excess"]
    
    K1 & K2 & K3 & L1 & L2 & L3 & M1 & M2 & M3 --> N["Generate Fertilizer<br/>Recommendation"]
    N --> O["Save Recommendation<br/>to Database"]
    O --> P{"Any Deficient<br/>or Excess?"}
    P -->|Yes| Q["Create Nutrient<br/>Alert(s)"]
    Q --> S["Broadcast via Socket.io<br/>(new-recommendation,<br/>new-alert)"]
    P -->|No| S
    S --> T["Connected Dashboards<br/>Update in Real-Time"]
    T --> R3["Return 201<br/>Success + Recommendation"]

    style Start fill:#22c55e,color:#fff,stroke:none
    style R1 fill:#ef4444,color:#fff,stroke:none
    style R2 fill:#f59e0b,color:#fff,stroke:none
    style R3 fill:#22c55e,color:#fff,stroke:none
    style T fill:#0ea5e9,color:#fff,stroke:none
```

---

## 3. Use Case Diagram

```mermaid
flowchart TB
    subgraph PRIME_System ["🌾 PRIME System"]
        direction TB
        
        subgraph Farmer_UC ["Farmer Use Cases"]
            UC1["View Dashboard<br/>(Real-time Sensor Data)"]
            UC2["View Nutrient Status<br/>(N/P/K Classification)"]
            UC3["View Fertilizer<br/>Recommendations"]
            UC4["Record Fertilizer<br/>Application"]
            UC5["View & Manage Alerts"]
            UC6["View Monitoring Reports<br/>& Statistics"]
            UC7["Login / Logout"]
        end

        subgraph Admin_UC ["Administrator / Researcher Use Cases"]
            UC8["View System Dashboard"]
            UC9["Monitor Devices<br/>(Status, Battery, Comms)"]
            UC10["Configure SSNM/NOPT<br/>Reference Values"]
            UC11["Manage Users<br/>(Create, Activate, Deactivate)"]
            UC12["View Activity Logs<br/>(Audit Trail)"]
            UC13["View System Reports<br/>(Classification Charts)"]
            UC14["Register New Devices"]
            UC15["Login / Logout"]
        end
        
        subgraph System_UC ["Automated System Processes"]
            UC16["Validate Sensor Reading"]
            UC17["Execute SSNM/NOPT<br/>Nutrient Assessment"]
            UC18["Generate Fertilizer<br/>Recommendation"]
            UC19["Create Alerts<br/>(Deficiency/Excess/Offline)"]
            UC20["Broadcast Real-time<br/>Updates (Socket.io)"]
        end
    end

    Farmer(["👨‍🌾 Farmer"]) --> UC1
    Farmer --> UC2
    Farmer --> UC3
    Farmer --> UC4
    Farmer --> UC5
    Farmer --> UC6
    Farmer --> UC7

    Admin(["👩‍💻 Administrator /<br/>Researcher"]) --> UC8
    Admin --> UC9
    Admin --> UC10
    Admin --> UC11
    Admin --> UC12
    Admin --> UC13
    Admin --> UC14
    Admin --> UC15

    ESP32(["📡 ESP32<br/>Sensor Node"]) --> UC16
    UC16 --> UC17
    UC17 --> UC18
    UC18 --> UC19
    UC19 --> UC20
    UC20 --> UC1
    UC20 --> UC8

    style Farmer fill:#22c55e,color:#fff,stroke:none
    style Admin fill:#7c3aed,color:#fff,stroke:none
    style ESP32 fill:#0ea5e9,color:#fff,stroke:none
```

---

## 4. Context Diagram (Level 0 DFD)

```mermaid
flowchart LR
    Farmer(["👨‍🌾 Farmer"])
    Admin(["👩‍💻 Administrator /<br/>Researcher"])
    ESP32(["📡 ESP32<br/>Sensor Node"])

    subgraph PRIME ["🌾 PRIME System"]
        Core["Palay Resource &<br/>Irrigation Monitoring<br/>for Fertilizer Efficiency"]
    end

    ESP32 -->|"Soil moisture, water level,<br/>NPK sensor readings<br/>(HTTP POST + API Key)"| Core
    Core -->|"Acknowledgment +<br/>processing result"| ESP32

    Farmer -->|"Login credentials,<br/>fertilizer application data,<br/>alert acknowledgments"| Core
    Core -->|"Real-time dashboard data,<br/>nutrient status (D/S/E),<br/>fertilizer recommendations,<br/>alerts, monitoring reports"| Farmer

    Admin -->|"Login credentials,<br/>SSNM/NOPT reference values,<br/>user management actions,<br/>device registration"| Core
    Core -->|"System dashboard,<br/>device status & health,<br/>activity audit logs,<br/>classification reports,<br/>system statistics"| Admin

    DB[("💾 SQLite<br/>Database")]
    Core <-->|"Read/Write<br/>all data"| DB

    style PRIME fill:#166534,color:#fff
    style Core fill:#22c55e,color:#fff,stroke:none
    style Farmer fill:#15803d,color:#fff,stroke:none
    style Admin fill:#7c3aed,color:#fff,stroke:none
    style ESP32 fill:#0284c7,color:#fff,stroke:none
    style DB fill:#b45309,color:#fff,stroke:none
```

---

## 5. Database Schema Summary Table

| Table | Rows (Seed) | Primary Key | Foreign Keys | Purpose |
|-------|-------------|-------------|--------------|---------|
| `users` | 2 | `id` | — | Farmer & admin accounts |
| `fields` | 2 | `id` | `user_id` → users | Farm field registry |
| `devices` | 2 | `id` | `field_id` → fields | ESP32 sensor nodes |
| `sensor_readings` | 21 | `id` | `device_id` → devices, `field_id` → fields | Raw sensor data |
| `reference_values` | 12 | `id` | `updated_by` → users | SSNM/NOPT thresholds (3 nutrients × 4 stages) |
| `recommendations` | 21 | `id` | `sensor_reading_id` → sensor_readings, `field_id` → fields | Nutrient assessment results |
| `fertilizer_logs` | 3 | `id` | `field_id` → fields, `user_id` → users | Farmer-recorded applications |
| `alerts` | 4+ | `id` | `field_id` → fields, `user_id` → users | System-generated notifications |
| `activity_logs` | 5+ | `id` | `user_id` → users | Audit trail |

### Key Relationships
- **User → Fields**: One farmer owns multiple fields
- **Field → Devices**: One field has one or more ESP32 sensor nodes
- **Device → Sensor Readings**: Each device sends multiple readings
- **Sensor Reading → Recommendation**: Each valid reading generates exactly one recommendation
- **Reference Values**: Configured per nutrient × growth stage, with admin audit trail
