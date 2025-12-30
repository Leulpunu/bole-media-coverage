import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box,
  IconButton,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LanguageIcon from '@mui/icons-material/Language';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { useLanguage } from './LanguageContext';
import { useAuth } from './AuthContext';

const Header = () => {
  const { language, toggleLanguage, t } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [userMenuAnchorEl, setUserMenuAnchorEl] = React.useState(null);
  const navigate = useNavigate();

  const navItems = [
    { label: t('nav.home'), path: '/' },
    { label: t('nav.request'), path: '/request' },
    { label: t('nav.track'), path: '/track' },
    { label: t('nav.guidelines'), path: '/guidelines' },
    { label: t('nav.contact'), path: '/contact' }
  ];

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleUserMenu = (event) => {
    setUserMenuAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleUserMenuClose();
    navigate('/');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
          <img
            src={`${process.env.PUBLIC_URL}/logo192.png`}
            alt="Logo"
            style={{ height: 40, width: 40, marginRight: 8 }}
          />
          <Typography variant="h6" component="div">
            {t('app.title')}
          </Typography>
        </Box>

        {isMobile ? (
          <>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleMenu}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              {navItems.map((item) => (
                <MenuItem 
                  key={item.path}
                  component={RouterLink}
                  to={item.path}
                  onClick={handleClose}
                >
                  {item.label}
                </MenuItem>
              ))}
            </Menu>
          </>
        ) : (
          <Box sx={{ display: 'flex', gap: 2 }}>
            {navItems.map((item) => (
              <Button
                key={item.path}
                color="inherit"
                component={RouterLink}
                to={item.path}
              >
                {item.label}
              </Button>
            ))}
          </Box>
        )}

        {/* Authentication buttons */}
        {isAuthenticated ? (
          <>
            {user.role === 'admin' && (
              <Button
                color="inherit"
                component={RouterLink}
                to="/admin"
                sx={{ ml: 1 }}
              >
                {t('nav.admin', 'Admin')}
              </Button>
            )}
            <IconButton
              color="inherit"
              onClick={handleUserMenu}
              sx={{ ml: 1 }}
              aria-label="user menu"
            >
              <AccountCircle />
            </IconButton>
            <Menu
              anchorEl={userMenuAnchorEl}
              open={Boolean(userMenuAnchorEl)}
              onClose={handleUserMenuClose}
            >
              <MenuItem disabled>
                <Typography variant="body2">
                  {t('user.welcome', 'Welcome')}, {user.username}
                </Typography>
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                {t('user.logout', 'Logout')}
              </MenuItem>
            </Menu>
          </>
        ) : (
          <Button
            color="inherit"
            onClick={handleLogin}
            sx={{ ml: 2 }}
          >
            {t('user.login', 'Login')}
          </Button>
        )}

        <IconButton
          color="inherit"
          onClick={toggleLanguage}
          sx={{ ml: 1 }}
          aria-label="switch language"
        >
          <LanguageIcon />
          <Typography variant="caption" sx={{ ml: 1 }}>
            {language === 'en' ? 'አማ' : 'EN'}
          </Typography>
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default Header;