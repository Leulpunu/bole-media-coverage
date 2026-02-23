const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5000;

// In-memory fallback storage (used when PostgreSQL is not available)
let mediaRequests = [];
let users = [
  { id: '1', username: 'admin', password: 'admin123', role: 'admin', created_at: new Date().toISOString() },
  { id: '2', username: 'editor', password: 'editor123', role: 'editor', created_at: new Date().toISOString() }
];

// PostgreSQL client (will be set up if credentials are available)
let sql = null;

// Try to initialize PostgreSQL
async function initDb() {
  try {
    const postgres = require('@vercel/postgres');
    const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    if (connectionString) {
      sql = postgres(connectionString);
      
      // Create tables
      await sql`CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`;
      
      await sql`CREATE TABLE IF NOT EXISTS media_requests (
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
      )`;
      
      // Insert default users if not exists
      const existingAdmin = await sql`SELECT id FROM users WHERE username = 'admin'`;
      if (existingAdmin.rows.length === 0) {
        await sql`INSERT INTO users (id, username, password, role) VALUES ('1', 'admin', 'admin123', 'admin')`;
        await sql`INSERT INTO users (id, username, password, role) VALUES ('2', 'editor', 'editor123', 'editor')`;
      }
      
      console.log('PostgreSQL connected and initialized');
    } else {
      console.warn('PostgreSQL not configured, using in-memory storage');
    }
  } catch (e) {
    console.warn('PostgreSQL not available, using in-memory storage');
  }
}

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
initDb();

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: sql ? 'PostgreSQL' : 'in-memory'
  });
});

