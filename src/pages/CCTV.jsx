"use client";

import { useState, useEffect, useRef } from "react";
import { Box, Typography, Grid, Paper } from "@mui/material";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";

const CCTV = () => {
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [faceSnapshots, setFaceSnapshots] = useState([]);
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const lastDescriptors = useRef([]); // Store previous descriptors for duplicate detection

  // Load face-api.js models
  useEffect(() => {
    const loadModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri("https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/");
        await faceapi.nets.faceLandmark68Net.loadFromUri("https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/");
        await faceapi.nets.faceRecognitionNet.loadFromUri("https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/");
        setModelsLoaded(true);
      } catch (error) {
        console.error("Error loading models:", error);
      }
    };
    loadModels();
  }, []);

  // Detect faces with smooth bounding box and duplicate check
  const detectFaces = async () => {
    if (webcamRef.current && modelsLoaded) {
      const video = webcamRef.current.video;
      const canvas = canvasRef.current;

      if (video.videoWidth === 0 || video.videoHeight === 0) {
        return; // Skip detection if dimensions are invalid
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptors();

      const dims = faceapi.matchDimensions(canvas, video, true);
      const resizedDetections = faceapi.resizeResults(detections, dims);
      const context = canvas.getContext("2d");
      context.clearRect(0, 0, canvas.width, canvas.height);

      resizedDetections.forEach((detection) => {
        const { x, y, width, height } = detection.detection.box;
        const mirroredX = dims.width - (x + width); // Adjust for mirror effect

        // Draw bounding box around face
        context.strokeStyle = "rgba(0, 255, 0, 0.6)";
        context.lineWidth = 2;
        context.strokeRect(mirroredX, y, width, height);

        // Check if the face is a duplicate by comparing descriptors
        const descriptor = detection.descriptor;
        const isDuplicate = lastDescriptors.current.some((lastDesc) => faceapi.euclideanDistance(descriptor, lastDesc) < 0.6);

        if (!isDuplicate) {
          captureFaceSnapshot(x, y, width, height);
          lastDescriptors.current.push(descriptor); // Save the new descriptor
          if (lastDescriptors.current.length > 20) lastDescriptors.current.shift(); // Limit the size to avoid overflow
        }
      });
    }
  };

  // Capture face snapshot (cropped to only the face area)
  const captureFaceSnapshot = (x, y, width, height) => {
    if (webcamRef.current) {
      const video = webcamRef.current.video;
      const faceCanvas = document.createElement("canvas");
      faceCanvas.width = width;
      faceCanvas.height = height;
      const faceContext = faceCanvas.getContext("2d");

      // Draw only the face area on the temporary canvas
      faceContext.drawImage(video, x, y, width, height, 0, 0, width, height);

      // Get the cropped face snapshot as data URL and timestamp
      const faceSnapshot = faceCanvas.toDataURL("image/jpeg");
      const timestamp = new Date().toLocaleTimeString();
      setFaceSnapshots((prev) => [...prev, { src: faceSnapshot, timestamp }]);
    }
  };

  // Start periodic face detection only after video is ready
  useEffect(() => {
    const interval = setInterval(() => {
      detectFaces();
    }, 1000);
    return () => clearInterval(interval);
  }, [modelsLoaded]);

  return (
    <Box p={4} display="flex" flexDirection="row" alignItems="flex-start" gap={4} sx={{ bgcolor: "#f4f6f8", minHeight: "100vh" }}>
      {/* Webcam and detections */}
      <Paper elevation={3} sx={{ position: "relative", width: "640px", height: "480px", borderRadius: "12px", overflow: "hidden", flexShrink: 0 }}>
        <Typography variant="h5" color="primary" textAlign="center" sx={{ p: 2, bgcolor: "#1976d2", color: "white" }}>
          CCTV Monitoring
        </Typography>
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          videoConstraints={{
            width: 640,
            height: 480,
            facingMode: "user",
          }}
          onLoadedData={() => detectFaces()} // Run detection when video is ready
          style={{
            transform: "scaleX(-1)", // Mirror the camera horizontally
            width: "100%",
            height: "100%",
          }}
        />
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 9,
          }}
        />
      </Paper>

      {/* Captured face snapshots */}
      <Box flex={1} p={2} sx={{ overflowY: "auto", maxHeight: "480px" }}>
        <Typography variant="h6" color="primary" gutterBottom textAlign="center">
          Captured Faces
        </Typography>
        <Grid container spacing={1}>
          {faceSnapshots.length > 0 ? (
            faceSnapshots.slice(-20).map((snapshot, index) => ( // Show only the latest 20 snapshots
              <Grid item xs={4} sm={3} md={2} key={index}>
                <Box
                  sx={{
                    borderRadius: "8px",
                    overflow: "hidden",
                    boxShadow: 2,
                    width: "100%",
                    bgcolor: "grey.200",
                  }}
                >
                  <Box sx={{ transform: "scaleX(-1)" }}>
                    <img
                      src={snapshot.src}
                      alt={`Face ${index + 1}`}
                      style={{ width: "100%", height: "auto", objectFit: "cover" }}
                    />
                  </Box>
                  <Box p={0.5} textAlign="center" sx={{ transform: "scaleX(1)" }}>
                    <Typography variant="caption" color="textSecondary" display="block">
                      {snapshot.timestamp}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))
          ) : (
            <Typography variant="body2" color="textSecondary" textAlign="center" sx={{ width: "100%", mt: 2 }}>
              No faces captured yet.
            </Typography>
          )}
        </Grid>
      </Box>
    </Box>
  );
};

export default CCTV;
