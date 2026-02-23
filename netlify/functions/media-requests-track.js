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

  if (req.method === 'GET') {
    try {
      if (!sql) {
        return res.status(503).json({ success: false, message: 'Database not configured' });
      }

      // Extract trackingId from query parameters
      const { trackingId } = req.query;

      if (!trackingId) {
        return res.status(400).json({ success: false, message: 'Tracking ID is required' });
      }

      const result = await sql`
        SELECT * FROM media_requests WHERE tracking_id = ${trackingId}
      `;

      if (result.length === 0) {
        return res.status(404).json({ success: false, message: 'Request not found' });
      }

      res.json({ success: true, request: result[0] });
    } catch (error) {
      console.error('Error tracking request:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
