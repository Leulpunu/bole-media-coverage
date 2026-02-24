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

  if (!sql) {
    return res.status(503).json({ success: false, message: 'Database not configured' });
  }

  try {
    if (req.method === 'GET') {
      // Return all media requests
      const result = await sql`
        SELECT * FROM media_requests ORDER BY created_at DESC
      `;
      res.status(200).json(result);
      return;
    }

    if (req.method === 'PUT') {
      // Update request status - support both URL param and body
      // URL pattern: /admin/requests/:id/status
      const urlParts = req.url.split('/');
      const statusIndex = urlParts.indexOf('status');
      
      let id, status, comments;
      
      if (statusIndex > 0) {
        // URL has /admin/requests/:id/status format
        id = urlParts[statusIndex - 1];
        ({ status, comments } = req.body);
      } else {
        // Body has id
        ({ id, status, comments } = req.body);
      }
      
      if (!id) {
        res.status(400).json({ success: false, message: 'Request ID is required' });
        return;
      }

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
    }

    if (req.method === 'DELETE') {
      // Delete a request
      const { id } = req.query;
      
      if (!id) {
        res.status(400).json({ success: false, message: 'Request ID is required' });
        return;
      }

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
    }

    // Method not allowed
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error('Error in admin/requests handler:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}
