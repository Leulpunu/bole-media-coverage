// Vercel serverless function for updating request status
// Handles: PUT /api/admin/requests/:requestId/status

// In-memory storage fallback
const mediaRequests = [];

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

  // Only allow PUT method
  if (req.method !== 'PUT') {
    res.setHeader('Allow', ['PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  // Extract requestId from the URL path
  // Vercel passes the param in query string for dynamic routes
  const requestId = req.query.requestId || req.params?.requestId;
  
  if (!requestId) {
    res.status(400).json({ success: false, message: 'Request ID is required' });
    return;
  }

  try {
    const { status, comments } = req.body;
    
    const db = await getSql();
    if (db) {
      try {
        const result = await db`
          UPDATE media_requests 
          SET status = ${status}, admin_comments = ${comments}, updated_at = CURRENT_TIMESTAMP 
          WHERE id = ${requestId} 
          RETURNING *
        `;
        
        if (result.length === 0) {
          return res.status(404).json({ success: false, message: 'Request not found' });
        }
        
        return res.json({ success: true, message: 'Request status updated successfully' });
      } catch (dbError) {
        console.warn('Database error, falling back to memory:', dbError.message);
      }
    }
    
    // Fallback to in-memory
    const index = mediaRequests.findIndex(r => r.id === requestId);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }
    mediaRequests[index].status = status;
    mediaRequests[index].admin_comments = comments;
    mediaRequests[index].updated_at = new Date().toISOString();
    
    res.json({ success: true, message: 'Request status updated successfully' });
  } catch (error) {
    console.error('Error updating request status:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
