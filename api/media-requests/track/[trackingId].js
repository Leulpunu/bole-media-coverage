const { v4: uuidv4 } = require('uuid');

// In-memory storage (in production, use a database)
let mediaRequests = [];

export default function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { trackingId } = req.query;
      const request = mediaRequests.find(req => req.trackingNumber === trackingId);

      if (!request) {
        return res.status(404).json({ success: false, message: 'Request not found' });
      }

      res.json({ success: true, request });
    } catch (error) {
      console.error('Error tracking request:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
