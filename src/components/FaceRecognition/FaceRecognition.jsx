import React, { useState, useEffect, useRef } from 'react';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
import useFaceRecognition from '../../hooks/useFaceRecognition'; // Custom hook

const FaceRecognition = ({ onClockIn }) => {
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState('');
  const [isFaceDetected, setIsFaceDetected] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [visitorData, setVisitorData] = useState(null);
  const webcamRef = useRef(null);

  const { handleFaceRecognition } = useFaceRecognition(); // Custom hook

  // Load models on component mount
  useEffect(() => {
    const loadModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/');
        await faceapi.nets.faceLandmark68Net.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/');
        await faceapi.nets.faceRecognitionNet.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/');
        console.log("Models successfully loaded");
        setModelsLoaded(true);
      } catch (error) {
        setAlertMessage('Error loading models');
        setAlertType('error');
        console.error('Error loading models:', error);
      }
    };
    loadModels();
  }, []);

  const handleFaceDetection = async () => {
    if (webcamRef.current && modelsLoaded) {
      const screenshot = webcamRef.current.getScreenshot();
      if (screenshot) {
        try {
          const matchResult = await handleFaceRecognition(screenshot);
          if (matchResult.matched) {
            setVisitorData(matchResult.visitor); // Process clock-in or clock-out
            setAlertMessage('Clock-in/out successful');
            setAlertType('success');
          } else {
            setAlertMessage('Face not recognized');
            setAlertType('warning');
          }
        } catch (error) {
          setAlertMessage('Error during face recognition: ' + error.message);
          setAlertType('error');
        }
      } else {
        setAlertMessage('No face detected');
        setAlertType('warning');
      }
    }
  };

  // Automatically check for face detection every second
  useEffect(() => {
    if (!modelsLoaded) return; // Wait until models are fully loaded
    const interval = setInterval(() => {
      handleFaceDetection();
    }, 1000); // Check for face every second
    return () => clearInterval(interval);
  }, [modelsLoaded]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 3,
        maxWidth: 500,
        mx: 'auto',
        mt: 4,
      }}
    >
      <Typography variant="h5" gutterBottom>
        Face Recognition Clock-in
      </Typography>
      {alertMessage && (
        <Alert severity={alertType} onClose={() => setAlertMessage(null)} sx={{ mb: 2 }}>
          {alertMessage}
        </Alert>
      )}
      <Webcam
        ref={webcamRef}
        audio={false}
        screenshotFormat="image/jpeg"
        width="100%"
        videoConstraints={{
          width: 640,
          height: 480,
          facingMode: 'user',
        }}
        style={{ marginBottom: '16px', borderRadius: '8px' }}
      />
      {loading && <CircularProgress size={24} sx={{ mt: 2 }} />}
      {visitorData && (
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="h6">Welcome, {visitorData.fullName}!</Typography>
          <Typography variant="body1">NIK: {visitorData.nik}</Typography>
          <Typography variant="body1">Company: {visitorData.companyName}</Typography>
          <Typography variant="body1">Address: {visitorData.address}</Typography>
          <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
            Clock-in Successful!
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default FaceRecognition;