const { v4: uuidv4 } = require('uuid');
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

  if (req.method === 'POST') {
    try {
      if (!sql) {
        return res.status(503).json({ success: false, message: 'Database not configured' });
      }

      const requestData = req.body;
      const id = uuidv4();
      const trackingId = `REQ-${Date.now()}`;

      const result = await sql`
        INSERT INTO media_requests (
          id, tracking_id, requester_name, organization, email, phone,
          media_type, coverage_type, event_name, event_date, event_location,
          description, status
        ) VALUES (
          ${id}, ${trackingId}, ${requestData.requesterName}, ${requestData.organization},
          ${requestData.email}, ${requestData.phone}, ${requestData.mediaType},
          ${requestData.coverageType}, ${requestData.eventName}, ${requestData.eventDate},
          ${requestData.eventLocation}, ${requestData.description}, 'pending'
        )
        RETURNING *
      `;

      res.status(201).json({
        success: true,
        message: 'Request submitted successfully',
        trackingNumber: trackingId,
        request: result[0]
      });
    } catch (error) {
      console.error('Error submitting request:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
