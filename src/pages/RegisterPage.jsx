import React, { useState } from 'react';
import Register from '../components/Auth/Register'; // Pastikan Register mendukung pendaftaran visitor
import { Container, Paper, Typography, Box, Snackbar, Alert as MuiAlert } from '@mui/material';
import authService from '../services/authService'; // Import authService untuk menggunakan registerVisitor

const RegisterPage = () => {
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleRegisterError = (message) => {
    setErrorMessage(message);
    setSuccessMessage(null);
    setOpenSnackbar(true);
  };

  const handleRegisterSuccess = (message) => {
    setSuccessMessage(message);
    setErrorMessage(null);
    setOpenSnackbar(true);
  };

  const handleVisitorRegister = async (visitorData) => {
    try {
      await authService.registerVisitor(visitorData); // Tidak menyimpan response jika tidak digunakan
      handleRegisterSuccess('Visitor registered successfully');
    } catch (error) {
      handleRegisterError('Failed to register visitor');
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  return (
    <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" align="center" color="primary" gutterBottom>
          Register Visitor
        </Typography>
        <Register 
          onRegister={handleVisitorRegister} // Pastikan komponen Register memanggil fungsi ini dengan data yang benar
        />
      </Paper>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <MuiAlert
          onClose={handleCloseSnackbar}
          severity={errorMessage ? 'error' : 'success'}
          sx={{ width: '100%' }}
          elevation={6}
          variant="filled"
        >
          {errorMessage || successMessage}
        </MuiAlert>
      </Snackbar>
    </Container>
  );
};

export default RegisterPage;