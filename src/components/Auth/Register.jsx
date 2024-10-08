import React, { useState, useRef, useCallback, useEffect } from 'react';
import { TextField, Button, Alert, CircularProgress, Box, Typography } from '@mui/material';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';

const Register = ({ onRegister }) => {
  const [formData, setFormData] = useState({
    nik: '',
    fullName: '',
    bornDate: '',
    address: '',
    companyName: '',
    email: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState('');
  const [imageSrc, setImageSrc] = useState(null);
  const [isFaceDetected, setIsFaceDetected] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  const webcamRef = useRef(null);

  useEffect(() => {
    const loadModels = async () => {
      try {
        console.log("Loading tiny face detector...");
        await faceapi.nets.tinyFaceDetector.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/');
        console.log("Tiny face detector loaded");

        console.log("Loading face landmark model...");
        await faceapi.nets.faceLandmark68Net.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/');
        console.log("Face landmark model loaded");

        console.log("Loading face recognition model...");
        await faceapi.nets.faceRecognitionNet.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/');
        console.log("Face recognition model loaded");

        setModelsLoaded(true);
      } catch (error) {
        console.error('Error loading models:', error);
      }
    };

    loadModels();
  }, []);

  const handleFaceDetection = async () => {
    if (webcamRef.current && modelsLoaded && isCapturing) {
      const videoElement = webcamRef.current.video;
      const detections = await faceapi.detectAllFaces(
        videoElement,
        new faceapi.TinyFaceDetectorOptions()
      );
      if (detections.length > 0) {
        setIsFaceDetected(true);
        captureimage();
      } else {
        setIsFaceDetected(false);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.nik) newErrors.nik = 'NIK is required';
    if (!formData.fullName) newErrors.fullName = 'Full name is required';
    if (!formData.bornDate) newErrors.bornDate = 'Birth date is required';
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.companyName) newErrors.companyName = 'Company name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!imageSrc) newErrors.image = 'Please capture an image';
    return newErrors;
  };

  const captureimage = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      // Remove the base64 prefix
      const imageBase64 = imageSrc.replace(/^data:image\/[a-z]+;base64,/, "");
      setImageSrc(imageBase64);
      console.log("Captured image (base64):", imageBase64);
    }
  }, [webcamRef]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setAlertType('error');
      setAlertMessage('Please fix the errors in the form');
    } else {
      setLoading(true);
      setAlertMessage(null);

      const dataToSend = {
        nik: formData.nik,
        full_name: formData.fullName, // Use full_name as backend expects
        born_date: formData.bornDate,
        address: formData.address,
        company_name: formData.companyName,
        email: formData.email,
        image: imageSrc, // Base64 image without prefix
      };

      console.log("Data sent to backend:", dataToSend);

      try {
        await onRegister(dataToSend);
        setAlertType('success');
        setAlertMessage('Visitor registered successfully!');
        setFormData({
          nik: '',
          fullName: '',
          bornDate: '',
          address: '',
          companyName: '',
          email: '',
        });
        setImageSrc(null);
        setIsCapturing(false);
      } catch (error) {
        setAlertType('error');
        setAlertMessage('Registration failed. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const startCapture = () => {
    setIsCapturing(true);
  };

  useEffect(() => {
    if (isCapturing) {
      const interval = setInterval(() => {
        handleFaceDetection();
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [modelsLoaded, isCapturing]);

  return (
    <Box
      sx={{
        maxWidth: 400,
        mx: 'auto',
        p: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxShadow: 3,
        borderRadius: 2,
        bgcolor: 'background.paper',
      }}
    >
      <Typography variant="h5" component="h2" gutterBottom>
        Register Visitor
      </Typography>
      {alertMessage && (
        <Alert severity={alertType} onClose={() => setAlertMessage(null)} sx={{ mb: 2, width: '100%' }}>
          {alertMessage}
        </Alert>
      )}
      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        {/* Form Fields */}
        <TextField
          fullWidth
          label="NIK"
          name="nik"
          value={formData.nik}
          onChange={handleChange}
          error={!!errors.nik || formData.nik.length < 16 || formData.nik.length > 16}
          helperText={errors.nik || (formData.nik.length < 16 ? 'NIK must be at least 16 characters' : 'NIK must be at most 16 characters')}
          variant="outlined"
          margin="normal"
        />
        <TextField
          fullWidth
          label="Full Name"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          error={!!errors.fullName}
          helperText={errors.fullName}
          variant="outlined"
          margin="normal"
        />
        <TextField
          fullWidth
          label="Birth Date"
          name="bornDate"
          type="date"
          value={formData.bornDate}
          onChange={handleChange}
          error={!!errors.bornDate}
          helperText={errors.bornDate}
          variant="outlined"
          margin="normal"
          InputLabelProps={{
            shrink: true,
          }}
        />
        <TextField
          fullWidth
          label="Address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          error={!!errors.address}
          helperText={errors.address}
          variant="outlined"
          margin="normal"
        />
        <TextField
          fullWidth
          label="Company Name"
          name="companyName"
          value={formData.companyName}
          onChange={handleChange}
          error={!!errors.companyName}
          helperText={errors.companyName}
          variant="outlined"
          margin="normal"
        />
        <TextField
          fullWidth
          label="Email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          error={!!errors.email}
          helperText={errors.email}
          variant="outlined"
          margin="normal"
        />

        {/* Webcam and Face Detection */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="body1">Capture Visitor image</Typography>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/png"
            width="100%"
            videoConstraints={{
              facingMode: "user"
            }}
            style={{ marginBottom: '16px', position: 'relative' }}
          />
          {modelsLoaded && isCapturing ? (
            isFaceDetected ? (
              <Typography variant="body2" color="success.main">Face detected, capturing image...</Typography>
            ) : (
              <Typography variant="body2" color="error">No face detected</Typography>
            )
          ) : (
            <Typography variant="body2" color="warning">Loading face detection models...</Typography>
          )}
          {errors.image && <Typography color="error">{errors.image}</Typography>}
          {imageSrc && (
            <Box>
              <Typography variant="body2" gutterBottom>Captured image:</Typography>
              <img src={`data:image/png;base64,${imageSrc}`} alt="Captured" style={{ width: '100%', borderRadius: '4px' }} />
            </Box>
          )}
        </Box>

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} />}
          sx={{ mt: 2, py: 1.5, borderRadius: 1 }}
          onClick={startCapture}
        >
          {loading ? 'Registering...' : 'Register Visitor'}
        </Button>
      </form>
    </Box>
  );
};

export default Register;