import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './LoginPage';
import SignupPage from './SignupPage';
import PatientDashboard from './PatientDashboard';
import DoctorDashboard from './DoctorDashboard';
import MyRoutine from './MyRoutine';

function App() {
  return (
    <Router>
      <Routes>
        {/* Login */}
        <Route path="/" element={<LoginPage />} />

        {/* Signup */}
        <Route path="/signup" element={<SignupPage />} />

        {/* Dashboards */}
        <Route path="/patient-dashboard" element={<PatientDashboard />} />
        <Route path="/doctor-dashboard" element={<DoctorDashboard />} />

        {/* Other features */}
        <Route path="/my-routine" element={<MyRoutine />} />
      </Routes>
    </Router>
  );
}

export default App;
