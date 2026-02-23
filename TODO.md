# Bole Media Coverage - Vercel Deployment Guide

## Problem Solved

The app works locally but data wasn't persisting on Vercel deployment because:
- Vercel serverless functions have no persistent storage
- Each function invocation starts fresh in-memory storage

## Solution Implemented

Migrated from in-memory storage to Neon PostgreSQL database

## Files Updated

### Core Database Layer

- `api/utils/db.js` - Neon PostgreSQL database utilities (CommonJS compatible)

### Vercel API Routes (in /api folder)

- `api/media-requests.js` - Submit new requests (POST)
- `api/media-requests/track/[trackingId].js` - Track requests (GET)
- `api/media-requests/cancel/[requestId].js` - Cancel requests (PUT)
- `api/admin/requests.js` - Admin: Get/Update all requests
- `api/admin/users.js` - Admin: Get/Create users
- `api/admin/users/[userId].js` - Admin: Delete users
- `api/auth/login.js` - Authentication

### Dependencies

- Added `@neondatabase/serverless` to package.json

## Deployment Steps

### 1. Set Environment Variables in Vercel Dashboard

Go to your Vercel project Settings → Environment Variables and add:

| Variable | Value |
|----------|-------|
| DATABASE_URL | Your Neon PostgreSQL connection string |

The connection string format:

```
postgresql://[user]:[password]@[host]/[database]?sslmode=require
```

### 2. Deploy

- Push changes to GitHub
- Vercel will automatically deploy

### 3. Test

- Submit a media request from the frontend
- Check if it appears in admin panel
- Data will now persist across deployments

## Database Tables

The following tables will be auto-created on first API call:
- `users` - User accounts
- `media_requests` - Media coverage requests

## Default Admin Credentials

- Username: `admin`
- Password: `admin123`

## Status

Ready for Vercel Deployment
