import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  CircularProgress,
  Typography,
  Alert,
  Button,
} from "@mui/material";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";
import useFaceRecognition from "../../hooks/useFaceRecognition"; // Custom hook

const FaceRecognition = ({ onClockIn = () => { }, onClockOut = () => { } }) => {
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState("");
  const [isFaceDetected, setIsFaceDetected] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [visitorData, setVisitorData] = useState(null);
  const webcamRef = useRef(null);

  const { handleFaceRecognition } = useFaceRecognition(); // Custom hook

  // Load models on component mount
  useEffect(() => {
    const loadModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri(
          "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/"
        );
        await faceapi.nets.faceLandmark68Net.loadFromUri(
          "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/"
        );
        await faceapi.nets.faceRecognitionNet.loadFromUri(
          "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/"
        );
        console.log("Models successfully loaded");
        setModelsLoaded(true);
      } catch (error) {
        setAlertMessage("Error loading models");
        setAlertType("error");
        console.error("Error loading models:", error);
      }
    };
    loadModels();
  }, []);

  const handleTakePicture = async (isClockIn) => {
    if (webcamRef.current && modelsLoaded) {
      const screenshot = webcamRef.current.getScreenshot();
      if (screenshot) {
        try {
          if(isClockIn){
            const matchResult = await handleFaceRecognition(screenshot,true);
            if (matchResult) {
              setVisitorData(matchResult.visitor); // Process clock-in or clock-out
              setAlertMessage("Clock-in successful");
              setAlertType("success");
              onClockIn(matchResult.visitor);
            } else {
              setAlertMessage("Face not recognized");
              setAlertType("warning");
            }
          }else{
            const checkoutResult = await handleFaceRecognition(screenshot, false); // Pass true for clock-out
            if (checkoutResult) {
              setVisitorData(checkoutResult.visitor);
              setAlertMessage("Clock-out successful");
              setAlertType("success");
              onClockOut(checkoutResult.visitor);
            }else {
              setAlertMessage("Face not recognized");
              setAlertType("warning");
            }
          }
        } catch (error) {
          setAlertMessage("Error during face recognition: " + error.message);
          setAlertType("error");
        }
      } else {
        setAlertMessage("No face detected");
        setAlertType("warning");
      }
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        p: 3,
        bgcolor: "background.paper",
        borderRadius: 2,
        boxShadow: 3,
        maxWidth: 500,
        mx: "auto",
        mt: 4,
      }}
    >
      <Typography variant="h5" gutterBottom>
        Face Recognition
      </Typography>
      {alertMessage && (
        <Alert
          severity={alertType}
          onClose={() => setAlertMessage(null)}
          sx={{ mb: 2 }}
        >
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
          facingMode: "user",
        }}
        style={{ marginBottom: "16px", borderRadius: "8px" }}
      />
      <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleTakePicture(true)}
        >
          Check-in
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => handleTakePicture(false)}
        >
          Check-out
        </Button>
      </Box>
      {loading && <CircularProgress size={24} sx={{ mt: 2 }} />}
      {visitorData && (
        <Box sx={{ mt: 2, textAlign: "center" }}>
          <Typography variant="h5">
            {visitorData.fullName}
          </Typography>
          <Typography variant="body1">NIK: {visitorData.nik}</Typography>
          <Typography variant="body1">
            Company: {visitorData.companyName}
          </Typography>
          <Typography variant="body1">
            Address: {visitorData.address}
          </Typography>
          <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
            {visitorData.message}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default FaceRecognition;