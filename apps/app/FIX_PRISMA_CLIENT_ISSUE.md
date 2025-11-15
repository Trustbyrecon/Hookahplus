# Fix Prisma Client SQLite/PostgreSQL Mismatch

**Error:** `Error validating datasource 'db': the URL must start with the protocol 'file:'`

**Root Cause:** Prisma client was generated with SQLite provider, but schema is PostgreSQL

---

## ✅ Fix Applied

1. **Regenerated Prisma Client:**
   ```bash
   cd apps/app
   npx prisma generate
   ```

2. **Restart Server Required:**
   The server must be restarted to pick up the new Prisma client.

---

## 🔍 Verification

After restart, test with:
```bash
curl -X POST http://localhost:3002/api/sessions \
  -H "Content-Type: application/json" \
  -d '{"tableId":"TEST-001","customerName":"Test","flavor":"Mint","source":"QR"}'
```

Should return `200 OK` with session data, not `500` with SQLite error.

---

## 📋 Next Steps

1. ✅ Prisma client regenerated
2. ⏭️ **Restart server** (stop current, then `npm run dev`)
3. ⏭️ Test session creation
4. ⏭️ Run full test suite

---

**Status:** Prisma client regenerated - server restart required

