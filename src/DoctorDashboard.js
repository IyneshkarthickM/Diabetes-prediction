
import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import "./DoctorDashboard.css";
import PatientList from "./PatientList";
import PatientDetails from "./PatientDetails";
import SummaryCards from "./SummaryCards";

export default function DoctorDashboard({ session, onLogout }) {
  const { name } = session;

  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatientsAndUsers = async () => {
      setLoading(true);

      // 1. Fetch all patients
      const { data: patientsData, error: patientsError } = await supabase
        .from('patients')
        .select('*');

      if (patientsError) {
        console.error('Error fetching patients:', patientsError);
        setLoading(false);
        return;
      }

      if (patientsData && patientsData.length > 0) {
        // 2. Get the user IDs from the patient records (where ID is a UUID)
        const userIds = patientsData.map(p => p.id).filter(id => id && id.includes('-'));

        // 3. Fetch the full names of the users corresponding to the patients
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('id, full_name')
          .in('id', userIds);

        if (usersError) {
          console.error('Error fetching user data:', usersError);
        }

        // 4. Create a map of user ID to full name
        const userIdToNameMap = usersData
          ? usersData.reduce((acc, user) => {
              acc[user.id] = user.full_name;
              return acc;
            }, {})
          : {};

        // 5. Combine patient data with user full names
        const parsedData = patientsData.map(patient => {
            let name = 'Unknown';
            if (patient.id && patient.id.includes('-')) {
                name = userIdToNameMap[patient.id] || 'Unknown';
            } else if (patient.id) {
                name = patient.id;
            }
            return {
                ...patient,
                name: name,
                diabetes: patient.prediction_status === 'Likely Diabetic' ? 1 : 0,
            }
        });
        
        setPatients(parsedData);
        if (parsedData.length > 0) {
          setSelectedPatient(parsedData[0]);
        }
      } else {
        setPatients([]);
      }
      
      setLoading(false);
    };

    fetchPatientsAndUsers();
  }, []);

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
  };

  return (
    <div className="dashboard">
      <header className="navbar">
        <div className="logo">❤️ DiabetesPrediction</div>
        <div className="user-info">
          <span>Welcome, Dr. {name}</span>
          <button onClick={onLogout} className="logout-button">Logout</button>
        </div>
      </header>

      <main className="main-content">
        <SummaryCards patients={patients} />

        <div className="content-container">
          <div className="patients-container">
            {loading ? (
              <p>Loading patients...</p>
            ) : patients.length > 0 ? (
              <PatientList
                patients={patients}
                onPatientSelect={handlePatientSelect}
                selectedPatient={selectedPatient}
              />
            ) : (
              <p>No patients found.</p>
            )}
          </div>
          <div className="patient-details-wrapper">
            {loading ? (
              <p>Loading patient details...</p>
            ) : selectedPatient ? (
              <PatientDetails patient={selectedPatient} />
            ) : (
              <p>Select a patient to view details.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
