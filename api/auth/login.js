// In-memory storage fallback (used when PostgreSQL is not configured)
const users = [
  { id: '1', username: 'admin', password: 'admin123', role: 'admin', created_at: new Date().toISOString() },
  { id: '2', username: 'editor', password: 'editor123', role: 'editor', created_at: new Date().toISOString() }
];

// Lazy-load PostgreSQL client
let sql = null;
async function getSql() {
  if (sql !== null) return sql;
  
  try {
    // Check if POSTGRES_URL is configured
    if (!process.env.POSTGRES_URL && !process.env.DATABASE_URL) {
      console.log('PostgreSQL not configured, using in-memory storage');
      return null;
    }
    
    const postgres = await import('@vercel/postgres');
    sql = postgres.default;
    return sql;
  } catch (e) {
    console.warn('Failed to load PostgreSQL:', e.message);
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

  if (req.method === 'POST') {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password required' });
      }
      
      // Try PostgreSQL first, fallback to in-memory
      const db = await getSql();
      if (db) {
        try {
          const result = await db`SELECT * FROM users WHERE username = ${username} AND password = ${password}`;
          
          if (result.rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
          }

          const user = result.rows[0];
          return res.json({ success: true, user: { id: user.id, username: user.username, role: user.role } });
        } catch (dbError) {
          console.warn('PostgreSQL error, falling back to memory:', dbError.message);
        }
      }
      
      // Fallback to in-memory storage
      const user = users.find(u => u.username === username && u.password === password);
      if (!user) {
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
