import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './components/AuthContext';
import { LanguageProvider } from './components/LanguageContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Login from './components/Login';
import Home from './components/Home';
import RequestForm from './components/RequestForm';
import StatusTracker from './components/statusTracker';
import AdminPanel from './components/AdminPanel';
import ProtectedRoute from './components/ProtectedRoute';
import Guidelines from './components/Guidelines';
import Contact from './components/Contact';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const AppContent = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Don't show header on login page or when not authenticated
  const showHeader = isAuthenticated && location.pathname !== '/' && location.pathname !== '/login';

  // Show footer on home page, login page, and authenticated pages
  const showFooter = location.pathname === '/' || location.pathname === '/login' || isAuthenticated;

  return (
    <div className="App">
      {showHeader && <Header />}
      <Routes>
        <Route path="/" element={isAuthenticated ? <Home /> : <Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/request" element={
          <ProtectedRoute>
            <RequestForm />
          </ProtectedRoute>
        } />
        <Route path="/track" element={
          <ProtectedRoute>
            <StatusTracker />
          </ProtectedRoute>
        } />
        <Route path="/guidelines" element={
          <ProtectedRoute>
            <Guidelines />
          </ProtectedRoute>
        } />
        <Route path="/contact" element={
          <ProtectedRoute>
            <Contact />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute adminOnly>
            <AdminPanel />
          </ProtectedRoute>
        } />
      </Routes>
      {showFooter && <Footer />}
    </div>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <LanguageProvider>
          <Router>
            <AppContent />
          </Router>
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
