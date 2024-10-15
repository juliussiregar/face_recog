"use client";

import { useState, useEffect, useRef } from "react";
import { Box, CircularProgress, Typography, Alert, Button, Paper } from "@mui/material";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";
import useFaceRecognition from "../../hooks/useFaceRecognition"; // Custom hook

const FaceRecognition = ({ onClockIn = () => {}, onClockOut = () => {} }) => {
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState("");
  const [isFaceDetected, setIsFaceDetected] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [visitorData, setVisitorData] = useState(null);
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [isClockIn, setIsClockIn] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const [faceIdentified,setIdentified] = useState(null);


  const meet_in = new Date(new Date().getTime() + 60 * 60 * 1000).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const meet_out = new Date(new Date().getTime() + 60 * 60 * 2500).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const time = `${meet_in} - ${meet_out}`;
  const { handleFaceRecognition ,handleIdentifyFace} = useFaceRecognition(); // Custom hook
  const previousFaceDescriptor = useRef(null);


  // Load models on component mount
  useEffect(() => {
    const loadModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri("https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/");
        await faceapi.nets.faceLandmark68Net.loadFromUri("https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/");
        await faceapi.nets.faceRecognitionNet.loadFromUri("https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/");
        setModelsLoaded(true);
      } catch (error) {
        setAlertMessage("Error loading models");
        setAlertType("error");
      }
    };
    loadModels();
  }, []);

  // Function to detect face and draw a green box around it
  const detectFace = async () => {
    if (webcamRef.current && modelsLoaded) {
      const video = webcamRef.current.video;
      const canvas = canvasRef.current;
      
      // Ensure the canvas dimensions match the video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight
      const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions());

      if (detection) {
        const dims = faceapi.matchDimensions(canvas, video, true);
        const resizedDetections = faceapi.resizeResults(detection, dims);
        const context = canvasRef.current.getContext("2d");

        // Clear the previous drawings on canvas
        context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        // Adjust the bounding box to include more of the top (for hair) and shift it slightly to match the mirrored view
        const box = resizedDetections.box;
        const adjustedBox = {
          x: dims.width - (box.x + box.width * 1.05), // Adjust for mirrored view
          y: box.y - box.height * 0.3, // Move the box up by 30% of its height to include more hair
          width: box.width,
          height: box.height * 1.3, // Increase the height by 30%
        };

        // Draw bounding box with green color
        context.strokeStyle = "green";
        context.lineWidth = 4;
        context.strokeRect(adjustedBox.x, adjustedBox.y, adjustedBox.width, adjustedBox.height);

        

        setIsFaceDetected(true);
        const currentFaceDescriptor = detection.descriptor;


        
        if (!previousFaceDescriptor.current || faceapi.euclideanDistance(currentFaceDescriptor, previousFaceDescriptor.current) >= 0.6) {
          // If the face is new or changed significantly
          if (!imageSrc) {
            setFaceDetected(false); // Reset detection flag
            setImageSrc(null); // Clear the old image
            setIdentified(null); // Clear the old visitor identification
            
            // Capture a new image and identify the face
            const screenshot = webcamRef.current.getScreenshot();
            if (screenshot) {
              const imageBase64 = screenshot.replace(/^data:image\/[a-z]+;base64,/, "");
              setImageSrc(imageBase64); // Set the new captured image
              setFaceDetected(true); // Mark face as detected
        
              // Identify the face using your custom function
              const response = await handleIdentifyFace(imageBase64);
              if (response && response.visitor) {
                setIdentified(response.visitor.fullName); // Store the identified visitor
              }
              
              // Update previous face descriptor with the current one
              previousFaceDescriptor.current = currentFaceDescriptor;
            }
          }
        }

      } else {
        const context = canvasRef.current.getContext("2d");
        context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        setIsFaceDetected(false);
      }
    }
  };

  // Periodically detect face
  useEffect(() => {
    const interval = setInterval(() => {
      detectFace();
    }, 500); // Detect face every 500ms for quick responsiveness
    return () => clearInterval(interval);
  }, [modelsLoaded, faceDetected]);

  const handleTakePicture = async (isClockIn) => {
    if (webcamRef.current && modelsLoaded) {
      const screenshot = webcamRef.current.getScreenshot();
      if (screenshot) {
        try {
          if (isClockIn) {
            const matchResult = await handleFaceRecognition(screenshot, true);
            if (matchResult) {
              setVisitorData(matchResult.visitor); // Process clock-in or clock-out
              setAlertMessage("Clock-in successful");
              setAlertType("success");
              onClockIn(matchResult.visitor);
            } else {
              setAlertMessage("Face not recognized");
              setAlertType("warning");
            }
          } else {
            const checkoutResult = await handleFaceRecognition(screenshot, false);
            if (checkoutResult) {
              setVisitorData(checkoutResult.visitor);
              setAlertMessage("Clock-out successful");
              setAlertType("success");
              onClockOut(checkoutResult.visitor);
            } else {
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
        maxWidth: 600,
        mx: "auto",
        mt: 6,
      }}
    >
      <Typography variant="h5" gutterBottom sx={{ color: "primary.main", mb: 3 }}>
        Facial Recognition Attendance
      </Typography>
      {alertMessage && (
        <Alert severity={alertType} onClose={() => setAlertMessage(null)} sx={{ mb: 2, width: "100%" }}>
          {alertMessage}
        </Alert>
      )}
      <Box position="relative" sx={{ borderRadius: "12px", overflow: "hidden", boxShadow: 3 }}>
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
          style={{
            borderRadius: "12px",
            transform: "scaleX(-1)", // Mirror the camera horizontally
          }}
        />
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 9,
            width: "100%",
            height: "100%",
          }}
        />
      </Box>
      <Box sx={{ display: "flex", gap: 2, mt: 4 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            setIsClockIn(true);
            handleTakePicture(true);
          }}
          sx={{ px: 4 }}
        >
          Check-in
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => {
            setIsClockIn(false);
            handleTakePicture(false);
          }}
          sx={{ px: 4 }}
        >
          Check-out
        </Button>
      </Box>
      {loading && <CircularProgress size={24} sx={{ mt: 2 }} />}
      {visitorData && (
        <Paper
          sx={{
            mt: 4,
            p: 2,
            width: "100%",
            textAlign: "center",
            borderRadius: "12px",
            boxShadow: 3,
            bgcolor: "background.default",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            {visitorData.fullName}
          </Typography>
          <Typography variant="body2">NIK: {visitorData.nik}</Typography>
          <Typography variant="body2">Company: {visitorData.companyName}</Typography>
          <Typography variant="body2">Address: {visitorData.address}</Typography>
          {isClockIn && (
            <>
              <Typography variant="body2">Meeting Room: {"Room A"}</Typography>
              <Typography variant="body2">Meeting Time: {time ?? ""}</Typography>
            </>
          )}
          <Typography variant="body1" sx={{ color: "primary.main", mt: 2 }}>
            {visitorData.message}
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default FaceRecognition;