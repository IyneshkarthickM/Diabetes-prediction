import { useState } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import './LoginPage.css';

function LoginPage({ onLogin }) {
  const [role, setRole] = useState('patient');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const { data: user, error: queryError } = await supabase
        .from('users')
        .select('*')
        .eq('role_specific_id', userId)
        .eq('role', role)
        .single();

      if (queryError || !user || user.password !== password) {
        setError("Invalid user ID or password for the selected role.");
        return;
      }

      const sessionData = {
        id: user.id,
        name: user.full_name,
        role: user.role,
        role_specific_id: user.role_specific_id,
      };

      onLogin(sessionData);

      if (user.role === 'doctor') {
        navigate('/doctor-dashboard');
      } else {
        navigate('/patient-dashboard');
      }
    } catch (catchError) {
      console.error("Caught exception:", catchError);
      setError(`An unexpected error occurred: ${catchError.message}`);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">Welcome Back!</h2>
        <p className="login-subtitle">Please log in to access your dashboard.</p>
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="role">Role</label>
            <select id="role" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
            </select>
          </div>
          <div className="input-group">
            <label htmlFor="user_id">User ID</label>
            <input
              type="text"
              id="user_id"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-button">Log In</button>
          {error && <p className="error-message">{error}</p>}
        </form>
        <p className="signup-link">
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
