# Database Setup Guide

This project uses Neon (a serverless PostgreSQL) for data storage. Follow these steps to set up your database:

## Step 1: Create a Neon Database

1. Go to [Neon Console](https://console.neon.tech/)
2. Sign up or log in with your GitHub account
3. Click "Create a project"
4. Give your project a name (e.g., "bole-media-coverage")
5. Copy the connection string (it looks like: `postgres://user:password@ep-xxx.us-east-1.aws.neon.tech/bole-media-coverage`)

## Step 2: Create Database Tables

In the Neon SQL Editor, run the following SQL:

```
sql
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Media requests table
CREATE TABLE IF NOT EXISTS media_requests (
  id VARCHAR(255) PRIMARY KEY,
  tracking_id VARCHAR(255) UNIQUE NOT NULL,
  requester_name VARCHAR(255),
  organization VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  media_type VARCHAR(50),
  coverage_type VARCHAR(100),
  event_name VARCHAR(255),
  event_date DATE,
  event_location VARCHAR(255),
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  admin_comments TEXT,
  cancel_reason TEXT,
  cancelled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default users
INSERT INTO users (id, username, password, role) VALUES ('1', 'admin', 'admin123', 'admin') ON CONFLICT (username) DO NOTHING;
INSERT INTO users (id, username, password, role) VALUES ('2', 'editor', 'editor123', 'editor') ON CONFLICT (username) DO NOTHING;
```

## Step 3: Configure Environment Variables

### For Local Development

1. Create a `.env` file in the project root:

```
bash
DATABASE_URL=postgres://your-username:your-password@ep-xxx.us-east-1.aws.neon.tech/bole-media-coverage?sslmode=require
```

### For Vercel Deployment

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add a new variable:
   - Name: `DATABASE_URL`
   - Value: Your Neon connection string

## Step 4: Test the Connection

The app will automatically:

1. Try to connect to the Neon database using `DATABASE_URL`
2. Fall back to in-memory storage if no database is configured

You can verify by checking the server console logs:

- "Neon database connected successfully" = Connected
- "DATABASE_URL not set, using in-memory storage" = Using fallback

## Default Login Credentials

- **Admin**: username: `admin`, password: `admin123`
- **Editor**: username: `editor`, password: `editor123`
