import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { Box } from '@mui/material';

const Header = () => {
  const isLoggedIn = true; // This can be replaced with actual state or context for login check
  const navigate = useNavigate(); // Hook for programmatic navigation

  const handleLogout = () => {
    // Logic for logout, like clearing auth token
    navigate('/login'); // Navigate to login page after logout
  };

  return (
    <AppBar position="static" color="default" elevation={2}>
      <Toolbar>
        <Typography variant="h6" color="primary" sx={{ flexGrow: 1 }}>
          Face Recognition App
        </Typography>
        <Box>
          <Button
            component={Link}
            to="/"
            variant="outlined"
            color="primary"
            sx={{ mx: 1 }}
          >
            Home
          </Button>
          <Button
            component={Link}
            to="/visitor-monitoring" // Changed from visitor-management to visitor-monitoring
            variant="outlined"
            color="primary"
            sx={{ mx: 1 }}
          >
            Visitor Monitoring
          </Button>
          <Button
            component={Link}
            to="/face-recognition"
            variant="outlined"
            color="primary"
            sx={{ mx: 1 }}
          >
            Face Recognition
          </Button>
          {isLoggedIn ? (
            <Button
              onClick={handleLogout} // Changed to onClick for logout
              variant="contained"
              color="primary"
              sx={{ mx: 1 }}
            >
              Logout
            </Button>
          ) : (
            <Button
              component={Link}
              to="/login"
              variant="contained"
              color="primary"
              sx={{ mx: 1 }}
            >
              Login
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;