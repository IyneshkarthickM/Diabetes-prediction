import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

export default function MyRoutine() {
  const navigate = useNavigate();

  return (
    <div className="dashboard">
      <header className="navbar">
        <div className="logo">💙 DiabetesCheck</div>
        <div className="nav-right">
          <span className="user-info">👤 John Doe</span>
          <span className="role-badge">Patient</span>
          <button className="logout-btn" onClick={() => navigate('/')}>Logout</button>
        </div>
      </header>

      <main className="main-content">
        <h2>My Daily Routine</h2>
        <ul className="routine-list">
          <li>🕘 9:00 AM - Morning Walk (30 mins)</li>
          <li>🥗 9:45 AM - Healthy Breakfast</li>
          <li>💊 10:30 AM - Take medication</li>
          <li>🍛 1:00 PM - Balanced Lunch</li>
          <li>🩺 3:00 PM - Check Blood Glucose</li>
          <li>🚶‍♂️ 5:30 PM - Light Evening Exercise</li>
          <li>🥣 7:00 PM - Dinner</li>
          <li>💊 9:00 PM - Night Medication</li>
        </ul>
        <button className="logout-btn" onClick={() => navigate('/patient-dashboard')}>← Back to Dashboard</button>
      </main>
    </div>
  );
}
