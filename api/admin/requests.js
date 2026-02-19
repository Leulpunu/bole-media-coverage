// Admin API endpoint for managing media requests
// This handles GET (fetch all requests) and PUT (update request status)

const { getAllMediaRequests, updateMediaRequest } = require('../utils/kv');

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      // Return all media requests
      const requests = await getAllMediaRequests();
      res.status(200).json(requests);
      return;
    }

    if (req.method === 'PUT') {
      // Update request status
      const { id, status, comments } = req.body;
      
      if (!id) {
        res.status(400).json({ success: false, message: 'Request ID is required' });
        return;
      }

      const updatedRequest = await updateMediaRequest(id, {
        status,
        adminComments: comments
      });
      
      if (!updatedRequest) {
        res.status(404).json({ success: false, message: 'Request not found' });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Request updated successfully',
        request: updatedRequest
      });
      return;
    }

    // Method not allowed
    res.setHeader('Allow', ['GET', 'PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error('Error in admin/requests handler:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}
