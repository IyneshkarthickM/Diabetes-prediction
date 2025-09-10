import React, { useEffect, useState } from "react";
import { db } from "./Firebase";
import { collection, getDocs, doc, updateDoc, onSnapshot } from "firebase/firestore";
import "./DoctorDashboard.css";

export default function DoctorDashboard() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [suggestion, setSuggestion] = useState("");
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "patients"));
        setPatients(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching patients:", error);
      }
    };
    fetchPatients();
  }, []);

  // Fetch notifications in real-time
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "doctorNotifications"), (snapshot) => {
      setNotifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  const handleSuggestRoutine = async () => {
    if (!selectedPatient) return;
    try {
      const patientRef = doc(db, "patients", selectedPatient.id);
      await updateDoc(patientRef, { doctorSuggestion: suggestion });
      alert("✅ Suggestion sent!");
      setSuggestion("");
    } catch (error) {
      console.error("Error sending suggestion:", error);
    }
  };

  return (
    <div className="dashboard">
      <header className="navbar">
        <div className="logo">🩺 Doctor Dashboard</div>
      </header>

      <div className="notifications">
        <h3>Notifications</h3>
        {notifications.length === 0 ? (
          <p>No new notifications.</p>
        ) : (
          <ul>
            {notifications.map(notification => (
              <li key={notification.id} className={`notification ${notification.riskLevel}`}>
                <strong>{notification.patientName}</strong>: {notification.message}
                <br />
                <small>{new Date(notification.timestamp.toDate()).toLocaleString()}</small>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="patient-selector">
        <label>Select Patient:</label>
        <select onChange={(e) => setSelectedPatient(patients.find(p => p.id === e.target.value))}>
          <option value="">-- Choose Patient --</option>
          {patients.map(p => (
            <option key={p.id} value={p.id} className={p.riskLevel === "high" ? "high-risk" : p.riskLevel === "medium" ? "medium-risk" : ""}>
              {p.id} {p.riskLevel && `(${p.riskLevel})`}
            </option>
          ))}
        </select>
      </div>

      {selectedPatient && (
        <section className="section">
          <h2>{selectedPatient.id}'s Health</h2>
          <p><b>Age:</b> {selectedPatient.age}</p>
          <p><b>BMI:</b> {selectedPatient.bmi}</p>
          <p><b>Glucose:</b> {selectedPatient.bloodGlucoseLevel}</p>
          <p><b>Risk Level:</b> {selectedPatient.riskLevel || "Unknown"}</p>

          <textarea
            className="textarea"
            placeholder="Suggest routine..."
            value={suggestion}
            onChange={(e) => setSuggestion(e.target.value)}
          />
          <button className="btn save-btn" onClick={handleSuggestRoutine}>Send Suggestion</button>
        </section>
      )}
    </div>
  );
}
