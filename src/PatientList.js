
import React from 'react';
import './PatientList.css';

const PatientList = ({ patients, onPatientSelect, selectedPatient }) => {
  const getRiskLevelClass = (riskLevel) => {
    if (riskLevel === 'high') return 'risk-level-high';
    if (riskLevel === 'medium') return 'risk-level-medium';
    return 'risk-level-low';
  };

  return (
    <div className="patient-list-container">
      <div className="patient-list-header">
        <span>PATIENT NAME</span>
        <span>RISK LEVEL</span>
        <span>PROBABILITY</span>
      </div>
      <ul className="patient-list">
        {patients.map((patient) => (
          <li
            key={patient.id}
            className={`patient-list-item ${selectedPatient && selectedPatient.id === patient.id ? 'selected' : ''}`}
            onClick={() => onPatientSelect(patient)}
          >
            <span className="patient-name">{patient.name}</span>
            <span className={getRiskLevelClass(patient.risk_level)}>
              {patient.risk_level.charAt(0).toUpperCase() + patient.risk_level.slice(1)}
            </span>
            <span className="probability">{patient.probability}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PatientList;
