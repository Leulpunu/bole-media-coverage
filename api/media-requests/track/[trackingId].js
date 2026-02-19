const { findMediaRequestByTracking } = require('../utils/kv');

module.exports = async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { trackingId } = req.query;
      const request = await findMediaRequestByTracking(trackingId);

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
