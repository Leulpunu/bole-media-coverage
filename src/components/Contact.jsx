import React from 'react';
import BackButton from './BackButton';
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useLanguage } from './LanguageContext';

const Contact = () => {
  const { t } = useLanguage();

  const contactInfo = [
    {
      icon: <EmailIcon color="primary" fontSize="large" />,
      title: 'Email',
      value: 'atenafuabush@gmail.com',
      href: 'mailto:atenafuabush@gmail.com'
    },
    {
      icon: <PhoneIcon color="primary" fontSize="large" />,
      title: 'Phone',
      value: '+251-911028712',
      href: 'tel:+251911028712'
    },
    {
      icon: <LocationOnIcon color="primary" fontSize="large" />,
      title: 'Address',
      value: 'Megenagna, Addis Ababa',
      href: null
    }
  ];

  return (
    <Container maxWidth="md">
      <BackButton />
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, mt: 4 }}>
        <Typography
          variant="h4"
          gutterBottom
          align="center"
          sx={{ mb: 3 }}
        >
          {t('nav.contact', 'Contact Us')}
        </Typography>

        <Typography
          variant="body1"
          paragraph
          align="center"
          sx={{ mb: 4 }}
        >
          {t('contact.instruction', 'If you have any questions or need assistance, please contact us:')}
        </Typography>

        <Grid container spacing={3}>
          {contactInfo.map((item, index) => (
            <Grid item size={{ xs: 12, sm: 6, md: 4 }} key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  p: 2,
                  '&:hover': {
                    boxShadow: 6,
                    transform: 'translateY(-2px)',
                    transition: 'all 0.3s ease'
                  }
                }}
              >
                <Box sx={{ mb: 2 }}>
                  {item.icon}
                </Box>
                <CardContent sx={{ p: 0, flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {item.title}
                  </Typography>
                  {item.href ? (
                    <Typography
                      variant="body1"
                      component="a"
                      href={item.href}
                      sx={{
                        color: 'primary.main',
                        textDecoration: 'none',
                        '&:hover': {
                          textDecoration: 'underline'
                        }
                      }}
                    >
                      {item.value}
                    </Typography>
                  ) : (
                    <Typography variant="body1">
                      {item.value}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            {t('contact.officeHours', 'Office Hours')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('contact.hours', 'Monday - Friday: 8:00 AM - 5:00 PM')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('contact.weekend', 'Saturday: 9:00 AM - 12:00 PM')}
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Contact;
