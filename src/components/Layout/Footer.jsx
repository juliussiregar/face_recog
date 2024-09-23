import React from 'react';
import { Container, Typography, Box, Link } from '@mui/material';

const Footer = () => {
  return (
    <Box component="footer" sx={{ bgcolor: 'primary.dark', color: 'white', py: 4 }}>
      <Container maxWidth="lg" sx={{ textAlign: 'center' }}>
        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
          © {new Date().getFullYear()} Face Recognition App. All rights reserved.
        </Typography>
        <Typography variant="caption" sx={{ mt: 1, color: 'grey.500' }}>
          Dibangun dengan ❤️ menggunakan <Link href="https://reactjs.org/" color="inherit" underline="hover">React</Link> dan <Link href="https://mui.com/" color="inherit" underline="hover">Material-UI</Link>.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;