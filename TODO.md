# TODO.md

## Fix Data Entry Path for Vercel Deployment

### Problem

The application works locally but data doesn't save on Vercel because:

1. API routes use in-memory storage (`let mediaRequests = []`)
2. Vercel serverless functions are stateless - each invocation has fresh memory
3. Data is saved but lost immediately

### Solution

Use Vercel Postgres for persistent data storage

### Implementation Status

- [x] Add @vercel/postgres dependency to package.json
- [x] Create api/utils/db.js - PostgreSQL database utility module
- [x] Update api/media-requests.js - Use PostgreSQL with fallback
- [x] Update api/media-requests/track/[trackingId].js - Use PostgreSQL with fallback
- [x] Update api/media-requests/cancel/[requestId].js - Use PostgreSQL with fallback
- [x] Update api/admin/users.js - Use PostgreSQL with fallback
- [x] Update api/admin/users/[userId].js - Use PostgreSQL with fallback
- [x] Update api/auth/login.js - Use PostgreSQL with fallback

### Environment Variables

To use PostgreSQL in production, set the following in Vercel:

- `POSTGRES_URL` - Your PostgreSQL connection string
- Or `DATABASE_URL` - Alternative connection string

### Notes

- All API routes support dual-mode: PostgreSQL when configured, in-memory for local development
- Tables are automatically created on first request when PostgreSQL is configured
