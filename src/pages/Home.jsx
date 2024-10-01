import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Button, 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Snackbar, 
  Alert as MuiAlert, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  IconButton, 
  TextField,
  Modal,
  Card,
  CardContent,
  CardMedia
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import api from '../services/api';

const Home = () => {
  const [visitors, setVisitors] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchVisitors = async () => {
    try {
      const response = await api.get('/visitors');
      setVisitors(response.data.visitors);
    } catch (error) {
      console.error('Failed to fetch visitors', error);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, []);

  const showAlert = (type, message) => {
    setAlertType(type);
    setAlertMessage(message);
    setOpenSnackbar(true);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
    setAlertMessage(null);
  };

  const handleDeleteVisitor = async (id) => {
    try {
      await api.delete(`/visitors/${id}`);
      setVisitors(visitors.filter(visitor => visitor.id !== id));
      showAlert('success', 'Visitor deleted successfully.');
    } catch (error) {
      console.error('Failed to delete visitor', error);
      showAlert('error', 'Failed to delete visitor.');
    }
  };

  const handleViewDetails = (visitor) => {
    setSelectedVisitor(visitor);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedVisitor(null);
  };

  const filteredVisitors = visitors.filter(visitor => {
    const nik = visitor.nik? visitor.nik : '';
    const fullName = visitor.full_name ? visitor.full_name.toLowerCase() : '';
    const companyName = visitor.company_name ? visitor.company_name.toLowerCase() : '';
    const bornDate = visitor.born_date ? visitor.born_date : '';
    
    return (
      nik.includes(searchKeyword) ||
      fullName.includes(searchKeyword.toLowerCase()) ||
      companyName.includes(searchKeyword.toLowerCase()) ||
      bornDate.includes(searchKeyword)
    );
  });

  return (
    <Container maxWidth="lg" sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center" color="primary">
          Visitor Management Dashboard
        </Typography>

        <Box display="flex" justifyContent="space-between" mb={2}>
          <TextField
            label="Search Visitors"
            variant="outlined"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            sx={{ width: '300px' }}
          />
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            component={Link}
            to="/register"
          >
            Add New Visitor
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>NIK</TableCell>
                <TableCell>Full Name</TableCell>
                <TableCell>Company</TableCell>
                <TableCell>Birth Date</TableCell>
                <TableCell>Image</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredVisitors.map(visitor => (
                <TableRow key={visitor.id}>
                  <TableCell>{visitor.nik}</TableCell>
                  <TableCell>{visitor.full_name}</TableCell>
                  <TableCell>{visitor.company_name}</TableCell>
                  <TableCell>{visitor.born_date}</TableCell>
                  <TableCell>
                    <img 
                      src={`data:image/jpeg;base64,${visitor.image}`} 
                      alt={visitor.full_name} 
                      width="50" 
                      height="50" 
                      style={{ borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      color="primary"
                      aria-label="view details"
                      onClick={() => handleViewDetails(visitor)}
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      aria-label="delete visitor"
                      onClick={() => handleDeleteVisitor(visitor.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Modal open={isModalOpen} onClose={handleCloseModal}>
        <Box 
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: '8px',
            width: 400,
          }}
        >
          <Card sx={{ padding: 2 }}>
            <IconButton
              sx={{ position: 'absolute', top: 8, right: 8 }}
              onClick={handleCloseModal}
            >
              <CloseIcon />
            </IconButton>
            {selectedVisitor && (
              <CardContent>
                <Typography variant="h5" component="div" sx={{ marginBottom: 2 }}>
                  {selectedVisitor.full_name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  NIK: {selectedVisitor.nik}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Company: {selectedVisitor.company_name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Birth Date: {selectedVisitor.born_date}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Created At: {selectedVisitor.created_at}
                </Typography>
                <Box mt={2} sx={{ display: 'flex', justifyContent: 'center' }}>
                  <CardMedia
                    component="img"
                    image={`data:image/jpeg;base64,${selectedVisitor.image}`}
                    alt={selectedVisitor.full_name}
                    sx={{ width: 200, height: 200, borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}
                  />
                </Box>
              </CardContent>
            )}
          </Card>
        </Box>
      </Modal>

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

export default Home;