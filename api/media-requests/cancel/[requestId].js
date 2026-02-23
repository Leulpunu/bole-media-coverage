// In-memory storage fallback
const mediaRequests = [];

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

  // Extract requestId from the URL
  const requestId = req.params.requestId;

  // PUT /api/media-requests/cancel/:requestId - Cancel request
  if (req.method === 'PUT') {
    try {
      const { reason } = req.body;
      
      if (sql) {
        try {
          const result = await sql`
            UPDATE media_requests 
            SET status = 'cancelled', cancel_reason = ${reason}, cancelled_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
            WHERE id = ${requestId} 
            RETURNING *
          `;
          
          if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Request not found' });
          }
          
          return res.json({ success: true, message: 'Request cancelled successfully' });
        } catch (dbError) {
          console.warn('PostgreSQL error, falling back to memory:', dbError.message);
        }
      }
      
      // Fallback to in-memory
      const index = mediaRequests.findIndex(r => r.id === requestId);
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Request not found' });
      }
      mediaRequests[index].status = 'cancelled';
      mediaRequests[index].cancel_reason = reason;
      mediaRequests[index].cancelled_at = new Date().toISOString();
      mediaRequests[index].updated_at = new Date().toISOString();
      
      res.json({ success: true, message: 'Request cancelled successfully' });
    } catch (error) {
      console.error('Error cancelling request:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
  else {
    res.setHeader('Allow', ['PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
