// In-memory storage fallback
const users = [
  { id: '1', username: 'admin', password: 'admin123', role: 'admin', created_at: new Date().toISOString() },
  { id: '2', username: 'editor', password: 'editor123', role: 'editor', created_at: new Date().toISOString() }
];

// Check if PostgreSQL is configured
let sql;
try {
  const postgres = await import('@vercel/postgres');
  sql = postgres.default;
} catch (e) {
  sql = null;
}

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

  // GET /api/admin/users - Get all users
  if (req.method === 'GET') {
    try {
      if (sql) {
        try {
          const result = await sql`SELECT id, username, role, created_at FROM users ORDER BY created_at DESC`;
          return res.json(result.rows);
        } catch (dbError) {
          console.warn('PostgreSQL error, falling back to memory:', dbError.message);
        }
      }
      // Fallback to in-memory
      res.json(users.map(u => ({ id: u.id, username: u.username, role: u.role, created_at: u.created_at })));
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
  // POST /api/admin/users - Create new user
  else if (req.method === 'POST') {
    try {
      const { username, password } = req.body;
      
      if (sql) {
        try {
          // Check if username exists
          const existing = await sql`SELECT id FROM users WHERE username = ${username}`;
          if (existing.rows.length > 0) {
            return res.status(400).json({ success: false, message: 'Username already exists' });
          }
          
          const id = Date.now().toString();
          await sql`INSERT INTO users (id, username, password, role) VALUES (${id}, ${username}, ${password}, 'user')`;
          
          return res.status(201).json({ success: true, message: 'User created successfully' });
        } catch (dbError) {
          console.warn('PostgreSQL error, falling back to memory:', dbError.message);
        }
      }
      
      // Fallback to in-memory
      if (users.find(u => u.username === username)) {
        return res.status(400).json({ success: false, message: 'Username already exists' });
      }
      
      const newUser = { id: Date.now().toString(), username, password, role: 'user', created_at: new Date().toISOString() };
      users.push(newUser);
      res.status(201).json({ success: true, message: 'User created successfully' });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
  else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
