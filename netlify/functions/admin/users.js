// In-memory storage (in production, use a database)
let users = [
  { id: '1', username: 'admin', password: 'admin123', role: 'admin' },
  { id: '2', username: 'user', password: 'user123', role: 'user' }
];

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Handle dynamic routes by checking the path
  const pathParts = req.url.split('/').filter(part => part);
  const isDynamicRoute = pathParts.length > 2 && pathParts[1] === 'users'; // /api/admin/users/:userId
  const userId = isDynamicRoute ? pathParts[2] : null;

  if (isDynamicRoute && userId) {
    // Handle /api/admin/users/:userId routes
    if (req.method === 'DELETE') {
      try {
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
    } else {
      res.setHeader('Allow', ['DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } else {
    // Handle /api/admin/users routes
    if (req.method === 'GET') {
      try {
        res.json(users.map(u => ({ id: u.id, username: u.username, role: u.role, createdAt: u.createdAt || new Date().toISOString() })));
      } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    } else if (req.method === 'POST') {
      try {
        const { username, password } = req.body;

        if (users.find(u => u.username === username)) {
          return res.status(400).json({ success: false, message: 'Username already exists' });
        }

        const newUser = {
          id: (users.length + 1).toString(),
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
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  }
}
