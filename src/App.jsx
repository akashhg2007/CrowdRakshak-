import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import OperatorDashboard from './pages/OperatorDashboard';
import Login from './pages/Login';
import TrafficMap from './pages/TrafficMap';

const PrivateRoute = ({ children, requiredRole }) => {
  const token = localStorage.getItem('crowdmind_token');
  const role = localStorage.getItem('crowdmind_role');
  
  if (!token) return <Navigate to="/login" />;
  if (requiredRole && role !== requiredRole) return <Navigate to="/login" />;
  
  return children;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-black text-white selection:bg-signal-blue selection:text-white flex flex-col">
        <Navbar />
        <main className="flex-grow flex flex-col">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/traffic" element={<TrafficMap />} />
            
            {/* Admin Route - Temple Management Only */}
            <Route path="/admin" element={
              <PrivateRoute requiredRole="admin">
                <Dashboard />
              </PrivateRoute>
            } />

            {/* Operator Route - Massive Google-Level Command Center */}
            <Route path="/operator" element={<OperatorDashboard />} />
            
            {/* Fallback */}
            <Route path="/dashboard" element={<Navigate to="/login" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
