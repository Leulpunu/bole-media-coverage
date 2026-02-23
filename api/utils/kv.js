// Vercel KV (Redis) integration for persistent storage
// This file provides KV store functions for the API endpoints

// Check if we're in Vercel production with Redis configured
const isVercelWithRedis = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN;

// In-memory store for local development (when Redis is not available)
const memoryStore = {
  users: new Map(),
  mediaRequests: new Map()
};

// Initialize with some default users for testing
memoryStore.users.set('admin', {
  id: '1',
  username: 'admin',
  password: 'admin123',
  role: 'admin'
});

memoryStore.users.set('editor', {
  id: '2',
  username: 'editor',
  password: 'editor123',
  role: 'editor'
});

// Lazy-load the KV client only when needed
let kvClient = null;
async function getKvClient() {
  if (kvClient) return kvClient;
  
  if (isVercelWithRedis) {
    try {
      const { kv } = await import('@vercel/kv');
      kvClient = kv;
      return kvClient;
    } catch (e) {
      console.warn('Failed to import @vercel/kv, falling back to memory store');
    }
  }
  return null;
}

// User functions
async function getUsers() {
  const kv = await getKvClient();
  if (kv) {
    const users = await kv.get('users');
    return users || [];
  }
  return Array.from(memoryStore.users.values());
}

async function findUserByUsername(username) {
  const kv = await getKvClient();
  if (kv) {
    // Try both formats for backward compatibility
    let user = await kv.get(`user:${username}`);
    if (!user) {
      // Also check if stored with just username (legacy)
      const allUsers = await kv.get('users') || [];
      user = allUsers.find(u => u.username === username) || null;
    }
    return user;
  }
  // For memory store, try both key formats
  let user = memoryStore.users.get(username);
  if (!user) {
    // Check values for username match
    for (const u of memoryStore.users.values()) {
      if (u.username === username) {
        user = u;
        break;
      }
    }
  }
  return user || null;
}

async function addUser(user) {
  const kv = await getKvClient();
  if (kv) {
    // Store with consistent key format
    await kv.set(`user:${user.username}`, user);
    // Also update the users list
    const users = await kv.get('users') || [];
    // Check if user already exists in list
    const existingIndex = users.findIndex(u => u.username === user.username);
    if (existingIndex >= 0) {
      users[existingIndex] = user;
    } else {
      users.push(user);
    }
    await kv.set('users', users);
    return user;
  }
  // Store in memory with username as key for backward compatibility
  memoryStore.users.set(user.username, user);
  return user;
}

async function deleteUser(userId) {
  const kv = await getKvClient();
  if (kv) {
    const users = await kv.get('users') || [];
    const filtered = users.filter(u => u.id !== userId);
    await kv.set('users', filtered);
    // Also delete individual user
    for (const user of users) {
      if (user.id === userId) {
        await kv.del(`user:${user.username}`);
        break;
      }
    }
    return true;
  }
  for (const [username, user] of memoryStore.users) {
    if (user.id === userId) {
      memoryStore.users.delete(username);
      return true;
    }
  }
  return false;
}

// Media request functions
async function addMediaRequest(request) {
  const kv = await getKvClient();
  if (kv) {
    await kv.set(`request:${request.trackingId}`, request);
    const requests = await kv.get('mediaRequests') || [];
    requests.push(request);
    await kv.set('mediaRequests', requests);
    return request;
  }
  memoryStore.mediaRequests.set(request.trackingId, request);
  return request;
}

async function findMediaRequestByTracking(trackingId) {
  const kv = await getKvClient();
  if (kv) {
    return await kv.get(`request:${trackingId}`);
  }
  return memoryStore.mediaRequests.get(trackingId) || null;
}

async function findMediaRequestById(requestId) {
  const kv = await getKvClient();
  if (kv) {
    const requests = await kv.get('mediaRequests') || [];
    return requests.find(r => r.id === requestId) || null;
  }
  for (const request of memoryStore.mediaRequests.values()) {
    if (request.id === requestId) {
      return request;
    }
  }
  return null;
}

async function updateMediaRequest(requestId, updates) {
  const kv = await getKvClient();
  if (kv) {
    const requests = await kv.get('mediaRequests') || [];
    const index = requests.findIndex(r => r.id === requestId);
    if (index !== -1) {
      requests[index] = { ...requests[index], ...updates };
      await kv.set('mediaRequests', requests);
      await kv.set(`request:${requests[index].trackingId}`, requests[index]);
      return requests[index];
    }
    return null;
  }
  for (const [trackingId, request] of memoryStore.mediaRequests) {
    if (request.id === requestId) {
      const updated = { ...request, ...updates };
      memoryStore.mediaRequests.set(trackingId, updated);
      return updated;
    }
  }
  return null;
}

async function getAllMediaRequests() {
  const kv = await getKvClient();
  if (kv) {
    const requests = await kv.get('mediaRequests');
    return requests || [];
  }
  return Array.from(memoryStore.mediaRequests.values());
}

module.exports = {
  getUsers,
  findUserByUsername,
  addUser,
  deleteUser,
  addMediaRequest,
  findMediaRequestByTracking,
  findMediaRequestById,
  updateMediaRequest,
  getAllMediaRequests
};
