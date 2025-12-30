import React, { useState } from 'react';
import { useLanguage } from './LanguageContext';
import { 
  TextField, 
  Button, 
  Container, 
  Grid, 
  Paper, 
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Box
} from '@mui/material';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { mediaRequestService } from '../services/api';

const RequestForm = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    organization: '',
    contactPerson: '',
    phone: '',
    email: '',
    eventDate: null,
    eventTime: null,
    location: '',
    eventType: '',
    mediaTypes: [],
    description: '',
    expectedAudience: '',
    specialRequirements: ''
  });
  
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMediaTypeChange = (event) => {
    const { value } = event.target;
    setFormData(prev => ({
      ...prev,
      mediaTypes: typeof value === 'string' ? value.split(',') : value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.organization) newErrors.organization = t('validation.required');
    if (!formData.contactPerson) newErrors.contactPerson = t('validation.required');
    if (!formData.phone) newErrors.phone = t('validation.required');
    if (!formData.email) newErrors.email = t('validation.required');
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = t('validation.email');
    if (!formData.eventDate) newErrors.eventDate = t('validation.required');
    if (!formData.location) newErrors.location = t('validation.required');
    if (!formData.eventType) newErrors.eventType = t('validation.required');
    if (formData.mediaTypes.length === 0) newErrors.mediaTypes = t('validation.required');
    if (!formData.description) newErrors.description = t('validation.required');
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    try {
      const response = await mediaRequestService.submitRequest(formData);

      if (response.success) {
        setSubmitted(true);
        setTrackingNumber(response.trackingNumber);
        setFormData({
          organization: '',
          contactPerson: '',
          phone: '',
          email: '',
          eventDate: null,
          eventTime: null,
          location: '',
          eventType: '',
          mediaTypes: [],
          description: '',
          expectedAudience: '',
          specialRequirements: ''
        });
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert(t('messages.error'));
    }
  };

  const handleReset = () => {
    setFormData({
      organization: '',
      contactPerson: '',
      phone: '',
      email: '',
      eventDate: null,
      eventTime: null,
      location: '',
      eventType: '',
      mediaTypes: [],
      description: '',
      expectedAudience: '',
      specialRequirements: ''
    });
    setErrors({});
  };return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          {t('form.title')}
        </Typography>
        
        {submitted && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {t('messages.success')}
            <br />
            {t('messages.trackingNumber').replace('{number}', trackingNumber)}
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Grid container spacing={3}>
              {/* Organization Details */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('form.organization')}
                  name="organization"
                  value={formData.organization}
                  onChange={handleChange}
                  error={!!errors.organization}
                  helperText={errors.organization}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('form.contactPerson')}
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleChange}
                  error={!!errors.contactPerson}
                  helperText={errors.contactPerson}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('form.phone')}
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  error={!!errors.phone}
                  helperText={errors.phone}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('form.email')}
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!errors.email}
                  helperText={errors.email}
                  required
                />
              </Grid>
              
              {/* Event Details */}
              <Grid item xs={12}>
                <DatePicker
                  label={t('form.eventDate')}
                  value={formData.eventDate}
                  onChange={(newValue) => setFormData({...formData, eventDate: newValue})}
                  enableAccessibleFieldDOMStructure={false}
                  slots={{ textField: TextField }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.eventDate,
                      helperText: errors.eventDate,
                      required: true
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TimePicker
                  label={t('form.eventTime')}
                  value={formData.eventTime}
                  onChange={(newValue) => setFormData({...formData, eventTime: newValue})}
                  enableAccessibleFieldDOMStructure={false}
                  slots={{ textField: TextField }}
                  slotProps={{
                    textField: {
                      fullWidth: true
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('form.location')}
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  error={!!errors.location}
                  helperText={errors.location}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth error={!!errors.eventType}>
                  <InputLabel>{t('form.eventType')}</InputLabel>
                  <Select
                    name="eventType"
                    value={formData.eventType}
                    onChange={handleChange}
                    label={t('form.eventType')}
                    required
                  >
                    <MenuItem value="pressConference">{t('form.eventTypes.pressConference')}</MenuItem>
                    <MenuItem value="officialCeremony">{t('form.eventTypes.officialCeremony')}</MenuItem>
                    <MenuItem value="communityEvent">{t('form.eventTypes.communityEvent')}</MenuItem>
                    <MenuItem value="emergency">{t('form.eventTypes.emergency')}</MenuItem>
                    <MenuItem value="other">{t('form.eventTypes.other')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              {/* Media Types */}
              <Grid item xs={12}>
                <FormControl fullWidth error={!!errors.mediaTypes}>
                  <InputLabel>{t('form.mediaType')}</InputLabel>
                  <Select
                    multiple
                    name="mediaTypes"
                    value={formData.mediaTypes}
                    onChange={handleMediaTypeChange}
                    label={t('form.mediaType')}
                    required
                  >
                    <MenuItem value="tv">{t('form.mediaTypes.tv')}</MenuItem>
                    <MenuItem value="radio">{t('form.mediaTypes.radio')}</MenuItem>
                    <MenuItem value="print">{t('form.mediaTypes.print')}</MenuItem>
                    <MenuItem value="online">{t('form.mediaTypes.online')}</MenuItem>
                    <MenuItem value="all">{t('form.mediaTypes.all')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              {/* Description */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label={t('form.description')}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  error={!!errors.description}
                  helperText={errors.description}
                  required
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('form.expectedAudience')}
                  name="expectedAudience"
                  value={formData.expectedAudience}
                  onChange={handleChange}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label={t('form.specialRequirements')}
                  name="specialRequirements"
                  value={formData.specialRequirements}
                  onChange={handleChange}
                />
              </Grid>
              
              {/* Buttons */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                  >
                    {t('form.submit')}
                  </Button>
                  
                  <Button
                    variant="outlined"
                    color="secondary"
                    size="large"
                    onClick={handleReset}
                  >
                    {t('form.reset')}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </LocalizationProvider>
        </form>
      </Paper>
    </Container>
  );
};

export default RequestForm;