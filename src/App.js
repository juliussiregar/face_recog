import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import CCTV from './pages/CCTV';

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const FaceRecognitionPage = lazy(() => import('./pages/FaceRecognitionPage'));
const VisitorMonitoringPage = lazy(() => import('./pages/VisitorMonitoringPage')); // New route

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/face-recognition" element={<FaceRecognitionPage />} />
              <Route path="/visitor-monitoring" element={<VisitorMonitoringPage />} />
              <Route path="/cctv" element={<CCTV />} /> 
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;