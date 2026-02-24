// Handle PUT /api/admin/update-status
// This is a separate endpoint to avoid Vercel routing issues

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

  // PUT /api/admin/update-status - Update request status
  if (req.method === 'PUT') {
    // In-memory storage fallback
    const mediaRequests = [];
    
    try {
      const { requestId, status, comments } = req.body;
      
      if (!requestId) {
        return res.status(400).json({ success: false, message: 'Request ID is required' });
      }

      // Lazy-load database
      let sql = null;
      const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
      
      if (databaseUrl) {
        try {
          const { neon } = await import('@neondatabase/serverless');
          sql = neon(databaseUrl);
          
          const result = await sql`
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
          console.warn('Database error:', dbError.message);
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
  }
  else {
    res.setHeader('Allow', ['PUT', 'OPTIONS']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
