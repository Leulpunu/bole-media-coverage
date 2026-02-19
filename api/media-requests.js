const { v4: uuidv4 } = require('uuid');
const { addMediaRequest } = require('./utils/kv');

module.exports = async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const requestData = req.body;
      const newRequest = {
        id: uuidv4(),
        ...requestData,
        status: 'pending',
        createdAt: new Date().toISOString(),
        trackingNumber: `REQ-${Date.now()}`
      };

      // Save to Vercel KV for persistent storage
      await addMediaRequest(newRequest);

      res.status(201).json({
        success: true,
        message: 'Request submitted successfully',
        trackingNumber: newRequest.trackingNumber,
        request: newRequest
      });
    } catch (error) {
      console.error('Error submitting request:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
