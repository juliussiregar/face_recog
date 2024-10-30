// src/pages/CCTV.js
import React from 'react';
import { Typography, Box } from '@mui/material';

const CCTV = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" color="primary">
        CCTV Monitoring
      </Typography>
      <Typography variant="body1" sx={{ mt: 2 }}>
        Halaman ini digunakan untuk monitoring CCTV secara real-time.
        Tambahkan komponen tambahan sesuai kebutuhan seperti streaming video atau tampilan live feed.
      </Typography>
    </Box>
  );
};

export default CCTV;
