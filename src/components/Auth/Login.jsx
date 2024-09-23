import React, { useState, useEffect } from 'react';
import { TextField, Button, Alert, CircularProgress, Box, Typography } from '@mui/material';
import axios from 'axios';  // Import Axios untuk melakukan permintaan ke backend

const Login = ({ onLoginError, onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    username: '',  
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      setErrors({});
    }
  }, [errors, formData.username, formData.password]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.username) {
      newErrors.username = 'Username is required';  
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting form with:', formData);
  
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      setLoading(true);
      console.log('Making POST request to API using fetch...');
  
      try {
        const response = await fetch('http://127.0.0.1:5000/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
  
        if (!response.ok) {
          throw new Error('Login failed');
        }
  
        const data = await response.json();
        localStorage.setItem('token', data.access_token);  // Save token to localStorage
        setLoading(false);
        onLoginSuccess('Login successful!');
      } catch (error) {
        setLoading(false);
        onLoginError(error.message);
      }
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Typography variant="h6" gutterBottom>
        Login
      </Typography>
      <TextField
        label="Username"
        name="username"
        value={formData.username}
        onChange={handleChange}
        fullWidth
        margin="normal"
        error={!!errors.username}
        helperText={errors.username}
      />
      <TextField
        label="Password"
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        fullWidth
        margin="normal"
        error={!!errors.password}
        helperText={errors.password}
      />
      <Box mt={2}>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Login'}
        </Button>
      </Box>
      {errors.global && <Alert severity="error">{errors.global}</Alert>}
    </Box>
  );
};

export default Login;