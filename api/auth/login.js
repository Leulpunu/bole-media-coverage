// In-memory storage fallback (used when PostgreSQL is not configured)
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

  if (req.method === 'POST') {
    try {
      const { username, password } = req.body;
      
      // Try PostgreSQL first, fallback to in-memory
      if (sql) {
        try {
          const result = await sql`SELECT * FROM users WHERE username = ${username} AND password = ${password}`;
          
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
