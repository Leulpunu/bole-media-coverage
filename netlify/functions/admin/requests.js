const { neon } = require('@neondatabase/serverless');

// Get database connection
const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;

// In-memory storage fallback
const mediaRequests = [];

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      // If database is available, use it
      if (sql) {
        try {
          const result = await sql`
            SELECT * FROM media_requests ORDER BY created_at DESC
          `;
          res.status(200).json(result);
          return;
        } catch (dbError) {
          console.warn('Database error, falling back to memory:', dbError.message);
        }
      }
      // Fallback to in-memory
      res.status(200).json(mediaRequests);
      return;
    }

    if (req.method === 'PUT') {
      // Update request status - support both URL param and body
      const { id, status, comments } = req.body;
      
      if (!id) {
        res.status(400).json({ success: false, message: 'Request ID is required' });
        return;
      }

      // If database is available, use it
      if (sql) {
        try {
          const result = await sql`
            UPDATE media_requests 
            SET status = COALESCE(${status}, status),
                admin_comments = COALESCE(${comments}, admin_comments),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ${id}
            RETURNING *
          `;

          if (result.length === 0) {
            res.status(404).json({ success: false, message: 'Request not found' });
            return;
          }

          res.status(200).json({
            success: true,
            message: 'Request updated successfully',
            request: result[0]
          });
          return;
        } catch (dbError) {
          console.warn('Database error, falling back to memory:', dbError.message);
        }
      }
      
      // Fallback to in-memory
      const index = mediaRequests.findIndex(r => r.id === id);
      if (index === -1) {
        res.status(404).json({ success: false, message: 'Request not found' });
        return;
      }
      
      mediaRequests[index].status = status;
      mediaRequests[index].admin_comments = comments;
      mediaRequests[index].updated_at = new Date().toISOString();
      
      res.status(200).json({
        success: true,
        message: 'Request updated successfully',
        request: mediaRequests[index]
      });
      return;
    }

    if (req.method === 'DELETE') {
      const { id } = req.body || req.query;
      
      if (!id) {
        res.status(400).json({ success: false, message: 'Request ID is required' });
        return;
      }

      // If database is available, use it
      if (sql) {
        try {
          const result = await sql`
            DELETE FROM media_requests WHERE id = ${id} RETURNING id
          `;

          if (result.length === 0) {
            res.status(404).json({ success: false, message: 'Request not found' });
            return;
          }

          res.status(200).json({
            success: true,
            message: 'Request deleted successfully'
          });
          return;
        } catch (dbError) {
          console.warn('Database error, falling back to memory:', dbError.message);
        }
      }
      
      // Fallback to in-memory
      const index = mediaRequests.findIndex(r => r.id === id);
      if (index === -1) {
        res.status(404).json({ success: false, message: 'Request not found' });
        return;
      }
      
      mediaRequests.splice(index, 1);
      
      res.status(200).json({
        success: true,
        message: 'Request deleted successfully'
      });
      return;
    }

    // Method not allowed
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error('Error in admin/requests handler:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}
