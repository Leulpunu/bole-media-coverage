// In-memory storage (in production, use a database)
// Note: This is a separate instance from media-requests.js
// In production, you'd want to share the same database
let adminMediaRequests = [];

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
      // Return all media requests
      res.status(200).json(adminMediaRequests);
      return;
    }

    if (req.method === 'PUT') {
      // Update request status
      const { id, status, comments } = req.body;
      
      if (!id) {
        res.status(400).json({ success: false, message: 'Request ID is required' });
        return;
      }

      const requestIndex = adminMediaRequests.findIndex(r => r.id === id);
      
      if (requestIndex === -1) {
        res.status(404).json({ success: false, message: 'Request not found' });
        return;
      }

      adminMediaRequests[requestIndex] = {
        ...adminMediaRequests[requestIndex],
        status: status || adminMediaRequests[requestIndex].status,
        adminComments: comments || adminMediaRequests[requestIndex].adminComments,
        updatedAt: new Date().toISOString()
      };

      res.status(200).json({
        success: true,
        message: 'Request updated successfully',
        request: adminMediaRequests[requestIndex]
      });
      return;
    }

    if (req.method === 'POST') {
      // Create a new request (for testing purposes)
      const requestData = req.body;
      const newRequest = {
        id: (adminMediaRequests.length + 1).toString(),
        ...requestData,
        status: 'pending',
        createdAt: new Date().toISOString(),
        trackingNumber: `REQ-${Date.now()}`
      };

      adminMediaRequests.push(newRequest);

      res.status(201).json({
        success: true,
        message: 'Request created successfully',
        request: newRequest
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

      const requestIndex = adminMediaRequests.findIndex(r => r.id === id);
      
      if (requestIndex === -1) {
        res.status(404).json({ success: false, message: 'Request not found' });
        return;
      }

      adminMediaRequests.splice(requestIndex, 1);

      res.status(200).json({
        success: true,
        message: 'Request deleted successfully'
      });
      return;
    }

    // Method not allowed
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error('Error in admin/requests handler:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}
