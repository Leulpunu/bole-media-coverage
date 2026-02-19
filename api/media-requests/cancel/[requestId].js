const { findMediaRequestById, updateMediaRequest } = require('../../utils/kv');

module.exports = async function handler(req, res) {
  if (req.method === 'PUT') {
    try {
      const { requestId } = req.query;
      const { reason } = req.body;

      // Get from Vercel KV for persistent storage
      const existingRequest = await findMediaRequestById(requestId);

      if (!existingRequest) {
        return res.status(404).json({ success: false, message: 'Request not found' });
      }

      // Update the request status in KV
      await updateMediaRequest(requestId, {
        status: 'cancelled',
        cancelReason: reason,
        cancelledAt: new Date().toISOString()
      });

      res.json({ success: true, message: 'Request cancelled successfully' });
    } catch (error) {
      console.error('Error cancelling request:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
