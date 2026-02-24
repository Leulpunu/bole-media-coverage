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

  // Parse URL path - req.url is like /admin/update-status or /admin/requests
  const urlPath = (req.url || '').replace(/^\//, '');
  const pathParts = urlPath.split('/');
  
  // Handle /api/admin/update-status endpoint
  // pathParts will be: ['admin', 'update-status'] after Vercel strips /api
  if (pathParts[0] === 'admin' && pathParts[1] === 'update-status') {
    // PUT /api/admin/update-status - Update request status
    if (req.method === 'PUT') {
      try {
        const { requestId, status, comments } = req.body;
        
        if (!requestId) {
          return res.status(400).json({ success: false, message: 'Request ID is required' });
        }

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
    } else {
      res.setHeader('Allow', ['PUT', 'OPTIONS']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
    return;
  }
  
  // Handle /api/admin/requests endpoint - Get all requests
  if (pathParts[0] === 'admin' && pathParts[1] === 'requests') {
    // GET /api/admin/requests - Get all requests
    if (req.method === 'GET') {
      try {
        const db = await getSql();
        if (db) {
          try {
            const result = await db`SELECT * FROM media_requests ORDER BY created_at DESC`;
            return res.json(result);
          } catch (dbError) {
            console.warn('Database error, falling back to memory:', dbError.message);
          }
        }
        
        // Fallback to in-memory
        res.json(mediaRequests);
      } catch (error) {
        console.error('Error fetching requests:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
    // PUT /api/admin/requests/:requestId/status - Update request status
    else if (req.method === 'PUT' && pathParts.length >= 3 && pathParts[2]) {
      const requestId = pathParts[2];
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
    }
    else {
      res.setHeader('Allow', ['GET', 'PUT']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
    return;
  }
  
  // Default response for unmatched routes
  res.setHeader('Allow', ['GET', 'PUT', 'OPTIONS']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
};
