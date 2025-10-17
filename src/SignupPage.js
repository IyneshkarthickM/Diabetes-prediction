import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaIdBadge } from 'react-icons/fa';
import { supabase } from './supabaseClient'; // Import Supabase
import './SignupPage.css';

// --- Validation Functions ---

// Password: minimum 8 chars, must include at least one number
function isStrongPassword(password) {
  const strongRegex = /^(?=.*\d).{8,}$/;
  return strongRegex.test(password);
}

export default function SignupPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState('patient');
  const [formData, setFormData] = useState({
    id: '',
    fullName: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  // Check if a user with the given ID and role already exists in Supabase
  const checkUserExists = async (id, role) => {
    const { data, error } = await supabase
      .from('users')
      .select('role_specific_id')
      .eq('role_specific_id', id.trim())
      .eq('role', role);
      
    if (error) {
      console.error('Supabase query error:', error.message);
      return false; // Assume user doesn't exist if there's a query error
    }
    
    return data && data.length > 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const idField = role === 'patient' ? 'Patient ID' : 'Doctor ID';
    
    // --- Form Validation ---
    if (!formData.id || !formData.fullName || !formData.password) {
      setError('All fields are required.');
      setLoading(false);
      return;
    }
    if (!isStrongPassword(formData.password)) {
      setError("Password must be at least 8 characters and contain one number.");
      setLoading(false);
      return;
    }

    // --- Check if user already exists ---
    const exists = await checkUserExists(formData.id, role);
    if (exists) {
      setError(`User with this ${idField} already exists. Please log in.`);
      setLoading(false);
      return;
    }

    // --- Create New User in Supabase ---
    try {
      const { error: insertError } = await supabase.from('users').insert({
        role_specific_id: formData.id.trim(),
        full_name: formData.fullName.trim(),
        password: formData.password, // In a real app, this should be hashed before insertion.
        role: role,
      });

      if (insertError) throw insertError;

      alert("✅ Signup successful! You can now log in.");
      
      // On success, pre-fill the login form for the user
      navigate('/');

    } catch (dbError) {
      console.error("Error signing up:", dbError);
      setError(`Signup failed: ${dbError.message}`);
    }
    setLoading(false);
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <h2 className="title">Create Account</h2>
        <div className="role-toggle">
          <button
            className={role === 'patient' ? 'active' : ''}
            onClick={() => { setRole('patient'); setError(''); setFormData({ id: '', fullName: '', password: '' }); }}
          >
            👤 Patient
          </button>
          <button
            className={role === 'doctor' ? 'active' : ''}
            onClick={() => { setRole('doctor'); setError(''); setFormData({ id: '', fullName: '', password: '' }); }}
          >
            🩺 Doctor
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <label>
            {role === 'patient' ? 'Patient ID' : 'Doctor ID'}
            <div className="input-icon">
              <FaIdBadge className="icon" />
              <input
                type="text"
                name="id"
                placeholder={role === 'patient' ? "Create a Patient ID" : "Create a Doctor ID"}
                value={formData.id}
                onChange={handleInputChange}
                required
              />
            </div>
          </label>
          <label>
            Full Name
            <div className="input-icon">
              <FaUser className="icon" />
              <input
                type="text"
                name="fullName"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleInputChange}
                required
              />
            </div>
          </label>
          <label>
            Password
            <div className="input-icon">
              <FaLock className="icon" />
              <input
                type="password"
                name="password"
                placeholder="8+ characters, with a number"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>
          </label>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <span>Already have an account? </span>
            <button
                type="button"
                className="signup-link"
                onClick={() => navigate('/')}
              >
                Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
