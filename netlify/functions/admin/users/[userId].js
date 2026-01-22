// In-memory storage (in production, use a database)
let users = [
  { id: '1', username: 'admin', password: 'admin123', role: 'admin' },
  { id: '2', username: 'user', password: 'user123', role: 'user' }
];

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  const userId = event.path.split('/').pop();

  if (event.httpMethod === 'DELETE') {
    try {
      const userIndex = users.findIndex(u => u.id === userId);

      if (userIndex === -1) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ success: false, message: 'User not found' })
        };
      }

      users.splice(userIndex, 1);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, message: 'User deleted successfully' })
      };
    } catch (error) {
      console.error('Error deleting user:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ success: false, message: 'Internal server error' })
      };
    }
  } else {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ message: `Method ${event.httpMethod} Not Allowed` })
    };
  }
};
