import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaUser, FaSignOutAlt } from "react-icons/fa";
import { db } from "./Firebase";
import {
  collection,
  addDoc,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
} from "firebase/firestore";
import "./PatientDashboard.css";

export default function PatientDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { name } = location.state || { name: "Patient" };

  const [activeTab, setActiveTab] = useState("overview");
  const [showLogForm, setShowLogForm] = useState(false);
  const [isNewPatient, setIsNewPatient] = useState(true);
  const [doctorSuggestion, setDoctorSuggestion] = useState("");

  // Daily log state
  const [logData, setLogData] = useState({
    date: new Date().toISOString().split("T")[0],
    exercise: 0,
    waterIntake: 0,
    sleepHours: 0,
    stressLevel: 0,
    meals: { breakfast: "", lunch: "", dinner: "" },
  });

  // Health metrics state
  const [healthMetrics, setHealthMetrics] = useState({
    gender: "",
    age: "",
    hypertension: false,
    heartDisease: false,
    smokingHistory: "",
    bmi: "",
    hba1cLevel: "",
    bloodGlucoseLevel: "",
  });

  // Risk level state
  const [riskLevel, setRiskLevel] = useState("unknown");

  // Handlers
  const handleLogout = () => navigate("/");

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith("meals.")) {
      const mealType = name.split(".")[1];
      setLogData((prev) => ({
        ...prev,
        meals: { ...prev.meals, [mealType]: value },
      }));
    } else if (name in healthMetrics) {
      setHealthMetrics((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    } else {
      setLogData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleLogSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "patients", name, "logs"), logData);
      alert("✅ Daily log saved!");
      setShowLogForm(false);
      setIsNewPatient(false);
    } catch (error) {
      console.error("Error saving log: ", error);
      alert("❌ Failed to save log.");
    }
  };

  const handleHealthMetricsSubmit = async (e) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, "patients", name), {
        ...healthMetrics,
        updatedAt: new Date(),
      });

      // Call prediction API
      const response = await fetch("http://localhost:8000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(healthMetrics),
      });

      if (response.ok) {
        const result = await response.json();
        const { risk_level } = result;

        // Update Firestore with prediction
        await setDoc(doc(db, "patients", name), {
          ...healthMetrics,
          riskLevel: risk_level,
          prediction: result.prediction,
          probability: result.probability,
          updatedAt: new Date(),
        }, { merge: true });

        setRiskLevel(risk_level);

        // If medium or high, send notification to doctor
        if (risk_level === "medium" || risk_level === "high") {
          await addDoc(collection(db, "doctorNotifications"), {
            patientName: name,
            riskLevel: risk_level,
            message: `Patient ${name} has ${risk_level} diabetes risk.`,
            timestamp: new Date(),
          });
        }

        alert("✅ Health metrics saved and prediction updated!");
      } else {
        alert("❌ Prediction failed, but metrics saved.");
      }
    } catch (error) {
      console.error("Error saving metrics: ", error);
      alert("❌ Failed to save health metrics.");
    }
  };

  // Fetch health metrics + doctor suggestion + risk level (real-time)
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "patients", name), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setHealthMetrics((prev) => ({
          ...prev,
          ...data, // fill with existing Firestore values
        }));
        setDoctorSuggestion(data.doctorSuggestion || "");
        setRiskLevel(data.riskLevel || "unknown");
        setIsNewPatient(false);
      }
    });

    return () => unsub();
  }, [name]);

  // Tab content
  const renderContent = () => {
    if (activeTab === "my-routine") {
      return (
        <section className="section">
          <h2>Daily Routine</h2>
          {doctorSuggestion && (
            <div className="suggestion-box">
              <h4>Doctor's Suggestion:</h4>
              <p>{doctorSuggestion}</p>
            </div>
          )}
          {isNewPatient ? (
            <div className="empty">
              <p>No routine yet. Start logging today.</p>
              <button
                className="btn add-btn"
                onClick={() => setShowLogForm(true)}
              >
                + Log Today
              </button>
            </div>
          ) : (
            <p>Track your daily activities and lifestyle habits.</p>
          )}
          {showLogForm && (
            <div className="modal">
              <div className="modal-content">
                <h3>Log Daily Routine</h3>
                <form onSubmit={handleLogSubmit}>
                  <label>
                    Date
                    <input
                      type="date"
                      name="date"
                      value={logData.date}
                      onChange={handleInputChange}
                    />
                  </label>
                  <label>
                    Exercise (min)
                    <input
                      type="number"
                      name="exercise"
                      value={logData.exercise}
                      onChange={handleInputChange}
                    />
                  </label>
                  <label>
                    Water Intake (glasses)
                    <input
                      type="number"
                      name="waterIntake"
                      value={logData.waterIntake}
                      onChange={handleInputChange}
                    />
                  </label>
                  <label>
                    Sleep Hours
                    <input
                      type="number"
                      step="0.1"
                      name="sleepHours"
                      value={logData.sleepHours}
                      onChange={handleInputChange}
                    />
                  </label>
                  <label>
                    Stress (1-10)
                    <input
                      type="number"
                      min="1"
                      max="10"
                      name="stressLevel"
                      value={logData.stressLevel}
                      onChange={handleInputChange}
                    />
                  </label>
                  <fieldset>
                    <legend>Meals</legend>
                    <input
                      type="text"
                      name="meals.breakfast"
                      placeholder="Breakfast"
                      value={logData.meals.breakfast}
                      onChange={handleInputChange}
                    />
                    <input
                      type="text"
                      name="meals.lunch"
                      placeholder="Lunch"
                      value={logData.meals.lunch}
                      onChange={handleInputChange}
                    />
                    <input
                      type="text"
                      name="meals.dinner"
                      placeholder="Dinner"
                      value={logData.meals.dinner}
                      onChange={handleInputChange}
                    />
                  </fieldset>
                  <div className="form-actions">
                    <button type="submit" className="btn save-btn">
                      Save
                    </button>
                    <button
                      type="button"
                      className="btn cancel-btn"
                      onClick={() => setShowLogForm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </section>
      );
    }

    if (activeTab === "health-metrics") {
      return (
        <section className="section">
          <h2>Health Metrics</h2>
          <form className="metrics-form" onSubmit={handleHealthMetricsSubmit}>
            <label>
              Gender
              <select
                name="gender"
                value={healthMetrics.gender}
                onChange={handleInputChange}
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label>
              Age
              <input
                type="number"
                name="age"
                value={healthMetrics.age}
                onChange={handleInputChange}
              />
            </label>
            <label>
              <input
                type="checkbox"
                name="hypertension"
                checked={healthMetrics.hypertension}
                onChange={handleInputChange}
              />{" "}
              Hypertension
            </label>
            <label>
              <input
                type="checkbox"
                name="heartDisease"
                checked={healthMetrics.heartDisease}
                onChange={handleInputChange}
              />{" "}
              Heart Disease
            </label>
            <label>
              Smoking
              <select
                name="smokingHistory"
                value={healthMetrics.smokingHistory}
                onChange={handleInputChange}
              >
                <option value="">Select</option>
                <option value="never">Never</option>
                <option value="former">Former</option>
                <option value="current">Current</option>
              </select>
            </label>
            <label>
              BMI
              <input
                type="number"
                step="0.1"
                name="bmi"
                value={healthMetrics.bmi}
                onChange={handleInputChange}
              />
            </label>
            <label>
              HbA1c
              <input
                type="number"
                step="0.01"
                name="hba1cLevel"
                value={healthMetrics.hba1cLevel}
                onChange={handleInputChange}
              />
            </label>
            <label>
              Glucose
              <input
                type="number"
                step="0.01"
                name="bloodGlucoseLevel"
                value={healthMetrics.bloodGlucoseLevel}
                onChange={handleInputChange}
              />
            </label>
            <button type="submit" className="btn save-btn">
              Save
            </button>
          </form>
        </section>
      );
    }

    return (
      <section className="section">
        <h2>Overview</h2>
        <p>
          Stay on top of your diabetes management with real-time insights.
        </p>
      </section>
    );
  };

  return (
    <div className="dashboard">
      <header className="navbar">
        <div className="logo">💙 DiabetesPrediction</div>
        <div className="nav-right">
          <span className="welcome">
            <FaUser /> Welcome, {name}
          </span>
          <button className="btn logout-btn" onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </header>

      <div className="tabs">
        {["overview", "my-routine", "health-metrics"].map((tab) => (
          <button
            key={tab}
            className={activeTab === tab ? "active" : ""}
            onClick={() => setActiveTab(tab)}
          >
            {tab.replace("-", " ").toUpperCase()}
          </button>
        ))}
      </div>

      {renderContent()}
      <button className="floating-risk-btn">🎯 Risk: {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)}</button>
    </div>
  );
}
