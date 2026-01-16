import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  AppBar,
  Toolbar,
  FormControl,
  Select,
  MenuItem,
  IconButton,
  Avatar,
  Menu
} from '@mui/material';
import { useLanguage } from './LanguageContext';
import { useAuth } from './AuthContext';

const Home = () => {
  const { t, language, changeLanguage } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    handleClose();
  };

  const quickActions = [
    {
      title: t('home.submitRequest', 'Submit Media Request'),
      description: t('home.submitRequestDesc', 'Create a new media coverage request for your event'),
      path: '/request',
      color: 'primary'
    },
    {
      title: t('home.trackRequest', 'Track Your Request'),
      description: t('home.trackRequestDesc', 'Check the status of your submitted requests'),
      path: '/track',
      color: 'secondary'
    },
    {
      title: t('home.guidelines', 'View Guidelines'),
      description: t('home.guidelinesDesc', 'Read the media coverage guidelines and requirements'),
      path: '/guidelines',
      color: 'info'
    },
    {
      title: t('home.contact', 'Contact Us'),
      description: t('home.contactDesc', 'Get in touch with our support team'),
      path: '/contact',
      color: 'success'
    }
  ];

  return (
    <Container maxWidth="lg">
      <AppBar position="static" sx={{ mb: 4 }}>
        <Toolbar>
          <Box sx={{ flexGrow: 1 }} />
          <FormControl size="small" sx={{ mr: 2 }}>
            <Select
              value={language}
              onChange={(e) => changeLanguage(e.target.value)}
              sx={{ color: 'white', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'white' } }}
            >
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="an">አማርኛ</MenuItem>
            </Select>
          </FormControl>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body1" sx={{ mr: 1, color: 'white' }}>
              {user?.username}
            </Typography>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <Avatar sx={{ width: 32, height: 32 }}>
                {user?.username?.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h3" gutterBottom align="center" color="primary">
          {t('app.welcome', 'Welcome to Bole Media Coverage')}
        </Typography>
        <Typography variant="h6" align="center" color="text.secondary" sx={{ mb: 4 }}>
          {t('home.subtitle', 'Manage your media coverage requests efficiently')}
        </Typography>

        <Grid container spacing={3}>
          {quickActions.map((action, index) => (
            <Grid item size={{ xs: 12, sm: 6, md: 3 }} key={index}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom color={`${action.color}.main`}>
                    {action.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {action.description}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    color={action.color}
                    variant="contained"
                    fullWidth
                    onClick={() => navigate(action.path)}
                  >
                    {t('home.go', 'Go')}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {user?.role === 'admin' && (
          <Box sx={{ mt: 4 }}>
            <Paper elevation={2} sx={{ p: 3, backgroundColor: 'primary.light', color: 'primary.contrastText' }}>
              <Typography variant="h6" gutterBottom>
                {t('home.adminPanel', 'Admin Panel Access')}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {t('home.adminDesc', 'You have administrative privileges. Access the admin panel to manage requests and users.')}
              </Typography>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => navigate('/admin')}
              >
                {t('home.goToAdmin', 'Go to Admin Panel')}
              </Button>
            </Paper>
          </Box>
        )}

        <Box sx={{ mt: 4 }}>
          <Paper elevation={1} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t('home.recentActivity', 'Recent Activity')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('home.noRecentActivity', 'No recent activity to display. Submit a request to get started.')}
            </Typography>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
};

export default Home;
