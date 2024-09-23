import { useState } from 'react';
import faceRecognitionService from '../services/faceRecognitionService'; // Ensure faceRecognitionService is set up properly

const useFaceRecognition = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to send screenshot to API and get the face recognition result
  const handleFaceRecognition = async (screenshot) => {
    setLoading(true);
    setError(null);

    try {
      // Remove base64 prefix from the screenshot (e.g., data:image/png;base64,)
      const base64Image = screenshot.replace(/^data:image\/[a-z]+;base64,/, '');

      // Send cleaned base64 image to the face recognition API
      const response = await faceRecognitionService.recognize(base64Image);

      // Check if the response from the server contains valid face recognition result
      if (response && response.matched) {
        setResult(response); // Store the result in state
        return response; // Return the response to the calling component
      } else if (response && response.error) {
        // If there is an error message from the API, display it to the user
        throw new Error(response.error);
      } else {
        throw new Error('Face not recognized or invalid response');
      }
    } catch (error) {
      console.error('Error during face recognition:', error.message || error);

      // Set more detailed error messages based on different scenarios
      if (error.message.includes('Visitor not found')) {
        setError('Visitor not found in the system. Please register first.');
      } else if (error.message.includes('Face not recognized')) {
        setError('Face not recognized. Please try again or contact support.');
      } else {
        setError('Failed to recognize face. Please try again.');
      }

      throw error; // Rethrow the error for the calling component to handle
    } finally {
      setLoading(false);
    }
  };

  return {
    result,
    loading,
    error,
    handleFaceRecognition,
  };
};

export default useFaceRecognition;