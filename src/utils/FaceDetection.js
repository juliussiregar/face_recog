"use client";

import * as faceapi from '@vladmandic/face-api';

const minScore = 0.3;
const maxResults = 5;
let optionsSSDMobileNet;
let labeledFaceDescriptors = new Map(); // Store persistent face descriptors with labels

export const loadFaceDetectionModels = async () => {
    try {
        const modelPath = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/";

        await Promise.all([
            faceapi.nets.ssdMobilenetv1.load(modelPath),
            faceapi.nets.faceLandmark68Net.load(modelPath),
            faceapi.nets.faceRecognitionNet.load(modelPath)
        ]);

        optionsSSDMobileNet = new faceapi.SsdMobilenetv1Options({
            minConfidence: minScore,
            maxResults
        });

        await faceapi.tf.setBackend('webgl');
        await faceapi.tf.ready();

        if (faceapi.tf?.env().flagRegistry.CANVAS2D_WILL_READ_FREQUENTLY) {
            faceapi.tf.env().set('CANVAS2D_WILL_READ_FREQUENTLY', true);
        }
        if (faceapi.tf?.env().flagRegistry.WEBGL_EXP_CONV) {
            faceapi.tf.env().set('WEBGL_EXP_CONV', true);
        }
        if (faceapi.tf?.env().flagRegistry.WEBGL_PACK) {
            faceapi.tf.env().set('WEBGL_PACK', true);
        }

        return true;
    } catch (error) {
        console.error("Error loading models:", error);
        return false;
    }
};

const findBestMatch = (descriptor, faceNameMap) => {
    let bestMatch = { label: "Detecting...", distance: 1.0 };

    // First check the persistent labeledFaceDescriptors
    for (const [desc, label] of labeledFaceDescriptors.entries()) {
        const distance = faceapi.euclideanDistance(descriptor, new Float32Array(desc.split(',').map(Number)));
        if (distance < 0.6 && distance < bestMatch.distance) {
            bestMatch = { label, distance };
        }
    }

    // Then check the current session's faceNameMap
    if (faceNameMap.current) {
        for (const [storedDesc, name] of faceNameMap.current.entries()) {
            const distance = faceapi.euclideanDistance(descriptor, new Float32Array(storedDesc.split(',').map(Number)));
            if (distance < 0.6 && distance < bestMatch.distance) {
                bestMatch = { label: name, distance };
                // Add to persistent storage if not already there
                if (!labeledFaceDescriptors.has(storedDesc)) {
                    labeledFaceDescriptors.set(storedDesc, name);
                }
            }
        }
    }

    return bestMatch.label;
};

export const detectFacesInVideo = async (video, canvas, lastDescriptors, onFaceDetected, faceNameMap) => {
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
        return;
    }

    const displaySize = { width: video.videoWidth, height: video.videoHeight };
    if (canvas.width !== displaySize.width || canvas.height !== displaySize.height) {
        canvas.width = displaySize.width;
        canvas.height = displaySize.height;
    }

    const t0 = performance.now();

    try {
        const detections = await faceapi
            .detectAllFaces(video, optionsSSDMobileNet)
            .withFaceLandmarks()
            .withFaceDescriptors();

        const dims = faceapi.matchDimensions(canvas, video, true);
        const resizedResults = faceapi.resizeResults(detections, dims);

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const fps = 1000 / (performance.now() - t0);
        ctx.font = 'small-caps 20px "Segoe UI"';
        ctx.fillStyle = 'white';
        ctx.fillText(`FPS: ${fps.toLocaleString()}`, 10, 25);

        for (const detection of resizedResults) {
            const { x, y, width, height } = detection.detection.box;
            const mirroredX = dims.width - (x + width);
            const descriptor = detection.descriptor;

            // Get visitor name using improved matching
            const visitorName = findBestMatch(descriptor, faceNameMap);

            // Draw face box
            ctx.lineWidth = 3;
            ctx.strokeStyle = 'deepskyblue';
            ctx.fillStyle = 'deepskyblue';

            ctx.globalAlpha = 0.6;
            ctx.beginPath();
            ctx.rect(mirroredX, y, width, height);
            ctx.stroke();
            ctx.globalAlpha = 1;

            // Draw name with shadow
            ctx.shadowColor = 'black';
            ctx.shadowBlur = 4;
            ctx.fillStyle = 'white';
            ctx.font = 'small-caps bold 20px "Segoe UI"';
            ctx.fillText(visitorName, mirroredX, y - 10);
            ctx.shadowBlur = 0;

            // Draw landmarks
            ctx.globalAlpha = 0.8;
            ctx.fillStyle = 'lightblue';
            const pointSize = 2;
            for (const point of detection.landmarks.positions) {
                ctx.beginPath();
                ctx.arc(dims.width - point.x, point.y, pointSize, 0, 2 * Math.PI);
                ctx.fill();
            }

            // Check for new faces with improved matching
            const isDuplicate = lastDescriptors.current.some(lastDesc =>
                faceapi.euclideanDistance(descriptor, lastDesc) < 0.5
            );

            if (!isDuplicate && visitorName === "Detecting...") {
                onFaceDetected(x, y, width, height, descriptor);
                lastDescriptors.current.push(descriptor);
                if (lastDescriptors.current.length > 10) {
                    lastDescriptors.current.shift();
                }
            }
        }
    } catch (error) {
        console.error("Detection error:", error);
    }
};

export const captureFaceSnapshot = (video, x, y, width, height) => {
    const faceCanvas = document.createElement("canvas");
    const padding = Math.min(width, height) * 0.2;

    const paddedWidth = width + (padding * 2);
    const paddedHeight = height + (padding * 2);
    const paddedX = Math.max(0, x - padding);
    const paddedY = Math.max(0, y - padding);

    faceCanvas.width = paddedWidth;
    faceCanvas.height = paddedHeight;
    const faceContext = faceCanvas.getContext("2d", { willReadFrequently: true });

    faceContext.imageSmoothingEnabled = true;
    faceContext.imageSmoothingQuality = 'high';

    try {
        faceContext.drawImage(
            video,
            paddedX, paddedY, paddedWidth, paddedHeight,
            0, 0, paddedWidth, paddedHeight
        );
    } catch (error) {
        console.error("Error capturing face snapshot:", error);
    }

    const faceSnapshot = faceCanvas.toDataURL("image/jpeg", 0.92);
    const timestamp = new Date().toLocaleTimeString();

    return {
        src: faceSnapshot,
        timestamp,
        id: Date.now(),
        coordinates: {
            x: paddedX,
            y: paddedY,
            width: paddedWidth,
            height: paddedHeight
        }
    };
};

export const processSnapshotData = (snapshot) => {
    if (!snapshot || !snapshot.src) {
        console.error("Invalid snapshot data");
        return null;
    }

    try {
        const formatBase64 = snapshot.src;
        const cleanBase64 = formatBase64.replace(/^data:image\/jpeg;base64,/, '');

        return {
            base64: cleanBase64,
            timestamp: snapshot.timestamp,
            id: snapshot.id,
            coordinates: snapshot.coordinates
        };
    } catch (error) {
        console.error("Error processing snapshot data:", error);
        return null;
    }
};