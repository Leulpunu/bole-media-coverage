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

  if (event.httpMethod === 'GET') {
    try {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(users.map(u => ({ id: u.id, username: u.username, role: u.role, createdAt: u.createdAt || new Date().toISOString() })))
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ success: false, message: 'Internal server error' })
      };
    }
  } else if (event.httpMethod === 'POST') {
    try {
      const { username, password } = JSON.parse(event.body);

      if (users.find(u => u.username === username)) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ success: false, message: 'Username already exists' })
        };
      }

      const newUser = {
        id: (users.length + 1).toString(),
        username,
        password,
        role: 'user',
        createdAt: new Date().toISOString()
      };

      users.push(newUser);

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({ success: true, message: 'User created successfully' })
      };
    } catch (error) {
      console.error('Error creating user:', error);
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
=======
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

  if (event.httpMethod === 'GET') {
    try {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(users.map(u => ({ id: u.id, username: u.username, role: u.role, createdAt: u.createdAt || new Date().toISOString() })))
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ success: false, message: 'Internal server error' })
      };
    }
  } else if (event.httpMethod === 'POST') {
    try {
      const { username, password } = JSON.parse(event.body);

      if (users.find(u => u.username === username)) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ success: false, message: 'Username already exists' })
        };
      }

      const newUser = {
        id: (users.length + 1).toString(),
        username,
        password,
        role: 'user',
        createdAt: new Date().toISOString()
      };

      users.push(newUser);

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({ success: true, message: 'User created successfully' })
      };
    } catch (error) {
      console.error('Error creating user:', error);
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
