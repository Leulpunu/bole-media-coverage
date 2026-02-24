-- Database Schema for Bole Media Coverage
-- Run this in Neon SQL Editor to create tables

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

-- Insert default users if not exists
INSERT INTO users (id, username, password, role) VALUES ('1', 'admin', 'admin123', 'admin') ON CONFLICT (username) DO NOTHING;
INSERT INTO users (id, username, password, role) VALUES ('2', 'editor', 'editor123', 'editor') ON CONFLICT (username) DO NOTHING;
