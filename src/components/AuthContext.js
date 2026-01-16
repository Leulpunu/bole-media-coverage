import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (username, password) => {
    try {
      const response = await fetch('/.netlify/functions/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const userData = data.user;
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(userData));
        return userData;
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
  };

  const createClient = async (username, password) => {
    try {
      const response = await fetch('/.netlify/functions/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return data.user;
      } else {
        throw new Error(data.message || 'Failed to create user');
      }
    } catch (error) {
      console.error('Create user error:', error);
      throw error;
    }
  };

  const getClients = async () => {
    try {
      const response = await fetch('/.netlify/functions/admin/users');
      const data = await response.json();

      if (response.ok) {
        return data;
      } else {
        throw new Error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Get users error:', error);
      throw error;
    }
  };

  const deleteClient = async (userId) => {
    try {
      const response = await fetch(`/.netlify/functions/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }
    } catch (error) {
      console.error('Delete user error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      login,
      logout,
      createClient,
      getClients,
      deleteClient
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
