// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { FaUser, FaLock, FaPhone } from 'react-icons/fa';
// import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
// import { db } from './Firebase';
// import './LoginPage.css';

// export default function LoginPage() {
//   const navigate = useNavigate();
//   const [role, setRole] = useState('patient');
//   const [isSignup, setIsSignup] = useState(false);
//   const [formData, setFormData] = useState({
//     fullName: '',
//     password: '',
//     phone: ''
//   });
//   const [loading, setLoading] = useState(false);

//   const handleInputChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   // Check if user exists
//   const checkUserExists = async (fullName, role) => {
//     const q = query(collection(db, "users"), where("fullName", "==", fullName.trim()), where("role", "==", role));
//     const querySnapshot = await getDocs(q);
//     return !querySnapshot.empty;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     if (!formData.fullName) {
//       alert('Full Name is required');
//       setLoading(false);
//       return;
//     }
//     if (!formData.password) {
//       alert('Password is required');
//       setLoading(false);
//       return;
//     }
//     if (role === 'patient') {
//       // If logging in, check if patient exists
//       if (!isSignup) {
//         const exists = await checkUserExists(formData.fullName, role);
//         if (exists) {
//           // Found: normal login
//           navigate('/patient-dashboard', {
//             state: { name: formData.fullName }
//           });
//         } else {
//           // Not found: show signup form for phone entry
//           setIsSignup(true);
//         }
//         setLoading(false);
//       } else {
//         // Signup logic
//         if (!formData.phone) {
//           alert('Phone number is required for new patient signup');
//           setLoading(false);
//           return;
//         }
//         try {
//           await addDoc(collection(db, "users"), {
//             fullName: formData.fullName.trim(),
//             password: formData.password,
//             phone: formData.phone,
//             role
//           });
//           alert('Signup successful!');
//           navigate('/patient-dashboard', {
//             state: { name: formData.fullName }
//           });
//         } catch (error) {
//           alert("Signup failed: " + error.message);
//         }
//         setLoading(false);
//       }
//     } else {
//       // For doctor: similar logic (without phone number)
//       if (!isSignup) {
//         const exists = await checkUserExists(formData.fullName, role);
//         if (exists) {
//           navigate('/doctor-dashboard', {
//             state: { name: formData.fullName }
//           });
//         } else {
//           setIsSignup(true);
//         }
//         setLoading(false);
//       } else {
//         try {
//           await addDoc(collection(db, "users"), {
//             fullName: formData.fullName.trim(),
//             password: formData.password,
//             role
//           });
//           alert('Signup successful!');
//           navigate('/doctor-dashboard', {
//             state: { name: formData.fullName }
//           });
//         } catch (error) {
//           alert("Signup failed: " + error.message);
//         }
//         setLoading(false);
//       }
//     }
//   };

//   return (
//     <div className="login-page">
//       <h1 className="title">DiabetesPredictor</h1>
//       <div className="login-container">
//         <div className="role-toggle">
//           <button className={role === 'patient' ? 'active' : ''} onClick={() => { setRole('patient'); setIsSignup(false); }}>
//             👤 Patient
//           </button>
//           <button className={role === 'doctor' ? 'active' : ''} onClick={() => { setRole('doctor'); setIsSignup(false); }}>
//             🩺 Doctor
//           </button>
//         </div>
//         <form onSubmit={handleSubmit}>
//           <label>
//             Full Name
//             <div className="input-icon">
//               <FaUser className="icon" />
//               <input
//                 type="text"
//                 name="fullName"
//                 placeholder="Enter your full name"
//                 value={formData.fullName}
//                 onChange={handleInputChange}
//                 required
//               />
//             </div>
//           </label>
//           <label>
//             Password
//             <div className="input-icon">
//               <FaLock className="icon" />
//               <input
//                 type="password"
//                 name="password"
//                 placeholder="Enter your password"
//                 value={formData.password}
//                 onChange={handleInputChange}
//                 required
//               />
//             </div>
//           </label>
//           {/* If new patient signing up, show phone field */}
//           {role === 'patient' && isSignup && (
//             <label>
//               Phone Number
//               <div className="input-icon">
//                 <FaPhone className="icon" />
//                 <input
//                   type="tel"
//                   name="phone"
//                   placeholder="Enter your phone number"
//                   value={formData.phone}
//                   onChange={handleInputChange}
//                   required
//                 />
//               </div>
//             </label>
//           )}
//           <button type="submit" className="submit-btn" disabled={loading}>
//             {loading ? 'Please wait...' : isSignup ? 'Sign Up' : 'Login'}
//           </button>
          
//           {/* Sign Up link below button */}
//           <div style={{ marginTop: '20px', textAlign: 'center' }}>
//             <span>Don't have an account? </span>
//             <button
//               type="button"
//               className="signup-link"
//               style={{
//                 background: 'none',
//                 border: 'none',
//                 color: '#1976d2',
//                 cursor: 'pointer',
//                 textDecoration: 'underline',
//                 fontSize: '1rem'
//               }}
//               onClick={() => navigate('/signup')}
//             >
//               Sign Up
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaIdBadge } from 'react-icons/fa';
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from './Firebase';
import './LoginPage.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState('patient');
  const [formData, setFormData] = useState({
    id: '',
    fullName: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const findUserByRoleId = async (id, role) => {
    // Use patientId or doctorId based on the selected role
    const idField = role === 'patient' ? 'patientId' : 'doctorId';
    const q = query(
      collection(db, "users"),
      where(idField, "==", id.trim()),
      where("role", "==", role)
    );
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;
    return querySnapshot.docs[0].data();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.id) {
      setError(role === 'patient' ? 'Patient ID is required' : 'Doctor ID is required');
      setLoading(false);
      return;
    }
    if (!formData.fullName) {
      setError('Full Name is required');
      setLoading(false);
      return;
    }
    if (!formData.password) {
      setError('Password is required');
      setLoading(false);
      return;
    }

    const user = await findUserByRoleId(formData.id, role);
    if (user) {
      if (
        user.fullName.trim().toLowerCase() === formData.fullName.trim().toLowerCase() &&
        user.password === formData.password
      ) {
        if (role === 'patient') {
          navigate('/patient-dashboard', { state: { name: user.fullName } });
        } else {
          navigate('/doctor-dashboard', { state: { name: user.fullName } });
        }
      } else if (user.fullName.trim().toLowerCase() !== formData.fullName.trim().toLowerCase()) {
        setError('Full name does not match the given ID.');
      } else {
        setError('Incorrect password.');
      }
    } else {
      setError(`No account found with this ${role === 'patient' ? 'Patient' : 'Doctor'} ID. Please sign up.`);
    }
    setLoading(false);
  };

  return (
    <div className="login-page">
      <h1 className="title">DiabetesPredictor</h1>
      <div className="login-container">
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
                placeholder={role === 'patient' ? "Enter your Patient ID" : "Enter your Doctor ID"}
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
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>
          </label>
          {error && (
            <div className="error-message">{error}</div>
          )}
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Please wait...' : 'Login'}
          </button>
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <span>Don't have an account? </span>
            <button
              type="button"
              className="signup-link"
              style={{
                background: 'none',
                border: 'none',
                color: '#1976d2',
                cursor: 'pointer',
                textDecoration: 'underline',
                fontSize: '1rem'
              }}
              onClick={() => navigate('/signup')}
            >
              Sign Up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}