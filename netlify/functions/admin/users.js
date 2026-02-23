const { v4: uuidv4 } = require('uuid');
const { neon } = require('@neondatabase/serverless');

// Get database connection
const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;

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
    // Handle /api/admin/users/:userId routes (DELETE)
    if (req.method === 'DELETE') {
      try {
        if (!sql) {
          return res.status(503).json({ success: false, message: 'Database not configured' });
        }

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
    } else {
      res.setHeader('Allow', ['DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } else {
    // Handle /api/admin/users routes (GET, POST)
    if (req.method === 'GET') {
      try {
        if (!sql) {
          return res.status(503).json({ success: false, message: 'Database not configured' });
        }

        const result = await sql`
          SELECT id, username, role, created_at FROM users ORDER BY created_at DESC
        `;

        res.json(result.map(u => ({ 
          id: u.id, 
          username: u.username, 
          role: u.role, 
          createdAt: u.created_at 
        })));
      } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    } else if (req.method === 'POST') {
      try {
        if (!sql) {
          return res.status(503).json({ success: false, message: 'Database not configured' });
        }

        const { username, password } = req.body;

        // Check if user already exists
        const existing = await sql`
          SELECT id FROM users WHERE username = ${username}
        `;

        if (existing.length > 0) {
          return res.status(400).json({ success: false, message: 'Username already exists' });
        }

        const id = uuidv4();
        
        await sql`
          INSERT INTO users (id, username, password, role)
          VALUES (${id}, ${username}, ${password}, 'user')
        `;

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
