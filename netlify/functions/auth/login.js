// In-memory storage fallback (used when PostgreSQL is not configured)
const users = [
  { id: '1', username: 'admin', password: 'admin123', role: 'admin', created_at: new Date().toISOString() },
  { id: '2', username: 'editor', password: 'editor123', role: 'editor', created_at: new Date().toISOString() }
];

// Lazy-load database client
let sql = null;

async function getSql() {
  if (sql !== null) return sql;
  
  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  
  if (!databaseUrl) {
    console.log('No database configured, using in-memory storage');
    return null;
  }
  
  try {
    // Try @neondatabase/serverless first (works with any PostgreSQL connection)
    const { neon } = await import('@neondatabase/serverless');
    sql = neon(databaseUrl);
    
    // Test the connection and create tables if needed
    try {
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
      if (existingAdmin.length === 0) {
        await sql`INSERT INTO users (id, username, password, role) VALUES ('1', 'admin', 'admin123', 'admin')`;
        await sql`INSERT INTO users (id, username, password, role) VALUES ('2', 'editor', 'editor123', 'editor')`;
      }
      
      console.log('Database connected and initialized');
    } catch (initError) {
      console.warn('Database initialization error:', initError.message);
    }
    
    return sql;
  } catch (e) {
    console.warn('Failed to initialize database:', e.message);
    sql = null;
    return null;
  }
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

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
      
      // Try database first, fallback to in-memory
      const db = await getSql();
      if (db) {
        try {
          const result = await db`
            SELECT id, username, role FROM users WHERE username = ${username} AND password = ${password}
          `;

          if (result.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
          }

          const user = result[0];
          return res.json({ success: true, user: { id: user.id, username: user.username, role: user.role } });
        } catch (dbError) {
          console.warn('Database query error, falling back to memory:', dbError.message);
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
}
