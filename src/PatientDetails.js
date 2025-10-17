
import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import './PatientDetails.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const generateAISummary = (patient) => {
  let summary = `Patient ${patient.name} shows a `;

  if (patient.risk_level === 'high') {
    summary += 'high risk of diabetes. ';
    summary += `This is indicated by a hba1c level of ${patient.hba1c_level} and a blood glucose level of ${patient.blood_glucose_level}. `;
  } else if (patient.risk_level === 'medium') {
    summary += 'medium risk of diabetes. ';
  } else {
    summary += 'low risk of diabetes. ';
  }

  if (patient.hypertension === 1) {
    summary += 'The patient has a history of hypertension. ';
  }

  if (patient.heart_disease === 1) {
    summary += 'The patient has a history of heart disease. ';
  }

  if (patient.bmi > 25) {
    summary += `The patient's BMI of ${patient.bmi} is in the overweight range, which could be a contributing factor. `;
  }

  summary += 'Continue to monitor blood glucose levels and lifestyle factors.';
  return summary;
};


const PatientDetails = ({ patient }) => {
  const [summary, setSummary] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(true);

  useEffect(() => {
    if (patient) {
      setLoadingSummary(true);
      // Simulate an API call to an AI model
      setTimeout(() => {
        const generatedSummary = generateAISummary(patient);
        setSummary(generatedSummary);
        setLoadingSummary(false);
      }, 500);
    }
  }, [patient]);

  if (!patient) {
    return (
      <div className="patient-details-container">
        <p>Select a patient to see the details.</p>
      </div>
    );
  }

  const chartData = {
    labels: ['BMI', 'HbA1c Level', 'Blood Glucose'],
    datasets: [
      {
        label: patient.name,
        data: [
          patient.bmi,
          patient.hba1c_level,
          patient.blood_glucose_level,
        ],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Health Metrics for ${patient.name}`,
      },
    },
  };

  return (
    <div className="patient-details-container">
      <div className="patient-info">
        <h4>Patient Information</h4>
        <p><strong>Age:</strong> {patient.age}</p>
        <p><strong>Gender:</strong> {patient.gender}</p>
        <p><strong>Hypertension:</strong> {patient.hypertension === 1 ? 'Yes' : 'No'}</p>
        <p><strong>Heart Disease:</strong> {patient.heart_disease === 1 ? 'Yes' : 'No'}</p>
        <p><strong>Smoking History:</strong> {patient.smoking_history}</p>
        <p><strong>Diabetes:</strong> {patient.diabetes === 1 ? 'Yes' : 'No'}</p>
      </div>
      <div className="chart-container">
        <Bar data={chartData} options={options} />
      </div>
      <div className="ai-summary-container">
        <h4>AI-Generated Summary</h4>
        {loadingSummary ? <p>Generating summary...</p> : <p>{summary}</p>}
      </div>
    </div>
  );
};

export default PatientDetails;
