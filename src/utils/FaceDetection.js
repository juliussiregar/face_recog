// faceDetectionUtils.js
"use client";

import * as faceapi from "face-api.js";

export const loadFaceDetectionModels = async () => {
    try {
        await faceapi.nets.tinyFaceDetector.loadFromUri("https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/");
        await faceapi.nets.faceLandmark68Net.loadFromUri("https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/");
        await faceapi.nets.faceRecognitionNet.loadFromUri("https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/");
        return true;
    } catch (error) {
        console.error("Error loading models:", error);
        return false;
    }
};

export const detectFacesInVideo = async (video, canvas, lastDescriptors, onFaceDetected) => {
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
        return;
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

        // Check if the face is a duplicate
        const descriptor = detection.descriptor;
        const isDuplicate = lastDescriptors.current.some(
            (lastDesc) => faceapi.euclideanDistance(descriptor, lastDesc) < 0.6
        );

        if (!isDuplicate) {
            onFaceDetected(x, y, width, height);
            lastDescriptors.current.push(descriptor);
            if (lastDescriptors.current.length > 20) lastDescriptors.current.shift();
        }
    });
};

export const captureFaceSnapshot = (video, x, y, width, height) => {
    const faceCanvas = document.createElement("canvas");
    faceCanvas.width = width;
    faceCanvas.height = height;
    const faceContext = faceCanvas.getContext("2d");

    // Draw only the face area on the temporary canvas
    faceContext.drawImage(video, x, y, width, height, 0, 0, width, height);

    // Get the cropped face snapshot as data URL and timestamp
    const faceSnapshot = faceCanvas.toDataURL("image/jpeg");
    const timestamp = new Date().toLocaleTimeString();

    return {
        src: faceSnapshot,
        timestamp,
        id: Date.now(),
        coordinates: { x, y, width, height }
    };
};

export const processSnapshotData = (snapshot) => {
    const formatBase64 = snapshot.src;
    const cleanBase64 = formatBase64 ? formatBase64.replace(/^data:image\/jpeg;base64,/, '') : null;

    return {
        base64: cleanBase64,
        timestamp: snapshot.timestamp,
        id: snapshot.id,
        coordinates: snapshot.coordinates
    };
};