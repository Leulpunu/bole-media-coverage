const { v4: uuidv4 } = require('uuid');
const { getUsers, findUserByUsername, addUser } = require('../utils/db');

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

  if (req.method === 'GET') {
    try {
      // Get users from Vercel KV for persistent storage
      const users = await getUsers();
      res.json(users.map(u => ({ id: u.id, username: u.username, role: u.role })));
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    try {
      const { username, password } = req.body;

      // Check if user already exists
      const existingUser = await findUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'User already exists' });
      }

      // Create new user
      const newUser = {
        id: uuidv4(),
        username,
        password,
        role: 'user'
      };

      // Save to Vercel KV
      await addUser(newUser);

      res.json({ success: true, user: { id: newUser.id, username: newUser.username, role: newUser.role } });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
