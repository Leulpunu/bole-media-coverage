# Database Setup Guide for Bole Media Coverage

## Quick Start (Without Database - Already Working!)

The application now works without a database using in-memory storage. You can login with:

- **Admin:** username: `admin`, password: `admin123`
- **Editor:** username: `editor`, password: `editor123`

---

## Setting Up a Database (Optional but Recommended)

If you want persistent data storage, follow these steps:

### Option 1: Vercel Postgres (Recommended)

1. **Go to Vercel Dashboard**

   Visit [https://vercel.com](https://vercel.com) and go to your project.

2. **Create a Database**

   - Click on **Storage** tab in the sidebar
   - Click **Create Database** → **Vercel Postgres**
   - Choose a region (closest to your users)
   - Click **Create**

3. **Done!**

   Vercel automatically adds `DATABASE_URL` environment variable. Your app will automatically connect on next deployment.

---

### Option 2: Neon (Free PostgreSQL)

1. **Create Neon Account**

   Go to [https://neon.tech](https://neon.tech) and sign up with your GitHub account. Click **New Project**.

2. **Configure Project**

   - Name: `bole-media` (or any name)
   - Select a region closest to your users
   - Click **Create Project**

3. **Get Connection String**

   - Once created, click **Connection Details**
   - Copy the **Connection string** (looks like: `postgres://user:password@host.neon.tech/dbname?sslmode=require`)

4. **Add to Vercel**

   - Go to Vercel → Your Project → Settings → Environment Variables
   - Add new variable:
     - Name: `DATABASE_URL`
     - Value: (paste your Neon connection string)
   - Click **Save**

5. **Deploy**

   Redeploy your project for the changes to take effect.

---

## Verifying Database Connection

After setting up:

1. Check Vercel function logs at <https://vercel.com> → Your Project → Functions → Functions Logs

2. You should see: "Database connected and initialized"

3. Login will now use the database instead of in-memory storage

---

## Default Users

After database setup, these users are automatically created:

- **Admin:** username: `admin`, password: `admin123`, role: `admin`
- **Editor:** username: `editor`, password: `editor123`, role: `editor`

---

## Troubleshooting

### "Database not configured" error

- Make sure `DATABASE_URL` is set in Vercel environment variables
- Redeploy after adding the variable

### "Connection refused" error

- Check that your Neon project is active (not paused)
- Verify the connection string is correct

### Data not persisting

- Make sure you're using a database (not in-memory fallback)
- Check Vercel function logs for errors
