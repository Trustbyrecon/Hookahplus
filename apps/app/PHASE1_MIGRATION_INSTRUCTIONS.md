# Phase 1 Migration Instructions

## Status
✅ All database models have been added to `schema.prisma`
✅ Session model has been updated with new relations
⏳ Migration needs to be created and run when database is available

## New Models Added

### Order Models
- `Order` - Core order entity for hookah, food, drinks, add-ons
- `OrderItem` - Individual items within an order
- `OrderEvent` - Event log for order lifecycle

### Pre-Order Models
- `PreOrder` - Pre-orders from QR codes or reservations

### Delivery Models
- `Delivery` - Tracks hookah delivery to tables

### SessionNotes & Memory
- `SessionNote` - Staff notes with sentiment and loyalty impact
- `LoyaltyProfile` - Customer loyalty profiles
- `LoyaltyNoteBinding` - Links session notes to loyalty profiles

### Lounge Layout
- `Zone` - Lounge zones (VIP, Main Floor, Patio, etc.)
- `Seat` - Individual tables/seats within zones
- `Station` - Prep stations, coal stations, bar stations

### Menu & Catalog
- `Flavor` - Hookah flavors
- `MixTemplate` - Saved flavor combinations
- `PricingRule` - Pricing rules with versioning

### Config & Reliability
- `LoungeConfig` - Versioned lounge configuration
- `SyncBacklog` - Offline sync queue for tablets
- `AuditLog` - Audit trail for config changes

## Session Model Updates

Added fields:
- `preorderId` - Link to PreOrder
- `loungeConfigVersion` - Config version used for pricing
- `seatId` - Link to Seat model
- `zoneId` - Link to Zone model

Added relations:
- `preorder` - One-to-one with PreOrder
- `seat` - Many-to-one with Seat
- `zoneRelation` - Many-to-one with Zone (renamed to avoid conflict with existing `zone` String field)
- `orders` - One-to-many with Order
- `deliveries` - One-to-many with Delivery
- `notes` - One-to-many with SessionNote

## Running the Migration

When database is available, run:

```bash
cd apps/app
npx prisma migrate dev --name add_night_after_night_engine_models
```

This will:
1. Create a new migration file
2. Apply it to the database
3. Regenerate Prisma Client

## Verification

After migration, verify:
1. All tables created successfully
2. Foreign key constraints are in place
3. Indexes are created
4. Prisma Client regenerated with new models

```bash
# Verify schema
npx prisma validate

# Generate Prisma Client
npx prisma generate

# Check database (if using Prisma Studio)
npx prisma studio
```

## Notes

- The existing `zone` String field on Session is kept for backward compatibility
- The new `zoneRelation` uses the Zone model for proper relational data
- PreOrder has a unique `sessionId` for one-to-one relationship with Session
- All new models use snake_case for database column names (via `@map`)

