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
import debounce from "lodash.debounce";
import useFaceRecognition from "../hooks/useFaceRecognition";

const CCTV = () => {
    const [loading, setLoading] = useState(false);
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [faceSnapshots, setFaceSnapshots] = useState([]);
    const [visitorNames, setVisitorNames] = useState({});
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    const lastDescriptors = useRef([]);
    const faceNameMapRef = useRef(new Map());
    const animationFrameRef = useRef(null);
    const processingRef = useRef(false);

    const { handleIdentifyFace } = useFaceRecognition();

    useEffect(() => {
        const initializeModels = async () => {
            const loaded = await loadFaceDetectionModels();
            setModelsLoaded(loaded);
        };
        initializeModels();

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, []);

    const isFaceClearAndLargeEnough = (width, height) => {
        const minFaceSize = 100;
        return width >= minFaceSize && height >= minFaceSize;
    };

    // Function to check and store visitor names in local storage
    const checkLocalStorageForVisitor = (descriptorKey) => {
        const storedVisitors = JSON.parse(localStorage.getItem("visitorNames")) || {};
        return storedVisitors[descriptorKey] || null;
    };

    const storeVisitorInLocalStorage = (descriptorKey, visitorName) => {
        const storedVisitors = JSON.parse(localStorage.getItem("visitorNames")) || {};
        storedVisitors[descriptorKey] = visitorName;
        localStorage.setItem("visitorNames", JSON.stringify(storedVisitors));
    };

    const debouncedIdentifyFace = useRef(
        debounce(async (base64Image, snapshotId, descriptor) => {
            if (processingRef.current) return;
            processingRef.current = true;
            setLoading(true);

            const descriptorKey = descriptor.toString();
            let visitorName = checkLocalStorageForVisitor(descriptorKey);

            if (visitorName) {
                // If visitor is found in local storage, update the state and map
                faceNameMapRef.current.set(descriptorKey, visitorName);
                setVisitorNames(prevNames => ({
                    ...prevNames,
                    [snapshotId]: visitorName
                }));
            } else {
                // If not in local storage, call API
                try {
                    const response = await handleIdentifyFace(base64Image);
                    visitorName = response && response.visitor ? response.visitor.fullName : "Unrecognized";
                    
                    // Update both local storage and in-memory map
                    storeVisitorInLocalStorage(descriptorKey, visitorName);
                    faceNameMapRef.current.set(descriptorKey, visitorName);

                    setVisitorNames(prevNames => ({
                        ...prevNames,
                        [snapshotId]: visitorName
                    }));

                    setFaceSnapshots(prevSnapshots =>
                        prevSnapshots.map(snapshot =>
                            snapshot.id === snapshotId
                                ? { ...snapshot, visitorName }
                                : snapshot
                        )
                    );
                } catch (error) {
                    console.error("Face identification error:", error);
                } finally {
                    setLoading(false);
                    processingRef.current = false;
                }
            }
        }, 100)
    ).current;

    const handleFaceDetection = async () => {
        if (
            webcamRef.current?.video &&
            modelsLoaded &&
            webcamRef.current.video.readyState === 4 &&
            !processingRef.current
        ) {
            try {
                await detectFacesInVideo(
                    webcamRef.current.video,
                    canvasRef.current,
                    lastDescriptors,
                    handleFaceDetected,
                    faceNameMapRef
                );
            } catch (error) {
                console.error("Face detection error:", error);
            }
        }
        animationFrameRef.current = requestAnimationFrame(() => {
            setTimeout(() => handleFaceDetection(), 100);
        });
    };

    const handleFaceDetected = (x, y, width, height, descriptor) => {
        if (!isFaceClearAndLargeEnough(width, height)) {
            console.log("Face is too small or unclear, skipping screenshot.");
            return;
        }

        const snapshotData = {
            ...captureFaceSnapshot(webcamRef.current.video, x, y, width, height),
            id: Date.now(),
            visitorName: "Processing..."
        };
        
        const cleanBase64 = processSnapshotData(snapshotData);
        debouncedIdentifyFace(cleanBase64.base64, snapshotData.id, descriptor);

        setFaceSnapshots(prev => {
            const newSnapshots = [...prev, snapshotData];
            return newSnapshots.slice(-20);
        });
    };

    useEffect(() => {
        if (!modelsLoaded) return;
        animationFrameRef.current = requestAnimationFrame(handleFaceDetection);
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [modelsLoaded]);

    return (
        <Box
            p={4}
            display="flex"
            flexDirection={{ xs: "column", md: "row" }}
            alignItems="flex-start"
            gap={4}
            sx={{ bgcolor: "#f4f6f8", minHeight: "100vh" }}
        >
            <Paper
                elevation={3}
                sx={{
                    position: "relative",
                    width: { xs: "100%", md: "640px" },
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
                    sx={{
                        p: 2,
                        bgcolor: "#1976d2",
                        color: "white",
                        height: "40px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}
                >
                    CCTV Monitoring {loading && "(Processing...)"}
                </Typography>
                <Box
                    sx={{
                        position: "relative",
                        width: "100%",
                        height: "calc(100% - 40px)",
                        overflow: "hidden"
                    }}
                >
                    <Webcam
                        ref={webcamRef}
                        audio={false}
                        screenshotFormat="image/jpeg"
                        videoConstraints={{
                            width: 640,
                            height: 440,
                            facingMode: "user",
                            frameRate: 30
                        }}
                        style={{
                            transform: "scaleX(-1)",
                            width: "100%",
                            height: "100%",
                            objectFit: "cover"
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
                </Box>
            </Paper>

            <Box flex={1} p={2} sx={{ overflowY: "auto", maxHeight: "480px" }}>
                <Typography variant="h6" color="primary" gutterBottom textAlign="center">
                    Captured Faces ({faceSnapshots.length})
                </Typography>
                <Grid container spacing={1}>
                    {faceSnapshots.length > 0 ? (
                        faceSnapshots.slice(-20).map((snapshot, index) => (
                            <Grid
                                item
                                xs={12} sm={6} md={4} lg={3}
                                key={snapshot.id || index}
                                sx={{
                                    display: "flex",
                                    justifyContent: "center",
                                }}
                            >
                                <Box
                                    sx={{
                                        borderRadius: "8px",
                                        overflow: "hidden",
                                        boxShadow: 2,
                                        width: "100%",
                                        maxWidth: { xs: "160px", sm: "140px", md: "120px" },
                                        bgcolor: "grey.200",
                                    }}
                                >
                                    <Box sx={{ transform: "scaleX(-1)" }}>
                                        <img
                                            src={snapshot.src}
                                            alt={`Face ${index + 1}`}
                                            style={{
                                                width: "100%",
                                                height: "150px",
                                                objectFit: "cover"
                                            }}
                                        />
                                    </Box>
                                    <Box p={0.5} textAlign="center" sx={{ transform: "scaleX(1)" }}>
                                        <Typography variant="caption" color="textSecondary" display="block">
                                            {snapshot.timestamp}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            color="primary"
                                            display="block"
                                            sx={{
                                                fontWeight: 'medium',
                                                mt: 0.5,
                                                color: snapshot.visitorName === "Unrecognized" ? "error.main" : "primary.main"
                                            }}
                                        >
                                            {visitorNames[snapshot.id] || snapshot.visitorName}
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
