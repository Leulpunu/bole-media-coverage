const { findUserByUsername } = require('../utils/kv');

module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    try {
      const { username, password } = req.body;
      
      // Use KV for persistent storage
      const user = await findUserByUsername(username);

      if (!user || user.password !== password) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      res.json({ success: true, user: { id: user.id, username: user.username, role: user.role } });
    } catch (error) {
      console.error('Error logging in:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
