const { v4: uuidv4 } = require('uuid');
const { addMediaRequest } = require('./utils/db');

module.exports = async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const requestData = req.body;
      const trackingId = `REQ-${Date.now()}-${uuidv4().slice(0, 8)}`;
      
      const newRequest = {
        id: uuidv4(),
        trackingId: trackingId,
        requesterName: requestData.requesterName,
        organization: requestData.organization,
        email: requestData.email,
        phone: requestData.phone,
        mediaType: requestData.mediaType,
        coverageType: requestData.coverageType,
        eventName: requestData.eventName,
        eventDate: requestData.eventDate,
        eventLocation: requestData.eventLocation,
        description: requestData.description,
        status: 'pending'
      };

      // Save to PostgreSQL for persistent storage
      const savedRequest = await addMediaRequest(newRequest);

      if (!savedRequest) {
        return res.status(500).json({ success: false, message: 'Failed to save request' });
      }

      res.status(201).json({
        success: true,
        message: 'Request submitted successfully',
        trackingNumber: trackingId,
        request: savedRequest
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
