// In-memory storage fallback
const mediaRequests = [];

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

  // Extract trackingId from the URL
  const trackingId = req.params.trackingId;

  // GET /api/media-requests/track/:trackingId - Track request
  if (req.method === 'GET') {
    try {
      const db = await getSql();
      if (db) {
        try {
          const result = await db`SELECT * FROM media_requests WHERE tracking_id = ${trackingId}`;
          if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Request not found' });
          }
          return res.json({ success: true, request: result.rows[0] });
        } catch (dbError) {
          console.warn('PostgreSQL error, falling back to memory:', dbError.message);
        }
      }
      
      // Fallback to in-memory
      const request = mediaRequests.find(r => r.tracking_id === trackingId);
      if (!request) {
        return res.status(404).json({ success: false, message: 'Request not found' });
      }
      res.json({ success: true, request });
    } catch (error) {
      console.error('Error tracking request:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
  else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
