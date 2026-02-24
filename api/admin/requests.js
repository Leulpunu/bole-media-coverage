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
  console.log('API Request:', req.method, req.url);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Get the path without query string
  const urlPath = (req.url || '/').split('?')[0];
  // Remove leading slash and split
  const pathParts = urlPath.replace(/^\//, '').split('/');
  
  console.log('Path parts:', pathParts);
  
  // Handle /admin/requests (GET - fetch all requests)
  if (pathParts[0] === 'admin' && pathParts[1] === 'requests') {
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
        return res.json(mediaRequests);
      } catch (error) {
        console.error('Error fetching requests:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
    
    // Handle PUT to /admin/requests for updating status
    if (req.method === 'PUT') {
      try {
        const { id, status, comments } = req.body;
        
        if (!id) {
          return res.status(400).json({ success: false, message: 'Request ID is required' });
        }

        const db = await getSql();
        if (db) {
          try {
            const result = await db`
              UPDATE media_requests 
              SET status = ${status}, admin_comments = ${comments}, updated_at = CURRENT_TIMESTAMP 
              WHERE id = ${id} 
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
        const index = mediaRequests.findIndex(r => r.id === id);
        if (index === -1) {
          return res.status(404).json({ success: false, message: 'Request not found' });
        }
        mediaRequests[index].status = status;
        mediaRequests[index].admin_comments = comments;
        mediaRequests[index].updated_at = new Date().toISOString();
        
        return res.json({ success: true, message: 'Request status updated successfully' });
      } catch (error) {
        console.error('Error updating request status:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
    
    res.setHeader('Allow', ['GET', 'PUT']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  
  // Handle /admin/update-status endpoint
  if (pathParts[0] === 'admin' && pathParts[1] === 'update-status') {
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
        
        return res.json({ success: true, message: 'Request status updated successfully' });
      } catch (error) {
        console.error('Error updating request status:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
    
    res.setHeader('Allow', ['PUT', 'OPTIONS']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  
  // Default response for unmatched routes
  console.log('Unmatched route:', urlPath);
  res.setHeader('Allow', ['GET', 'PUT', 'OPTIONS']);
  return res.status(405).end(`Method ${req.method} Not Allowed for ${urlPath}`);
};
