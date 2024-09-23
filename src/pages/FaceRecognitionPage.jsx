import React, { useState } from 'react';
import FaceRecognition from '../components/FaceRecognition/FaceRecognition';
import { Container, Typography, Box, Paper, Snackbar, Alert as MuiAlert } from '@mui/material';

const FaceRecognitionPage = () => {
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  // Handle recognition results and show the appropriate message
  const handleFaceRecognitionResult = (type, message) => {
    setAlertType(type);
    setAlertMessage(message);
    setOpenSnackbar(true);
  };

  // Close the Snackbar when requested
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
    setAlertMessage(null);
  };

  return (
    <Container maxWidth="md" sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Paper elevation={3} sx={{ p: 4, mt: 4, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" align="center" color="primary" gutterBottom>
          Face Recognition
        </Typography>

        {/* Face Recognition Component */}
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" mt={4}>
          <FaceRecognition onRecognitionResult={handleFaceRecognitionResult} />
        </Box>
      </Paper>

      {/* Snackbar for showing alerts */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <MuiAlert
          onClose={handleCloseSnackbar}
          severity={alertType}
          sx={{ width: '100%' }}
          elevation={6}
          variant="filled"
        >
          {alertMessage}
        </MuiAlert>
      </Snackbar>
    </Container>
  );
};

export default FaceRecognitionPage;