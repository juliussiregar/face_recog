// CCTV.js
"use client";

import { useState, useEffect, useRef } from "react";
import { Box, Typography, Grid, Paper } from "@mui/material";
import Webcam from "react-webcam";
import {
  loadFaceDetectionModels,
  detectFacesInVideo,
  captureFaceSnapshot,
  processSnapshotData
} from "../utils/FaceDetection";

const CCTV = () => {
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [faceSnapshots, setFaceSnapshots] = useState([]);
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const lastDescriptors = useRef([]);
  const snapshotDataArrayRef = useRef([]);

  // Load face detection models
  useEffect(() => {
    const initializeModels = async () => {
      const loaded = await loadFaceDetectionModels();
      setModelsLoaded(loaded);
    };
    initializeModels();
  }, []);

  // Handle face detection
  const handleFaceDetection = () => {
    if (webcamRef.current && modelsLoaded) {
      detectFacesInVideo(
          webcamRef.current.video,
          canvasRef.current,
          lastDescriptors,
          handleFaceDetected
      );
    }
  };

  // Handle detected face
  const handleFaceDetected = (x, y, width, height) => {
    if (webcamRef.current) {
      const snapshotData = captureFaceSnapshot(webcamRef.current.video, x, y, width, height);

      // Add to snapshot array ref
      snapshotDataArrayRef.current.push(snapshotData);

      // Limit array size
      if (snapshotDataArrayRef.current.length > 100) {
        snapshotDataArrayRef.current.shift();
      }

      // Process snapshot data
      if (Array.isArray(snapshotDataArrayRef.current)) {
        const cleanBase64Array = snapshotDataArrayRef.current.map(processSnapshotData);
        console.log("Cleaned Base64 Array with Timestamps:", cleanBase64Array);
      } else {
        console.error("snapshotDataArrayRef.current is not an array or is undefined");
      }

      // Update state
      setFaceSnapshots((prev) => [...prev, snapshotData]);
    }
  };

  // Start periodic face detection
  useEffect(() => {
    const interval = setInterval(handleFaceDetection, 1000);
    return () => clearInterval(interval);
  }, [modelsLoaded]);

  // Utility functions
  const getAllSnapshots = () => snapshotDataArrayRef.current;

  const clearSnapshots = () => {
    snapshotDataArrayRef.current = [];
    setFaceSnapshots([]);
  };

  return (
      <Box
          p={4}
          display="flex"
          flexDirection="row"
          alignItems="flex-start"
          gap={4}
          sx={{ bgcolor: "#f4f6f8", minHeight: "100vh" }}
      >
        {/* Webcam and detections */}
        <Paper
            elevation={3}
            sx={{
              position: "relative",
              width: "640px",
              height: "480px",
              borderRadius: "12px",
              overflow: "hidden",
              flexShrink: 0
            }}
        >
          <Typography
              variant="h5"
              color="primary"
              textAlign="center"
              sx={{ p: 2, bgcolor: "#1976d2", color: "white" }}
          >
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
              onLoadedData={handleFaceDetection}
              style={{
                transform: "scaleX(-1)",
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
            Captured Faces ({snapshotDataArrayRef.current.length})
          </Typography>
          <Grid container spacing={1}>
            {faceSnapshots.length > 0 ? (
                faceSnapshots.slice(-20).map((snapshot, index) => (
                    <Grid item xs={4} sm={3} md={2} key={snapshot.id || index}>
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
                              style={{ width: "auto", height: "150px", objectFit: "cover" }}
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
                <Typography
                    variant="body2"
                    color="textSecondary"
                    textAlign="center"
                    sx={{ width: "100%", mt: 2 }}
                >
                  No faces captured yet.
                </Typography>
            )}
          </Grid>
        </Box>
      </Box>
  );
};

export default CCTV;