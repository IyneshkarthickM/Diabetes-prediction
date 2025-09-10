// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { FaUser, FaLock, FaPhone } from 'react-icons/fa';
// import { collection, addDoc } from "firebase/firestore";
// import { db } from './Firebase';
// import './SignupPage.css';

// export default function SignupPage() {
//   const navigate = useNavigate();
//   const [role, setRole] = useState('patient');
//   const [formData, setFormData] = useState({
//     fullName: '',
//     age: '',
//     phone: '',
//     password: ''
//   });
//   const [loading, setLoading] = useState(false);

//   const handleInputChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSignup = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     if (!formData.fullName || !formData.age || !formData.phone || !formData.password) {
//       alert('Please fill out all fields');
//       setLoading(false);
//       return;
//     }
//     try {
//       await addDoc(collection(db, "users"), {
//         fullName: formData.fullName.trim(),
//         age: Number(formData.age),
//         phone: formData.phone,
//         password: formData.password,
//         role
//       });
//       alert('Signup successful!');
//       if (role === 'patient') {
//         navigate('/patient-dashboard', { state: { name: formData.fullName } });
//       } else {
//         navigate('/doctor-dashboard', { state: { name: formData.fullName } });
//       }
//     } catch (error) {
//       alert("Signup failed: " + error.message);
//     }
//     setLoading(false);
//   };

//   return (
//     <div className="signup-page">
//       <h1 className="title">Sign Up</h1>
//       <div className="signup-container">
//         <div className="role-toggle">
//           <button className={role === 'patient' ? 'active' : ''} onClick={() => setRole('patient')}>
//             👤 Patient
//           </button>
//           <button className={role === 'doctor' ? 'active' : ''} onClick={() => setRole('doctor')}>
//             🩺 Doctor
//           </button>
//         </div>
//         <form onSubmit={handleSignup}>
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
//             Age
//             <div className="input-icon">
//               <input
//                 type="number"
//                 name="age"
//                 placeholder="Enter your age"
//                 value={formData.age}
//                 onChange={handleInputChange}
//                 required
//                 min="0"
//               />
//             </div>
//           </label>
//           <label>
//             Phone Number
//             <div className="input-icon">
//               <FaPhone className="icon" />
//               <input
//                 type="tel"
//                 name="phone"
//                 placeholder="Enter your phone number"
//                 value={formData.phone}
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
//           <button type="submit" className="submit-btn" disabled={loading}>
//             {loading ? 'Please wait...' : 'Sign Up'}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaPhone, FaCalendar, FaIdBadge } from 'react-icons/fa';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from './Firebase';
import './SignupPage.css';

// Password: minimum 8 chars, must include at least one number
function isStrongPassword(password) {
  const strongRegex = /^(?=.*\d).{8,}$/;
  return strongRegex.test(password);
}

// Phone: exactly 10 digits
function isValidPhone(phone) {
  const phoneRegex = /^\d{10}$/;
  return phoneRegex.test(phone);
}

export default function SignupPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState('patient');
  const [formData, setFormData] = useState({
    id: '',
    fullName: '',
    age: '',
    phone: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Check if user already exists by id and role
  const checkUserExists = async (id, role) => {
    const idField = role === 'patient' ? 'patientId' : 'doctorId';
    const q = query(
      collection(db, "users"),
      where(idField, "==", id.trim()),
      where("role", "==", role)
    );
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);

    // Validate ID
    if (!formData.id) {
      alert(role === 'patient' ? 'Patient ID is required' : 'Doctor ID is required');
      setLoading(false);
      return;
    }
    if (!formData.fullName) {
      alert("Full Name is required");
      setLoading(false);
      return;
    }
    if (!formData.age) {
      alert("Age is required");
      setLoading(false);
      return;
    }
    if (!formData.phone) {
      alert("Phone number is required");
      setLoading(false);
      return;
    }
    if (!isValidPhone(formData.phone)) {
      alert("Phone number must be exactly 10 digits.");
      setLoading(false);
      return;
    }
    if (!formData.password) {
      alert("Password is required");
      setLoading(false);
      return;
    }
    if (formData.password.length < 8) {
      alert("Password must be at least 8 characters long.");
      setLoading(false);
      return;
    }
    if (!isStrongPassword(formData.password)) {
      alert("Password must include at least one number.");
      setLoading(false);
      return;
    }

    // Check if ID exists
    const exists = await checkUserExists(formData.id, role);
    if (exists) {
      alert("User with this ID already exists. Please log in.");
      navigate('/');
      setLoading(false);
      return;
    }

    // Prepare user object with correct id field
    const userObj = {
      fullName: formData.fullName.trim(),
      age: formData.age,
      phone: formData.phone,
      password: formData.password,
      role,
    };
    if (role === 'patient') {
      userObj.patientId = formData.id.trim();
    } else {
      userObj.doctorId = formData.id.trim();
    }

    try {
      await addDoc(collection(db, "users"), userObj);
      alert("Signup successful!");
      if (role === 'patient') {
        navigate('/patient-dashboard', { state: { name: formData.fullName } });
      } else {
        navigate('/doctor-dashboard', { state: { name: formData.fullName } });
      }
    } catch (error) {
      alert("Signup failed: " + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <div className="role-toggle">
          <button
            className={role === 'patient' ? 'active' : ''}
            onClick={() => { setRole('patient'); setFormData({ id: '', fullName: '', age: '', phone: '', password: '' }); }}
          >
            👤 Patient
          </button>
          <button
            className={role === 'doctor' ? 'active' : ''}
            onClick={() => { setRole('doctor'); setFormData({ id: '', fullName: '', age: '', phone: '', password: '' }); }}
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
            Age
            <div className="input-icon">
              <FaCalendar className="icon" />
              <input
                type="number"
                name="age"
                placeholder="Enter your age"
                value={formData.age}
                onChange={handleInputChange}
                min="0"
                required
              />
            </div>
          </label>
          <label>
            Phone Number
            <div className="input-icon">
              <FaPhone className="icon" />
              <input
                type="tel"
                name="phone"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleInputChange}
                required
                maxLength={10}
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
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Please wait...' : 'Sign Up'}
          </button>
        </form>
      </div>
    </div>
  );
}
