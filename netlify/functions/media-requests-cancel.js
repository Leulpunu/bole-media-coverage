// In-memory storage (in production, use a database)
let mediaRequests = [];

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'PUT') {
    try {
      // Extract requestId from query parameters
      const { requestId } = req.query;
      const { reason } = req.body;

      if (!requestId) {
        return res.status(400).json({ success: false, message: 'Request ID is required' });
      }

      const requestIndex = mediaRequests.findIndex(req => req.id === requestId);

      if (requestIndex === -1) {
        return res.status(404).json({ success: false, message: 'Request not found' });
      }

      mediaRequests[requestIndex].status = 'cancelled';
      mediaRequests[requestIndex].cancelledAt = new Date().toISOString();
      mediaRequests[requestIndex].cancelReason = reason;

      res.json({ success: true, message: 'Request cancelled successfully' });
    } catch (error) {
      console.error('Error cancelling request:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
