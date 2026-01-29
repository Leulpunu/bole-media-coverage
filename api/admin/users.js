// In-memory storage (in production, use a database)
let users = [
  { id: '1', username: 'admin', password: 'admin123', role: 'admin' },
  { id: '2', username: 'user', password: 'user123', role: 'user' }
];

module.exports = function handler(req, res) {
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
      res.json(users.map(u => ({ id: u.id, username: u.username, role: u.role })));
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    try {
      const { username, password } = req.body;

      // Check if user already exists
      const existingUser = users.find(u => u.username === username);
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'User already exists' });
      }

      // Create new user
      const newUser = {
        id: (users.length + 1).toString(),
        username,
        password,
        role: 'user'
      };

      users.push(newUser);

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
