import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { LanguageProvider, useLanguage } from './components/LanguageContext';
import { AuthProvider } from './components/AuthContext';
import Header from './components/Header';
import RequestForm from './components/RequestForm';
import StatusTracker from './components/statusTracker';
import Login from './components/Login';
import AdminPanel from './components/AdminPanel';
import ProtectedRoute from './components/ProtectedRoute';
import './styles/App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2E7D32', // Green color
    },
    secondary: {
      main: '#D32F2F', // Red color
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      '"Noto Sans Ethiopic"',
      'sans-serif'
    ].join(','),
  },
});

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <ThemeProvider theme={theme}>
          <Router>
            <div className="App">
              <Header />
              <main>
                <Routes>
                  <Route path="/" element={<Login />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/request" element={<ProtectedRoute><RequestForm /></ProtectedRoute>} />
                  <Route path="/track" element={<ProtectedRoute><StatusTracker /></ProtectedRoute>} />
                  <Route path="/admin" element={<ProtectedRoute adminOnly><AdminPanel /></ProtectedRoute>} />
                  <Route path="/guidelines" element={<GuidelinesPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </ThemeProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}



function GuidelinesPage() {
  const { t } = useLanguage();

  return (
    <div className="guidelines">
      <h2>{t('guidelines.title', 'Media Coverage Guidelines')}</h2>
      <ul>
        <li>{t('guidelines.1', 'Submit requests at least 48 hours in advance')}</li>
        <li>{t('guidelines.2', 'Provide accurate event details')}</li>
        <li>{t('guidelines.3', 'Include contact information')}</li>
        <li>{t('guidelines.4', 'Specify media requirements clearly')}</li>
      </ul>
    </div>
  );
}

function ContactPage() {
  const { t } = useLanguage();

  return (
    <div className="contact">
      <h2>{t('contact.title', 'Contact Information')}</h2>
      <p><strong>{t('contact.address', 'Address')}:</strong> Bole Sub City Communication Office, Addis Ababa</p>
      <p><strong>{t('contact.phone', 'Phone')}:</strong> +251-XXX-XXXXXX</p>
      <p><strong>{t('contact.email', 'Email')}:</strong> bole.communication@addisababa.gov.et</p>
    </div>
  );
}

function Footer() {
  const { t } = useLanguage();

  return (
    <footer>
      <p>© {new Date().getFullYear()} Bole Sub City Communication Office</p>
      <p>{t('footer.officeHours', 'Office Hours: Mon-Fri, 8:30 AM - 5:30 PM')}</p>
    </footer>
  );
}

export default App;
