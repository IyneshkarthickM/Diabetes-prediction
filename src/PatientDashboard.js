
import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { FaUser, FaSignOutAlt } from "react-icons/fa";
import { supabase } from "./supabaseClient";
import "./PatientDashboard.css";

export default function PatientDashboard({ session, onLogout }) { 
  const { name, id } = session; 

  const [activeTab, setActiveTab] = useState("overview");
  const [aiSummary, setAiSummary] = useState("");
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [healthMetrics, setHealthMetrics] = useState({
    gender: "Male",
    age: "",
    hypertension: 0,
    heart_disease: 0,
    smoking_history: "never",
    bmi: "",
    hba1c_level: "",
    blood_glucose_level: "",
  });
  const [predictionStatus, setPredictionStatus] = useState("Unknown");
  const [riskLevel, setRiskLevel] = useState("Unknown");
  const [probability, setProbability] = useState("Unknown");

  useEffect(() => {
    const fetchPatientData = async () => {
      if (!id) return;

      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116: single row not found
        console.error("Error fetching patient data:", error);
        return;
      }

      if (data) {
        const patient = data;
        setHealthMetrics({
          gender: patient.gender || "Male",
          age: patient.age || "",
          hypertension: patient.hypertension !== undefined ? patient.hypertension : 0,
          heart_disease: patient.heart_disease !== undefined ? patient.heart_disease : 0,
          smoking_history: patient.smoking_history || "never",
          bmi: patient.bmi || "",
          hba1c_level: patient.hba1c_level || "",
          blood_glucose_level: patient.blood_glucose_level || "",
        });
        setPredictionStatus(patient.prediction_status || "Unknown");
        setRiskLevel(patient.risk_level || "Unknown");
        setProbability(patient.probability || "Unknown");
      } else {
        // Handle case where patient record doesn't exist yet
        setHealthMetrics({
          gender: "Male",
          age: "",
          hypertension: 0,
          heart_disease: 0,
          smoking_history: "never",
          bmi: "",
          hba1c_level: "",
          blood_glucose_level: "",
        });
        setPredictionStatus("Not Yet Predicted");
        setRiskLevel("Unknown");
        setProbability("N/A");
      }
    };

    fetchPatientData();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    const processedValue = type === 'radio' ? parseInt(value, 10) : value;
    setHealthMetrics((prev) => ({ ...prev, [name]: processedValue }));
  };

  const handleGetSummary = async () => {
    setIsLoadingSummary(true);
    setAiSummary("");
    try {
      const { data, error } = await supabase.functions.invoke('get-health-summary', {
        body: { patientId: id },
      });

      if (error) throw error;
      setAiSummary(data.summary);
    } catch (error) {
      console.error("Error getting AI summary:", error);
      setAiSummary("An error occurred while generating the summary. Please try again.");
    } finally {
      setIsLoadingSummary(false);
    }
  };

  const handleHealthMetricsSubmit = async (e) => {
    e.preventDefault();

    for (const key in healthMetrics) {
      if (healthMetrics[key] === "" || healthMetrics[key] === null) {
        alert(`❌ Please fill out the '${key.replace(/_/g, " ")}' field.`);
        return;
      }
    }

    const { data: result, error: functionError } = await supabase.functions.invoke(
      'predict-diabetes',
      {
        body: {
          patientId: id, 
          data: [
            healthMetrics.gender,
            Number(healthMetrics.age),
            Number(healthMetrics.hypertension),
            Number(healthMetrics.heart_disease),
            healthMetrics.smoking_history,
            parseFloat(healthMetrics.bmi),
            parseFloat(healthMetrics.hba1c_level),
            parseFloat(healthMetrics.blood_glucose_level),
          ]
        }
      }
    );

    if (functionError) {
      console.error("API Error:", functionError);
      alert(`API Error: ${functionError.message}`);
      return;
    }

    if (!result || !result.data) {
      const errorMessage = "Prediction failed: Invalid response from the server.";
      console.error(errorMessage, result);
      alert(errorMessage);
      return;
    }

    const predictionData = {
      prediction_status: result.data[0].label,
      risk_level: result.data[1].label,
      probability: result.data[2].label,
    };

    setPredictionStatus(predictionData.prediction_status);
    setRiskLevel(predictionData.risk_level);
    setProbability(predictionData.probability);

    const patientRecord = {
      id: id,
      ...healthMetrics,
      age: Number(healthMetrics.age),
      bmi: parseFloat(healthMetrics.bmi),
      hba1c_level: parseFloat(healthMetrics.hba1c_level),
      blood_glucose_level: Number(healthMetrics.blood_glucose_level),
      ...predictionData,
      updated_at: new Date().toISOString(),
    };

    const { error: upsertError } = await supabase.from('patients').upsert(patientRecord, { onConflict: 'id' });

    if (upsertError) {
      console.error("Error saving to Supabase: ", upsertError);
      alert(`❌ Error saving data: ${upsertError.message}`);
      return;
    }

    alert("✅ Patient data saved and prediction updated!");

    if (predictionData.risk_level === "High" || predictionData.risk_level === "Medium") {
      const { error: notificationError } = await supabase.from('doctor_notifications').insert({
        patient_name: name,
        risk_level: predictionData.risk_level,
        message: `Patient ${name} has a '${predictionData.risk_level}' risk of diabetes.`,
      });

      if (notificationError) {
        console.error("Error creating notification:", notificationError);
      }
    }

    setActiveTab("overview");
  };

  const renderOverview = () => (
    <section className="section overview-section">
      <h2>Patient Overview</h2>
      <div className="overview-grid">
        <div className="overview-card"><h4>Prediction Status</h4><p className={`status-${String(predictionStatus).toLowerCase().replace(/ /g, '-')}`}>{predictionStatus}</p></div>
        <div className="overview-card"><h4>Risk Level</h4><p className={`risk-${String(riskLevel).toLowerCase()}`}>{riskLevel}</p></div>
        <div className="overview-card"><h4>Probability</h4><p>{probability}</p></div>
      </div>
    </section>
  );

  const renderHealthMetricsForm = () => (
    <section className="section"><h2>Health Metrics</h2><p>Enter your latest health information to get an updated diabetes risk prediction.</p><form className="metrics-form" onSubmit={handleHealthMetricsSubmit}><label><span>Gender</span><select name="gender" value={healthMetrics.gender} onChange={handleInputChange}><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option></select></label><label><span>Age</span><input type="number" name="age" value={healthMetrics.age} onChange={handleInputChange} placeholder="e.g., 54"/></label><label><span>Body Mass Index (BMI)</span><input type="number" step="0.01" name="bmi" value={healthMetrics.bmi} onChange={handleInputChange} placeholder="e.g., 25.71"/></label><label><span>HbA1c Level</span><input type="number" step="0.01" name="hba1c_level" value={healthMetrics.hba1c_level} onChange={handleInputChange} placeholder="e.g., 6.6"/></label><label><span>Blood Glucose Level</span><input type="number" name="blood_glucose_level" value={healthMetrics.blood_glucose_level} onChange={handleInputChange} placeholder="e.g., 140"/></label><fieldset><legend>Smoking History</legend><select name="smoking_history" value={healthMetrics.smoking_history} onChange={handleInputChange}><option value="never">Never</option><option value="No Info">No Info</option><option value="current">Current</option><option value="former">Former</option><option value="ever">Ever</option><option value="not current">Not Current</option></select></fieldset><fieldset><legend>Hypertension</legend><label><input type="radio" name="hypertension" value={1} checked={healthMetrics.hypertension === 1} onChange={handleInputChange}/> Yes</label><label><input type="radio" name="hypertension" value={0} checked={healthMetrics.hypertension === 0} onChange={handleInputChange}/> No</label></fieldset><fieldset><legend>Heart Disease</legend><label><input type="radio" name="heart_disease" value={1} checked={healthMetrics.heart_disease === 1} onChange={handleInputChange}/> Yes</label><label><input type="radio" name="heart_disease" value={0} checked={healthMetrics.heart_disease === 0} onChange={handleInputChange}/> No</label></fieldset><button type="submit" className="btn save-btn">Update & Predict</button></form></section>
  );

  const renderAiSummary = () => (
    <section className="section ai-summary-section">
      <h2>AI Health Summary & Advice</h2>
      <p>Get personalized feedback on your health data from our AI assistant. This requires your latest health data to be saved.</p>
      <button onClick={handleGetSummary} disabled={isLoadingSummary || !id} className="btn">
        {isLoadingSummary ? "Analyzing..." : "Generate My Health Summary"}
      </button>
      {isLoadingSummary && <div className="loader"></div>}
      {aiSummary && (
        <div className="ai-summary-result">
          <ReactMarkdown>{aiSummary}</ReactMarkdown>
        </div>
      )}
    </section>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "health-metrics": return renderHealthMetricsForm();
      case "ai-health-summary": return renderAiSummary();
      case "overview":
      default: return renderOverview();
    }
  };

  return (
    <div className="dashboard">
      <header className="navbar">
        <div className="logo">💙 DiabetesPrediction</div>
        <div className="nav-right">
          <span className="welcome"><FaUser /> Welcome, {name}</span>
          <button className="btn logout-btn" onClick={onLogout}><FaSignOutAlt /> Logout</button> 
        </div>
      </header>
      <div className="tabs">
        {["overview", "health-metrics", "ai-health-summary"].map((tab) => (
          <button key={tab} className={activeTab === tab ? "active" : ""} onClick={() => setActiveTab(tab)}>
            {tab.replace(/-/g, " ").toUpperCase()}
          </button>
        ))}
      </div>
      {renderContent()}
      <div className={`floating-risk-btn risk-${String(riskLevel).toLowerCase()}`}>🎯 Risk: {riskLevel}</div>
    </div>
  );
}
