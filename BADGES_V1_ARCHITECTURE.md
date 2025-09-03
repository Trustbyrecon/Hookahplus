# Badges V1 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Badges V1 System                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   API Routes    │    │  Auth & Roles   │    │  Audit Logging  │
│                 │    │                 │    │                 │
│ /api/events     │    │ Guest/Staff/    │    │ Cross-venue     │
│ /api/badges     │    │ Admin roles     │    │ operations      │
│ /api/export     │    │ Permission      │    │ Request tracking│
│ /api/export-    │    │ checks          │    │ Security events │
│ token           │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │  Store Switcher │
                    │                 │
                    │ BADGES_V1_USE_DB│
                    │ = true/false    │
                    └─────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
         ┌─────────────────┐    ┌─────────────────┐
         │ In-Memory Store │    │  Database Store │
         │                 │    │                 │
         │ badgeStores.ts  │    │ badgeStores.db  │
         │ Demo/fallback   │    │ Prisma + PG     │
         │ mode            │    │ Production mode │
         └─────────────────┘    └─────────────────┘
                                         │
                              ┌─────────────────┐
                              │   PostgreSQL    │
                              │                 │
                              │ Badge table     │
                              │ Award table     │
                              │ Event table     │
                              └─────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        Badge Engine                            │
│                                                                 │
│ • Rule evaluation (venue_count, unique_combos, etc.)          │
│ • Progress tracking                                            │
│ • Automatic badge awarding                                     │
│ • Config from badges.json or DB                               │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        Data Flow                               │
│                                                                 │
│ 1. Event created via /api/events (staff/admin only)           │
│ 2. Badge engine evaluates rules against event history         │
│ 3. New awards created if criteria met                         │
│ 4. Audit log records operation                                │
│ 5. Badges retrievable via /api/badges with role checks        │
│ 6. Data exportable via /api/export with token support         │
└─────────────────────────────────────────────────────────────────┘
```

## Key Features

### 🔄 **Dual Storage Mode**
- **In-Memory**: Demo/development mode with `BADGES_V1_USE_DB=false`
- **Database**: Production mode with PostgreSQL via Prisma

### 🔐 **Role-Based Security**
- **Guest**: Can view own badges, export own data
- **Staff**: Can create events, view profiles in their venue
- **Admin**: Full access, cross-venue operations, export tokens

### 📊 **Audit & Monitoring**
- Cross-venue operation detection and logging
- Request tracking with IP and user agent
- Security event monitoring

### 🏆 **Badge System**
- Configurable rules (venue visits, unique combos, etc.)
- Progress tracking and automatic awarding
- Network vs lounge scope badges

### 📤 **Data Portability**
- Self-service export for guests
- Admin-created export tokens
- Complete profile data with metadata
