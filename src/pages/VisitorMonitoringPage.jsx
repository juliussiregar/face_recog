import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Table, TableBody, TableCell, TableHead, TableRow, TextField, Button, CircularProgress, Alert } from '@mui/material';
import api from '../services/api';

const VisitorMonitoringPage = () => {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10)); // Default to today's date
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(null); // Error state

  const fetchVisitors = async (selectedDate) => {
    setLoading(true);
    setError(null);
    try {
      // Use the updated API routes from the backend
      const endpoint = selectedDate === new Date().toISOString().slice(0, 10)
        ? '/visitor-monitoring/visitors-today'
        : `/visitor-monitoring/visitors-by-date?date=${selectedDate}`;
      const response = await api.get(endpoint);
      
      // Only include visitors with a valid clock-in time
      // const validVisitors = response.data.filter(visitor => visitor.clock_in_time);
      const validVisitors = response.data.visitors.filter(visitor => visitor.clock_in_time);
      setVisitors(validVisitors);
      // if (Array.isArray(response.data)) {
      //   const validVisitors = response.data.filter(visitor => visitor.clock_in_time);
      //   setVisitors(validVisitors);
      // } else {
      //   setError('Invalid response from API. Please try again later.');
      // }
      
    } catch (error) {
      console.error('Error fetching visitors:', error);
      setError('Failed to fetch visitors. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors(date); // Fetch visitors when the date changes
  }, [date]);

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Visitor Monitoring
      </Typography>

      <Box mb={4} display="flex" alignItems="center">
        <TextField
          label="Select Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <Button
          onClick={() => fetchVisitors(date)}
          variant="contained"
          color="primary"
          sx={{ ml: 2 }}
        >
          Fetch Visitors
        </Button>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Full Name</TableCell>
              <TableCell>Company</TableCell>
              <TableCell>Clock-In Time</TableCell>
              <TableCell>Clock-Out Time</TableCell>
              <TableCell>Total Visting Time</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visitors.length > 0 ? (
              visitors.map((visitor) => (
                <TableRow key={visitor.id}>
                  <TableCell>{visitor.full_name}</TableCell>
                  <TableCell>{visitor.company_name}</TableCell>
                  <TableCell>{visitor.clock_in_time || 'N/A'}</TableCell>
                  <TableCell>{visitor.clock_out_time || 'Still visiting'}</TableCell>
                  <TableCell>{visitor.total_time || 'Still visiting'}</TableCell>
                  <TableCell>{visitor.clock_out_time ? 'Left' : 'Still visiting'}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No visitors found for the selected date.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </Container>
  );
};

export default VisitorMonitoringPage;