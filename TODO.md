# Migration: Redis (KV) → PostgreSQL

## Objective

Migrate from Vercel KV (Redis) to PostgreSQL using Vercel Postgres credentials

## Implementation Plan

### Phase 1: Dependencies & Configuration

- [x] 1. Add @vercel/postgres dependency to package.json

### Phase 2: Database Layer

- [x] 2. Create api/utils/db.js - PostgreSQL database utility module (auto-creates tables)

### Phase 3: API Route Updates

- [x] 3. api/media-requests.js - Update to use PostgreSQL (lazy-load pattern)
- [x] 4. api/media-requests/track/[trackingId].js - Update to use PostgreSQL
- [x] 5. api/media-requests/cancel/[requestId].js - Update to use PostgreSQL
- [x] 6. api/admin/requests.js - Update to use PostgreSQL
- [x] 7. api/admin/users.js - Update to use PostgreSQL
- [x] 8. api/admin/users/[userId].js - Update to use PostgreSQL
- [x] 9. api/auth/login.js - Already uses lazy-load pattern

### Phase 4: Backend Server Updates (Optional)

- [ ] 10. backend/package.json - Add pg dependency
- [ ] 11. backend/server.js - Update to use PostgreSQL

## Configuration Required

Set these environment variables in Vercel:

- `POSTGRES_URL` - Primary connection string (recommended)
- Or use `DATABASE_URL` - Alternative

## Status

- [x] Migration Complete - API routes updated, awaiting deployment

## Notes

- All API routes now use lazy-loading PostgreSQL client pattern
- Falls back to in-memory storage if PostgreSQL is not configured
- Default users (admin/admin123, editor/editor123) are created on first use
- Database tables are auto-created by api/utils/db.js on first connection
