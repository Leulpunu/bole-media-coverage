# Deployment Guide - Bole Media Coverage

This guide will walk you through connecting your app to Neon database and deploying to Vercel.

## Step 1: Create a Neon Database

1. **Go to Neon Console**
   - Open https://console.neon.tech/ in your browser
   - Click "Sign in with GitHub" if not already logged in

2. **Create a New Project**
   - Click the green button: "Create a project"
   - Name it: `bole-media-coverage` (or any name you prefer)
   - Select the closest region to your users
   - Click "Create Project"

3. **Get Your Connection String**
   - Once created, click "Connection Details"
   - Copy the "Neon" connection string (it looks like: `postgres://username:password@host.neon.tech/dbname?sslmode=require`)
   - Save this for later - you'll need it!

## Step 2: Run the Database Schema

1. **In Neon Console:**
   - Go to your project
   - Click "SQL Editor" in the left sidebar
   - Copy the contents of `api/schema.sql` file from your project
   - Paste it into the SQL Editor
   - Click "Run"

2. **Or use psql (command line):**
   
```
bash
   psql "YOUR_NEON_CONNECTION_STRING" -f api/schema.sql
   
```

## Step 3: Deploy to Vercel

1. **Go to Vercel**
   - Open https://vercel.com/
   - Log in with your GitHub account

2. **Import Your Project**
   - Click "Add New..." → "Project"
   - Find `bole-media-coverage` in your repositories
   - Click "Import"

3. **Configure Environment Variables**
   - In the Vercel project setup, look for "Environment Variables"
   - Add a new variable:
     - **Name:** `DATABASE_URL`
     - **Value:** Your Neon connection string from Step 1
   - Click "Add" and then "Deploy"

4. **Wait for Deployment**
   - Vercel will build and deploy your app
   - This takes 1-3 minutes
   - You'll get a URL like `bole-media-coverage.vercel.app`

## Step 4: Test the Deployment

1. **Open your deployed site** (the URL Vercel gave you)

2. **Try logging in** with:
   - Username: `admin`
   - Password: `admin123`

3. **Submit a test media request** to verify data is being stored

## Troubleshooting

### "Database not configured" Error
- Make sure DATABASE_URL is set in Vercel project settings
- Check that your Neon database is not paused (in Neon Console, click "Resume" if it's paused)

### Login Not Working
- Verify the default users were created in the database
- Check Vercel function logs for errors

### Data Not Persisting
- Make sure you're using the deployed URL, not localhost
- The Neon free tier has a limit - check if you've reached it

## Alternative: Using Supabase Instead of Neon

If you prefer Supabase:
1. Go to https://supabase.com/
2. Create a new project
3. Go to Settings → Database
4. Copy the "Connection String" (URI)
5. Use that as DATABASE_URL in Vercel

## Need Help?

- Neon Docs: https://neon.tech/docs
- Vercel Docs: https://vercel.com/docs
