import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';  // Import global CSS
import App from './App';  // Import main App component
import reportWebVitals from './reportWebVitals';  // Import performance measurement tool (optional)

// Check if the app is running in a production environment
const isProduction = process.env.NODE_ENV === 'production';

// Create the root element for React
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  isProduction ? (
    <App />
  ) : (
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
);

// Optionally report web vitals for performance measurement
if (isProduction) {
  reportWebVitals(console.log);  // Log performance in production
} else {
  reportWebVitals();  // Default behavior
}