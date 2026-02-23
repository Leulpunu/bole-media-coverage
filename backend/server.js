const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const { neon } = require('@neondatabase/serverless');

const app = express();
const PORT = process.env.PORT || 5000;

// Neon PostgreSQL configuration
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
const sql = connectionString ? neon(connectionString) : null;

// Middleware
app.use(cors());
app.use(express.json());

// Database initialization
async function initializeDatabase() {
  if (!sql) {
    console.warn('PostgreSQL not configured, using fallback mode');
    return false;
  }

  try {
    // Create users table if not exists
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create media_requests table if not exists
    await sql`
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
      )
    `;

    // Insert default admin user if not exists
    const existingAdmin = await sql`SELECT id FROM users WHERE username = 'admin'`;
    if (existingAdmin.length === 0) {
      await sql`
        INSERT INTO users (id, username, password, role)
        VALUES ('1', 'admin', 'admin123', 'admin')
      `;
      await sql`
        INSERT INTO users (id, username, password, role)
        VALUES ('2', 'editor', 'editor123', 'editor')
      `;
      console.log('Default users created');
    }

    console.log('Database initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
}

// Initialize database on startup
initializeDatabase();

// Media Request Routes
app.post('/api/media-requests', async (req, res) => {
  if (!sql) {
    return res.status(503).json({ success: false, message: 'Database not configured' });
  }

  try {
    const requestData = req.body;
    const id = uuidv4();
    const trackingId = `REQ-${Date.now()}`;

    const result = await sql`
      INSERT INTO media_requests (
        id, tracking_id, requester_name, organization, email, phone,
        media_type, coverage_type, event_name, event_date, event_location,
        description, status
      ) VALUES (
        ${id}, ${trackingId}, ${requestData.requesterName}, ${requestData.organization},
        ${requestData.email}, ${requestData.phone}, ${requestData.mediaType},
        ${requestData.coverageType}, ${requestData.eventName}, ${requestData.eventDate},
        ${requestData.eventLocation}, ${requestData.description}, 'pending'
      )
      RETURNING *
    `;

    res.status(201).json({
      success: true,
      message: 'Request submitted successfully',
      trackingNumber: trackingId,
      request: result[0]
    });
  } catch (error) {
    console.error('Error submitting request:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.get('/api/media-requests/track/:trackingId', async (req, res) => {
  if (!sql) {
    return res.status(503).json({ success: false, message: 'Database not configured' });
  }

  try {
    const { trackingId } = req.params;
    const result = await sql`
      SELECT * FROM media_requests WHERE tracking_id = ${trackingId}
    `;

    if (result.length === 0) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    res.json({ success: true, request: result[0] });
  } catch (error) {
    console.error('Error tracking request:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.get('/api/media-requests/status/:requestId', async (req, res) => {
  if (!sql) {
    return res.status(503).json({ success: false, message: 'Database not configured' });
  }

  try {
    const { requestId } = req.params;
    const result = await sql`
      SELECT status FROM media_requests WHERE id = ${requestId}
    `;

    if (result.length === 0) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    res.json({ success: true, status: result[0].status });
  } catch (error) {
    console.error('Error getting request status:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.put('/api/media-requests/cancel/:requestId', async (req, res) => {
  if (!sql) {
    return res.status(503).json({ success: false, message: 'Database not configured' });
  }

  try {
    const { requestId } = req.params;
    const { reason } = req.body;

    const result = await sql`
      UPDATE media_requests 
      SET status = 'cancelled', cancel_reason = ${reason}, cancelled_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${requestId}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    res.json({ success: true, message: 'Request cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling request:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Admin Routes
app.get('/api/admin/requests', async (req, res) => {
  if (!sql) {
    return res.status(503).json({ success: false, message: 'Database not configured' });
  }

  try {
    const result = await sql`
      SELECT * FROM media_requests ORDER BY created_at DESC
    `;
    res.json(result);
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.put('/api/admin/requests/:requestId/status', async (req, res) => {
  if (!sql) {
    return res.status(503).json({ success: false, message: 'Database not configured' });
  }

  try {
    const { requestId } = req.params;
    const { status, comments } = req.body;

    const result = await sql`
      UPDATE media_requests 
      SET status = ${status}, admin_comments = ${comments}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${requestId}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    res.json({ success: true, message: 'Request status updated successfully' });
  } catch (error) {
    console.error('Error updating request status:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// User Management Routes
app.post('/api/auth/login', async (req, res) => {
  if (!sql) {
    return res.status(503).json({ success: false, message: 'Database not configured' });
  }

  try {
    const { username, password } = req.body;
    const result = await sql`
      SELECT * FROM users WHERE username = ${username} AND password = ${password}
    `;

    if (result.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const user = result[0];
    res.json({ success: true, user: { id: user.id, username: user.username, role: user.role } });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.get('/api/admin/users', async (req, res) => {
  if (!sql) {
    return res.status(503).json({ success: false, message: 'Database not configured' });
  }

  try {
    const result = await sql`
      SELECT id, username, role, created_at FROM users ORDER BY created_at DESC
    `;
    res.json(result);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.post('/api/admin/users', async (req, res) => {
  if (!sql) {
    return res.status(503).json({ success: false, message: 'Database not configured' });
  }

  try {
    const { username, password } = req.body;

    // Check if username exists
    const existing = await sql`
      SELECT id FROM users WHERE username = ${username}
    `;

    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Username already exists' });
    }

    const id = uuidv4();
    await sql`
      INSERT INTO users (id, username, password, role) VALUES (${id}, ${username}, ${password}, 'user')
    `;

    res.status(201).json({ success: true, message: 'User created successfully' });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.delete('/api/admin/users/:userId', async (req, res) => {
  if (!sql) {
    return res.status(503).json({ success: false, message: 'Database not configured' });
  }

  try {
    const { userId } = req.params;

    const result = await sql`
      DELETE FROM users WHERE id = ${userId} RETURNING id
    `;

    if (result.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: sql ? 'connected' : 'not configured'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
