const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage (in production, use a database)
let mediaRequests = [];
let users = [
  { id: '1', username: 'admin', password: 'admin123', role: 'admin' },
  { id: '2', username: 'user', password: 'user123', role: 'user' }
];

// API Routes

// Media Request Routes
app.post('/api/media-requests', (req, res) => {
  try {
    const requestData = req.body;
    const newRequest = {
      id: uuidv4(),
      ...requestData,
      status: 'pending',
      createdAt: new Date().toISOString(),
      trackingNumber: `REQ-${Date.now()}`
    };

    mediaRequests.push(newRequest);

    res.status(201).json({
      success: true,
      message: 'Request submitted successfully',
      trackingNumber: newRequest.trackingNumber,
      request: newRequest
    });
  } catch (error) {
    console.error('Error submitting request:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.get('/api/media-requests/track/:trackingId', (req, res) => {
  try {
    const { trackingId } = req.params;
    const request = mediaRequests.find(req => req.trackingNumber === trackingId);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    res.json({ success: true, request });
  } catch (error) {
    console.error('Error tracking request:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.get('/api/media-requests/status/:requestId', (req, res) => {
  try {
    const { requestId } = req.params;
    const request = mediaRequests.find(req => req.id === requestId);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    res.json({ success: true, status: request.status });
  } catch (error) {
    console.error('Error getting request status:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.put('/api/media-requests/cancel/:requestId', (req, res) => {
  try {
    const { requestId } = req.params;
    const { reason } = req.body;

    const requestIndex = mediaRequests.findIndex(req => req.id === requestId);

    if (requestIndex === -1) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    mediaRequests[requestIndex].status = 'cancelled';
    mediaRequests[requestIndex].cancelReason = reason;
    mediaRequests[requestIndex].cancelledAt = new Date().toISOString();

    res.json({ success: true, message: 'Request cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling request:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Admin Routes
app.get('/api/admin/requests', (req, res) => {
  try {
    res.json(mediaRequests);
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.put('/api/admin/requests/:requestId/status', (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, comments } = req.body;

    const requestIndex = mediaRequests.findIndex(req => req.id === requestId);

    if (requestIndex === -1) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    mediaRequests[requestIndex].status = status;
    if (comments) {
      mediaRequests[requestIndex].adminComments = comments;
    }
    mediaRequests[requestIndex].updatedAt = new Date().toISOString();

    res.json({ success: true, message: 'Request status updated successfully' });
  } catch (error) {
    console.error('Error updating request status:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// User Management Routes (simplified)
app.post('/api/auth/login', (req, res) => {
  try {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    res.json({ success: true, user: { id: user.id, username: user.username, role: user.role } });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.get('/api/admin/users', (req, res) => {
  try {
    res.json(users.map(u => ({ id: u.id, username: u.username, role: u.role, createdAt: u.createdAt || new Date().toISOString() })));
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.post('/api/admin/users', (req, res) => {
  try {
    const { username, password } = req.body;

    if (users.find(u => u.username === username)) {
      return res.status(400).json({ success: false, message: 'Username already exists' });
    }

    const newUser = {
      id: uuidv4(),
      username,
      password,
      role: 'user',
      createdAt: new Date().toISOString()
    };

    users.push(newUser);

    res.status(201).json({ success: true, message: 'User created successfully' });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.delete('/api/admin/users/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    users.splice(userIndex, 1);

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
