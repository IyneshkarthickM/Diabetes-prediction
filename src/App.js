
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './LoginPage';
import SignupPage from './SignupPage';
import PatientDashboard from './PatientDashboard';
import DoctorDashboard from './DoctorDashboard';
import MyRoutine from './MyRoutine';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedSession = localStorage.getItem('session');
    if (savedSession) {
      setSession(JSON.parse(savedSession));
    }
    setLoading(false);
  }, []);

  const handleLogin = (sessionData) => {
    localStorage.setItem('session', JSON.stringify(sessionData));
    setSession(sessionData);
  };

  const handleLogout = () => {
    localStorage.removeItem('session');
    setSession(null);
  };

  const getHomeDashboard = () => {
    if (!session) return '/';
    return session.role === 'doctor' ? '/doctor-dashboard' : '/patient-dashboard';
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={!session ? <LoginPage onLogin={handleLogin} /> : <Navigate to={getHomeDashboard()} />} 
        />
        <Route 
          path="/signup" 
          element={!session ? <SignupPage /> : <Navigate to={getHomeDashboard()} />} 
        />

        {/* Protected routes */}
        <Route 
          path="/patient-dashboard" 
          element={session && session.role === 'patient' ? <PatientDashboard session={session} onLogout={handleLogout} /> : <Navigate to="/" />} 
        />
        <Route 
          path="/doctor-dashboard" 
          element={session && session.role === 'doctor' ? <DoctorDashboard session={session} onLogout={handleLogout} /> : <Navigate to="/" />} 
        />
        <Route 
          path="/my-routine" 
          element={session ? <MyRoutine /> : <Navigate to="/" />} 
        />
      </Routes>
    </Router>
  );
}

export default App;
