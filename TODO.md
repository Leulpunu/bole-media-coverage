# Migration: Redis (KV) → Neon PostgreSQL

## Objective

Migrate from Vercel KV (Redis) to Neon PostgreSQL using the Neon serverless driver

## Implementation Plan

### Phase 1: Dependencies & Configuration

- [x] 1. Add @neondatabase/serverless dependency to package.json

### Phase 2: Database Layer

- [x] 2. Create api/utils/db.js - Neon PostgreSQL database utility module
- [x] 3. Create database schema/migrations

### Phase 3: API Route Updates

- [x] 4. api/media-requests.js - Updated to use PostgreSQL
- [x] 5. api/media-requests/track/[trackingId].js - Updated to use PostgreSQL
- [x] 6. api/media-requests/cancel/[requestId].js - Updated to use PostgreSQL
- [x] 7. api/admin/requests.js - Updated to use PostgreSQL
- [x] 8. api/admin/users.js - Updated to use PostgreSQL
- [x] 9. api/admin/users/[userId].js - Updated to use PostgreSQL
- [x] 10. api/auth/login.js - Updated to use PostgreSQL

### Phase 4: Backend Server Updates

- [x] 11. backend/package.json - Add @neondatabase/serverless dependency
- [x] 12. backend/server.js - Update to use Neon PostgreSQL

## Status

- [x] Migration Complete
