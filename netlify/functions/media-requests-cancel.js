const { neon } = require('@neondatabase/serverless');

// Get database connection
const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'PUT') {
    try {
      if (!sql) {
        return res.status(503).json({ success: false, message: 'Database not configured' });
      }

      // Extract requestId from query parameters
      const { requestId } = req.query;
      const { reason } = req.body;

      if (!requestId) {
        return res.status(400).json({ success: false, message: 'Request ID is required' });
      }

      // Check if request exists
      const existing = await sql`
        SELECT * FROM media_requests WHERE id = ${requestId}
      `;

      if (existing.length === 0) {
        return res.status(404).json({ success: false, message: 'Request not found' });
      }

      // Update the request status
      await sql`
        UPDATE media_requests 
        SET status = 'cancelled', 
            cancel_reason = ${reason},
            cancelled_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${requestId}
      `;

      res.json({ success: true, message: 'Request cancelled successfully' });
    } catch (error) {
      console.error('Error cancelling request:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
