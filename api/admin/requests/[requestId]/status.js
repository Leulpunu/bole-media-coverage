// In-memory storage (in production, use a database)
let mediaRequests = [];

export default function handler(req, res) {
  if (req.method === 'PUT') {
    try {
      const { requestId } = req.query;
      const { status, comments } = req.body;

      const requestIndex = mediaRequests.findIndex(req => req.id === requestId);

      if (requestIndex === -1) {
        return res.status(404).json({ success: false, message: 'Request not found' });
      }

      mediaRequests[requestIndex].status = status;
      if (comments) {
        mediaRequests[requestIndex].adminComments = comments;
      }
      mediaRequests[requestIndex].updatedAt = new Date().toISOString();

      res.json({ success: true, message: 'Request status updated successfully' });
    } catch (error) {
      console.error('Error updating request status:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
