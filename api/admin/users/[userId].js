// In-memory storage fallback
const users = [
  { id: '1', username: 'admin', password: 'admin123', role: 'admin', created_at: new Date().toISOString() },
  { id: '2', username: 'editor', password: 'editor123', role: 'editor', created_at: new Date().toISOString() }
];

// Lazy-load PostgreSQL client
let sql = null;
async function getSql() {
  if (sql !== null) return sql;
  
  try {
    if (!process.env.POSTGRES_URL && !process.env.DATABASE_URL) {
      return null;
    }
    
    const postgres = await import('@vercel/postgres');
    sql = postgres.default;
    return sql;
  } catch (e) {
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

  // Extract userId from the URL
  const userId = req.params.userId;

  // DELETE /api/admin/users/:userId - Delete a user
  if (req.method === 'DELETE') {
    try {
      const db = await getSql();
      if (db) {
        try {
          const result = await db`DELETE FROM users WHERE id = ${userId} RETURNING id`;
          
          if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
          }
          
          return res.json({ success: true, message: 'User deleted successfully' });
        } catch (dbError) {
          console.warn('PostgreSQL error, falling back to memory:', dbError.message);
        }
      }
      
      // Fallback to in-memory
      const index = users.findIndex(u => u.id === userId);
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      users.splice(index, 1);
      res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
  else {
    res.setHeader('Allow', ['DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