// Media Request Routes
app.post('/api/media-requests', async (req, res) => {
  try {
    if (sql) {
      const requestData = req.body;
      const id = uuidv4();
      const trackingId = `REQ-${Date.now()}`;
      
      const result = await sql`
        INSERT INTO media_requests (id, tracking_id, requester_name, organization, email, phone, media_type, coverage_type, event_name, event_date, event_location, description, status)
        VALUES (${id}, ${trackingId}, ${requestData.requesterName}, ${requestData.organization}, ${requestData.email}, ${requestData.phone}, ${requestData.mediaType}, ${requestData.coverageType}, ${requestData.eventName}, ${requestData.eventDate}, ${requestData.eventLocation}, ${requestData.description}, 'pending')
        RETURNING *
      `;
      
      res.status(201).json({
        success: true,
        message: 'Request submitted successfully',
        trackingNumber: trackingId,
        request: result[0]
      });
    } else {
      // In-memory fallback
      const requestData = req.body;
      const newRequest = {
        id: uuidv4(),
        tracking_id: `REQ-${Date.now()}`,
        requester_name: requestData.requesterName,
        organization: requestData.organization,
        email: requestData.email,
        phone: requestData.phone,
        media_type: requestData.mediaType,
        coverage_type: requestData.coverageType,
        event_name: requestData.eventName,
        event_date: requestData.eventDate,
        event_location: requestData.eventLocation,
        description: requestData.description,
        status: 'pending',
        created_at: new Date().toISOString()
      };
      mediaRequests.push(newRequest);
      
      res.status(201).json({
        success: true,
        message: 'Request submitted successfully',
        trackingNumber: newRequest.tracking_id,
        request: newRequest
      });
    }
  } catch (error) {
    console.error('Error submitting request:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.get('/api/media-requests/track/:trackingId', async (req, res) => {
  try {
    const { trackingId } = req.params;
    
    if (sql) {
      const result = await sql`SELECT * FROM media_requests WHERE tracking_id = ${trackingId}`;
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Request not found' });
      }
      res.json({ success: true, request: result[0] });
    } else {
      // In-memory fallback
      const request = mediaRequests.find(r => r.tracking_id === trackingId);
      if (!request) {
        return res.status(404).json({ success: false, message: 'Request not found' });
      }
      res.json({ success: true, request });
    }
  } catch (error) {
    console.error('Error tracking request:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.get('/api/media-requests/status/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;
    
    if (sql) {
      const result = await sql`SELECT status FROM media_requests WHERE id = ${requestId}`;
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Request not found' });
      }
      res.json({ success: true, status: result[0].status });
    } else {
      const request = mediaRequests.find(r => r.id === requestId);
      if (!request) {
        return res.status(404).json({ success: false, message: 'Request not found' });
      }
      res.json({ success: true, status: request.status });
    }
  } catch (error) {
    console.error('Error getting request status:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.put('/api/media-requests/cancel/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;
    const { reason } = req.body;
    
    if (sql) {
      const result = await sql`UPDATE media_requests SET status = 'cancelled', cancel_reason = ${reason}, cancelled_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ${requestId} RETURNING *`;
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Request not found' });
      }
      res.json({ success: true, message: 'Request cancelled successfully' });
    } else {
      const index = mediaRequests.findIndex(r => r.id === requestId);
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Request not found' });
      }
      mediaRequests[index].status = 'cancelled';
      mediaRequests[index].cancel_reason = reason;
      mediaRequests[index].cancelled_at = new Date().toISOString();
      res.json({ success: true, message: 'Request cancelled successfully' });
    }
  } catch (error) {
    console.error('Error cancelling request:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Admin Routes
app.get('/api/admin/requests', async (req, res) => {
  try {
    if (sql) {
      const result = await sql`SELECT * FROM media_requests ORDER BY created_at DESC`;
      res.json(result.rows);
    } else {
      res.json(mediaRequests);
    }
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.put('/api/admin/requests/:requestId/status', async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, comments } = req.body;
    
    if (sql) {
      const result = await sql`UPDATE media_requests SET status = ${status}, admin_comments = ${comments}, updated_at = CURRENT_TIMESTAMP WHERE id = ${requestId} RETURNING *`;
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Request not found' });
      }
      res.json({ success: true, message: 'Request status updated successfully' });
    } else {
      const index = mediaRequests.findIndex(r => r.id === requestId);
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Request not found' });
      }
      mediaRequests[index].status = status;
      mediaRequests[index].admin_comments = comments;
      mediaRequests[index].updated_at = new Date().toISOString();
      res.json({ success: true, message: 'Request status updated successfully' });
    }
  } catch (error) {
    console.error('Error updating request status:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// User Management Routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (sql) {
      const result = await sql`SELECT * FROM users WHERE username = ${username} AND password = ${password}`;
      if (result.rows.length === 0) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
      const user = result.rows[0];
      res.json({ success: true, user: { id: user.id, username: user.username, role: user.role } });
    } else {
      // In-memory fallback
      const user = users.find(u => u.username === username && u.password === password);
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
      res.json({ success: true, user: { id: user.id, username: user.username, role: user.role } });
    }
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.get('/api/admin/users', async (req, res) => {
  try {
    if (sql) {
      const result = await sql`SELECT id, username, role, created_at FROM users ORDER BY created_at DESC`;
      res.json(result.rows);
    } else {
      res.json(users.map(u => ({ id: u.id, username: u.username, role: u.role, created_at: u.created_at })));
    }
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.post('/api/admin/users', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (sql) {
      const existing = await sql`SELECT id FROM users WHERE username = ${username}`;
      if (existing.rows.length > 0) {
        return res.status(400).json({ success: false, message: 'Username already exists' });
      }
      
      const id = uuidv4();
      await sql`INSERT INTO users (id, username, password, role) VALUES (${id}, ${username}, ${password}, 'user')`;
      res.status(201).json({ success: true, message: 'User created successfully' });
    } else {
      // In-memory fallback
      if (users.find(u => u.username === username)) {
        return res.status(400).json({ success: false, message: 'Username already exists' });
      }
      
      const newUser = {
        id: uuidv4(),
        username,
        password,
        role: 'user',
        created_at: new Date().toISOString()
      };
      users.push(newUser);
      res.status(201).json({ success: true, message: 'User created successfully' });
    }
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.delete('/api/admin/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (sql) {
      const result = await sql`DELETE FROM users WHERE id = ${userId} RETURNING id`;
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      res.json({ success: true, message: 'User deleted successfully' });
    } else {
      // In-memory fallback
      const index = users.findIndex(u => u.id === userId);
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      users.splice(index, 1);
      res.json({ success: true, message: 'User deleted successfully' });
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
