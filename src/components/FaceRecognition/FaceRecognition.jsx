"use client";

import { useState, useEffect, useRef } from "react";
import { Box, CircularProgress, Typography, Alert, Button } from "@mui/material";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";
import useFaceRecognition from "../../hooks/useFaceRecognition"; // Custom hook
import debounce from "lodash.debounce"; // Debouncing function
import DisplayMessage from "./DisplayMessage"; // Import the DisplayMessage component

const FaceRecognition = ({ onClockIn = () => {}, onClockOut = () => {} }) => {
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState("");
  const [isFaceDetected, setIsFaceDetected] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [visitorData, setVisitorData] = useState(null);
  const [displayName, setDisplayName] = useState("loading...");
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const lastDetectedTime = useRef(Date.now());

  const [isClockIn, setIsClockIn] = useState(false);

  const { handleFaceRecognition, handleIdentifyFace } = useFaceRecognition(); // Custom hook

  const previousFaceDescriptor = useRef(null); // To store the last face descriptor

  // Load face-api.js models
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

  // Debounced face identification API call
  const debouncedIdentifyFace = useRef(
    debounce(async (base64Image) => {
      setLoading(true);
      const response = await handleIdentifyFace(base64Image);
      if (response && response.visitor) {
        setDisplayName(response.visitor.fullName);
        setVisitorData(response.visitor);
        setAlertMessage(null);
      } else {
        setAlertMessage("Face not recognized");
        setAlertType("warning");
        setDisplayName("Face not recognized"); // Update message when face is not recognized
      }
      setLoading(false);
    }, 1000) // Debounce for 1 second to avoid too frequent API calls
  ).current;

  // Detect and recognize face
  const detectFace = async () => {
    if (webcamRef.current && modelsLoaded) {
      const video = webcamRef.current.video;
      const canvas = canvasRef.current;

      // Ensure the canvas dimensions match the video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();

      if (detection) {
        const dims = faceapi.matchDimensions(canvas, video, true);
        const resizedDetections = faceapi.resizeResults(detection, dims);
        const context = canvas.getContext("2d");

        // Clear previous drawings on canvas
        context.clearRect(0, 0, canvas.width, canvas.height);

        const box = resizedDetections.detection.box;

        // Adjust the bounding box to include more of the top part of the head (for hair)
        const adjustedBox = {
          x: dims.width - (box.x + box.width), // Adjust for mirrored view
          y: box.y - box.height * 0.4, // Move the box up to include more hair
          width: box.width,
          height: box.height * 1.4, // Increase the height by 40%
        };

        // Draw bounding box
        context.strokeStyle = "green";
        context.lineWidth = 4;
        context.strokeRect(adjustedBox.x, adjustedBox.y, adjustedBox.width, adjustedBox.height);

        setIsFaceDetected(true);

        const currentFaceDescriptor = detection.descriptor;
        const now = Date.now();

        if (
          !previousFaceDescriptor.current ||
          faceapi.euclideanDistance(currentFaceDescriptor, previousFaceDescriptor.current) >= 0.6 ||
          displayName === "loading..." || displayName === "Face not recognized"
        ) {
          if (now - lastDetectedTime.current > 1500) { // Adjusting debounce interval to 1.5 seconds
            lastDetectedTime.current = now;

            // Capture new image and run face identification
            const screenshot = webcamRef.current.getScreenshot();
            if (screenshot) {
              const base64Image = screenshot.replace(/^data:image\/[a-z]+;base64,/, "");
              debouncedIdentifyFace(base64Image);
            }
          }
        }

        // Dynamically render the name under the bounding box with color
        if (displayName) {
          context.fillStyle = displayName === "Face not recognized" ? "red" : "white"; // Change color if face not recognized
          context.font = `${Math.max(adjustedBox.width * 0.15, 16)}px Arial`; // Dynamically adjust font size
          context.fillText(displayName, adjustedBox.x, adjustedBox.y + adjustedBox.height + 30);
        }

        previousFaceDescriptor.current = currentFaceDescriptor;
      } else {
        const context = canvas.getContext("2d");
        context.clearRect(0, 0, canvas.width, canvas.height);
        setIsFaceDetected(false);
        if (displayName !== "loading...") {
          setDisplayName("loading...");
        }
      }
    }
  };

  // Periodically detect face
  useEffect(() => {
    const interval = setInterval(() => {
      detectFace();
    }, 1000); // Detect face every 1 second to increase responsiveness
    return () => clearInterval(interval);
  }, [modelsLoaded, displayName]);

  // Clock-in and clock-out logic
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
          setAlertMessage(`Error during face recognition: ${error.message}`);
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
      {/* Display message based on check-in or check-out */}
      <DisplayMessage visitorData={visitorData} isClockIn={isClockIn} />
    </Box>
  );
};

export default FaceRecognition;
