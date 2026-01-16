import React from 'react';
import BackButton from './BackButton';
import {
  Container,
  Typography,
  Paper,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import { useLanguage } from './LanguageContext';

const Guidelines = () => {
  const { t } = useLanguage();

  const guidelines = [
    t('guidelines.accurateInfo', 'Provide accurate and complete information in your request.'),
    t('guidelines.requiredFields', 'Ensure all required fields are filled out.'),
    t('guidelines.deadlines', 'Respect the deadlines and follow-up procedures.'),
    t('guidelines.contactSupport', 'Contact support if you have any questions.')
  ];

  const additionalTips = [
    t('guidelines.submitEarly', 'Submit your request at least 48 hours before the event.'),
    t('guidelines.provideDetails', 'Provide detailed event description and expected audience size.'),
    t('guidelines.mediaTypes', 'Specify the types of media coverage you require.'),
    t('guidelines.confirmation', 'Wait for confirmation before proceeding with event planning.')
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
          {t('nav.guidelines', 'Media Coverage Guidelines')}
        </Typography>

        <Typography
          variant="body1"
          paragraph
          align="center"
          sx={{ mb: 4 }}
        >
          {t('guidelines.introduction', 'Here are the guidelines for requesting media coverage:')}
        </Typography>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom color="primary">
            {t('guidelines.required', 'Required Guidelines')}
          </Typography>
          <List>
            {guidelines.map((guideline, index) => (
              <ListItem key={index} sx={{ px: 0 }}>
                <ListItemIcon>
                  <CheckCircleIcon color="success" />
                </ListItemIcon>
                <ListItemText primary={guideline} />
              </ListItem>
            ))}
          </List>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom color="secondary">
            {t('guidelines.additionalTips', 'Additional Tips')}
          </Typography>
          <List>
            {additionalTips.map((tip, index) => (
              <ListItem key={index} sx={{ px: 0 }}>
                <ListItemIcon>
                  <InfoIcon color="info" />
                </ListItemIcon>
                <ListItemText primary={tip} />
              </ListItem>
            ))}
          </List>
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            {t('guidelines.note', 'Note: All requests are subject to approval based on availability and relevance.')}
          </Typography>
        </Alert>

        <Alert severity="warning">
          <Typography variant="body2">
            {t('guidelines.emergency', 'For emergency media coverage requests, please contact us directly via phone.')}
          </Typography>
        </Alert>
      </Paper>
    </Container>
  );
};

export default Guidelines;
