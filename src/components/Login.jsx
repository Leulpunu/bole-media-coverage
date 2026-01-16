import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';
import {
  TextField,
  Button,
  Container,
  Paper,
  Typography,
  Alert,
  Box,
  AppBar,
  Toolbar,
  FormControl,
  Select,
  MenuItem
} from '@mui/material';

const Login = () => {
  const { t, language, changeLanguage } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(credentials.username, credentials.password);
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/request');
      }
    } catch (err) {
      setError(err.message || t('login.error', 'Invalid credentials'));
    }
  };

  return (
    <div>
      <AppBar position="static" sx={{ mb: 4 }}>
        <Toolbar sx={{ justifyContent: 'flex-end' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={language}
              onChange={(e) => changeLanguage(e.target.value)}
              sx={{ color: 'white', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'white' } }}
            >
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="am">አማርኛ</MenuItem>
            </Select>
          </FormControl>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
          <Typography variant="h4" gutterBottom align="center">
            {t('login.welcome', 'Welcome Bole subcity communciation')}
          </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label={t('login.username', 'Username')}
            name="username"
            value={credentials.username}
            onChange={handleChange}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label={t('login.password', 'Password')}
            name="password"
            type="password"
            value={credentials.password}
            onChange={handleChange}
            margin="normal"
            required
          />

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
            >
              {t('login.submit', 'Login')}
            </Button>
          </Box>
        </form>
        
        <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 2 }}>
          copy right Version 1.0.0 - ELT Technology
        </Typography>
      </Paper>
    </Container>
    </div>
  );
};

export default Login;
