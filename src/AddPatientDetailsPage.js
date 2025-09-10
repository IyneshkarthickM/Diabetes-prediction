

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddPatientDetailsPage.css';

const AddPatientDetailsPage = () => {
  const [formData, setFormData] = useState({
    age: '',
    bloodSugar: '',
    insulinUsage: '',
    medication: '',
    lastCheckup: ''
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Send data to PatientDetailsPage with state
    navigate('/patient-details', { state: { patientData: formData } });
  };

  return (
    <div className="form-container">
      <h2>Enter Your Diabetes Details</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Age:
          <input type="number" name="age" value={formData.age} onChange={handleChange} required />
        </label>
        <label>
          Blood Sugar Level (mg/dL):
          <input type="number" name="bloodSugar" value={formData.bloodSugar} onChange={handleChange} required />
        </label>
        <label>
          Insulin Usage:
          <input type="text" name="insulinUsage" value={formData.insulinUsage} onChange={handleChange} required />
        </label>
        <label>
          Medication:
          <input type="text" name="medication" value={formData.medication} onChange={handleChange} required />
        </label>
        <label>
          Last Checkup:
          <input type="date" name="lastCheckup" value={formData.lastCheckup} onChange={handleChange} required />
        </label>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default AddPatientDetailsPage;
