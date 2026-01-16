import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Box } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useLanguage } from './LanguageContext';

const BackButton = ({ to = '/', label }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleBack = () => {
    if (to === 'back') {
      navigate(-1);
    } else {
      navigate(to);
    }
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Button
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        onClick={handleBack}
        sx={{
          borderRadius: 2,
          textTransform: 'none',
          fontWeight: 'bold'
        }}
      >
        {label || t('back', 'Back')}
      </Button>
    </Box>
  );
};

export default BackButton;
