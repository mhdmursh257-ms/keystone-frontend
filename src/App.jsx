import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/Navbar';
import Login from './components/Login'; 
import WorkOrderList from './components/WorkOrderList';
import CreateWorkOrder from './components/CreateWorkOrder';
import TrackOrder from './components/TrackOrder';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  const handleLoginSuccess = () => {
    setToken(localStorage.getItem('token'));
  };

  const handleLogout = () => {
    setToken(null);
  };

  return (
    <Router>
      <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300">
        <Navbar onLogout={handleLogout} />
        <div className="p-5">
          <Routes>
            {/* Public Routes */}
            <Route 
              path="/login" 
              element={
                token ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Login onLoginSuccess={handleLoginSuccess} />
                )
              } 
            />
            <Route path="/track" element={<TrackOrder />} />

            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <WorkOrderList />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/create-order" 
              element={
                <ProtectedRoute>
                  <CreateWorkOrder />
                </ProtectedRoute>
              } 
            />

            {/* Default Route */}
            <Route path="*" element={<Navigate to={token ? "/dashboard" : "/login"} replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;