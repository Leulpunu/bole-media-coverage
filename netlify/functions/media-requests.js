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

  if (req.method === 'POST') {
    try {
      const requestData = req.body;
      const newRequest = {
        id: (mediaRequests.length + 1).toString(),
        ...requestData,
        status: 'pending',
        createdAt: new Date().toISOString(),
        trackingNumber: `REQ-${Date.now()}`
      };

      mediaRequests.push(newRequest);

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
