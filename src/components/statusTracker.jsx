import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import { useLanguage } from './LanguageContext';
import SearchIcon from '@mui/icons-material/Search';

const StatusTracker = () => {
  const { t } = useLanguage();
  const [trackingId, setTrackingId] = useState('');
  const [requestData, setRequestData] = useState(null);
  const [error, setError] = useState('');

  const steps = [
    t('status.submitted', 'Submitted'),
    t('status.underReview', 'Under Review'),
    t('status.approved', 'Approved'),
    t('status.assigned', 'Assigned to Media'),
    t('status.completed', 'Completed')
  ];

  const handleTrack = async () => {
    if (!trackingId.trim()) {
      setError(t('validation.required'));
      return;
    }

    try {
      // In real app, fetch from API
      // const response = await axios.get(/api/track/${trackingId});
      // setRequestData(response.data);
      
      // Mock data for demonstration
      setRequestData({
        id: trackingId,
        status: 2, // 0-4 representing steps
        organization: "Sample Organization",
        eventDate: "2024-01-15",
        eventType: "pressConference",
        assignedTo: "Bole TV Station",
        contactPerson: "John Doe",
        phone: "+251-911-XXXXXX"
      });
      setError('');
    } catch (err) {
      setError(t('messages.error'));
      setRequestData(null);
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          {t('nav.track')}
        </Typography>
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="body1" paragraph align="center">
            {t('track.instruction', 'Enter your tracking number to check the status of your request')}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              fullWidth
              label={t('track.trackingNumber', 'Tracking Number')}
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              error={!!error}
              helperText={error}
            />
            <Button
              variant="contained"
              onClick={handleTrack}
              startIcon={<SearchIcon />}
              size="large"
            >
              {t('track.search', 'Search')}
            </Button>
          </Box>
        </Box>
        {requestData && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('track.requestDetails', 'Request Details')}
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Stepper activeStep={requestData.status} alternativeLabel>
                  {steps.map((label) => (
                    <Step key={label}>
                      <StepLabel>{label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body2" color="textSecondary">
                    {t('form.organization')}:
                  </Typography>
                  <Typography variant="body1">
                    {requestData.organization}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="body2" color="textSecondary">
                    {t('form.eventDate')}:
                  </Typography>
                  <Typography variant="body1">
                    {requestData.eventDate}
                  </Typography>
                </Grid>
                
                {requestData.assignedTo && (
                  <Grid item xs={12}>
                    <Alert severity="info">
                      {t('track.assignedTo', 'Assigned to')}: {requestData.assignedTo}
                    </Alert>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        )}
      </Paper>
    </Container>
  );
};

export default StatusTracker;