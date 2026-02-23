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

  // POST /api/media-requests - Submit new request
  if (req.method === 'POST') {
    try {
      const requestData = req.body;
      const id = Date.now().toString();
      const trackingId = `REQ-${Date.now()}`;
      
      if (sql) {
        try {
          await sql`
            INSERT INTO media_requests (
              id, tracking_id, requester_name, organization, email, phone,
              media_type, coverage_type, event_name, event_date, event_location,
              description, status
            ) VALUES (
              ${id}, ${trackingId}, ${requestData.requesterName},
              ${requestData.organization}, ${requestData.email}, ${requestData.phone},
              ${requestData.mediaType}, ${requestData.coverageType}, ${requestData.eventName},
              ${requestData.eventDate}, ${requestData.eventLocation}, ${requestData.description},
              'pending'
            )
          `;
          
          return res.status(201).json({
            success: true,
            message: 'Request submitted successfully',
            trackingNumber: trackingId,
            request: {
              id,
              tracking_id: trackingId,
              ...requestData,
              status: 'pending'
            }
          });
        } catch (dbError) {
          console.warn('PostgreSQL error, falling back to memory:', dbError.message);
        }
      }
      
      // Fallback to in-memory
      const newRequest = {
        id,
        tracking_id: trackingId,
        ...requestData,
        status: 'pending',
        created_at: new Date().toISOString()
      };
      mediaRequests.push(newRequest);
      
      res.status(201).json({
        success: true,
        message: 'Request submitted successfully',
        trackingNumber: trackingId,
        request: newRequest
      });
    } catch (error) {
      console.error('Error submitting request:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
  else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
