import React from 'react';
import { Container, Paper, Typography } from '@mui/material';

const LoginPage = () => {
  return (
    <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" align="center" color="primary" gutterBottom>
          Admin Login
        </Typography>
        <Typography variant="h6" align="center" color="textSecondary" gutterBottom>
          Login feature is currently disabled.
        </Typography>
      </Paper>
    </Container>
  );
};

export default LoginPage;