// In-memory storage fallback
const users = [
  { id: '1', username: 'admin', password: 'admin123', role: 'admin', created_at: new Date().toISOString() },
  { id: '2', username: 'editor', password: 'editor123', role: 'editor', created_at: new Date().toISOString() }
];

// Lazy-load Neon database client
let sql = null;
async function getSql() {
  if (sql !== null) return sql;
  
  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  
  if (!databaseUrl) {
    console.log('DATABASE_URL not set, using in-memory storage');
    return null;
  }
  
  try {
    const { neon } = await import('@neondatabase/serverless');
    sql = neon(databaseUrl);
    
    // Test the connection
    await sql`SELECT 1`;
    console.log('Neon database connected successfully');
    
    return sql;
  } catch (e) {
    console.warn('Failed to connect to Neon database:', e.message);
    sql = null;
    return null;
  }
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

  // Get the path without query string
  const urlPath = (req.url || '/').split('?')[0];
  // Remove leading slash and split
  let pathParts = urlPath.replace(/^\//, '').split('/');
  
  console.log('Original path parts:', pathParts);
  
  // If path starts with 'api', remove it
  if (pathParts[0] === 'api') {
    pathParts = pathParts.slice(1);
  }
  
  console.log('Processed path parts:', pathParts);

  // GET /api/admin/users - Get all users
  if (pathParts[0] === 'admin' && pathParts[1] === 'users' && req.method === 'GET') {
    try {
      const db = await getSql();
      if (db) {
        try {
          const result = await db`SELECT id, username, role, created_at FROM users ORDER BY created_at DESC`;
          return res.json(result);
        } catch (dbError) {
          console.warn('Database error, falling back to memory:', dbError.message);
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
      
      const db = await getSql();
      if (db) {
        try {
          // Check if username exists
          const existing = await db`SELECT id FROM users WHERE username = ${username}`;
          if (existing.length > 0) {
            return res.status(400).json({ success: false, message: 'Username already exists' });
          }
          
          const id = Date.now().toString();
          await db`INSERT INTO users (id, username, password, role) VALUES (${id}, ${username}, ${password}, 'user')`;
          
          return res.status(201).json({ success: true, message: 'User created successfully' });
        } catch (dbError) {
          console.warn('Database error, falling back to memory:', dbError.message);
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
