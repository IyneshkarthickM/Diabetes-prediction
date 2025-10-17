
import React from 'react';
import './SummaryCards.css';

const SummaryCards = ({ patients }) => {
  const totalPatients = patients.length;
  const diabetesPatients = patients.filter(p => p.diabetes === 1).length;
  const highRiskPatients = patients.filter(p => p.risk_level === 'high').length;

  return (
    <div className="summary-cards">
      <div className="summary-card">
        <h3>Total Patients</h3>
        <p className="count">{totalPatients}</p>
      </div>
      <div className="summary-card">
        <h3>Diabetes Patients</h3>
        <p className="count">{diabetesPatients}</p>
      </div>
      <div className="summary-card">
        <h3>High-Risk Patients</h3>
        <p className="count">{highRiskPatients}</p>
      </div>
    </div>
  );
};

export default SummaryCards;
