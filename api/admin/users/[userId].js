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

  // Extract userId from the URL
  const userId = req.params.userId;

  // DELETE /api/admin/users/:userId - Delete a user
  if (req.method === 'DELETE') {
    try {
      if (sql) {
        try {
          const result = await sql`DELETE FROM users WHERE id = ${userId} RETURNING id`;
          
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
