from fastapi import FastAPI, HTTPException
import firebase_admin
from firebase_admin import credentials, firestore
import joblib
import pandas as pd
import os


cred = credentials.Certificate("serviceaccount.json")  
firebase_admin.initialize_app(cred)
db = firestore.client()


MODEL_PATH = "diabetes_model.pkl"
ENCODER_PATH = "label_encoders.pkl"


if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(f"❌ Model file not found at {MODEL_PATH}")
model = joblib.load(MODEL_PATH)


label_encoders = {}
if os.path.exists(ENCODER_PATH):
    label_encoders = joblib.load(ENCODER_PATH)


app = FastAPI(
    title="Diabetes Predictor API",
    description="Predicts diabetes risk from Firestore or JSON input.",
    version="1.0.0",
)


@app.get("/")
def root():
    return {"message": "✅ Diabetes Predictor API is running!"}



@app.get("/predict/{patient_name}")
def predict_from_firestore(patient_name: str):
    try:
        doc_ref = db.collection("patients").document(patient_name)
        doc = doc_ref.get()

        if not doc.exists:
            raise HTTPException(status_code=404, detail=f"Patient '{patient_name}' not found in Firestore.")

        data = doc.to_dict()

        df = pd.DataFrame([{
            "gender": data.get("gender", "other"),
            "age": float(data.get("age", 0)),
            "hypertension": int(data.get("hypertension", 0)),
            "heart_disease": int(data.get("heartDisease", 0)),   # mapped to model
            "smoking_history": data.get("smokingHistory", "never"),
            "bmi": float(data.get("bmi", 0)),
            "HbA1c_level": float(data.get("hba1cLevel", 0)),
            "blood_glucose_level": float(data.get("bloodGlucoseLevel", 0)),
        }])

        # Apply encoders
        for col, le in label_encoders.items():
            if col in df.columns:
                df[col] = le.transform(df[col])

        # Prediction
        prediction = int(model.predict(df)[0])
        probability = (
            round(float(model.predict_proba(df)[0][1]), 4) if hasattr(model, "predict_proba") else None
        )

        # Determine risk level
        if probability is not None:
            if probability < 0.3:
                risk_level = "low"
            elif probability < 0.7:
                risk_level = "medium"
            else:
                risk_level = "high"
        else:
            risk_level = "unknown"

        return {
            "patient": patient_name,
            "input_data": df.to_dict(orient="records")[0],
            "prediction": prediction,
            "probability": probability,
            "risk_level": risk_level,
            "status": "Likely diabetic" if prediction == 1 else "Not diabetic",
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)


# =========================
# Prediction from JSON input
# =========================
@app.post("/predict")
def predict_from_json(data: dict):
    try:
        df = pd.DataFrame([{
            "gender": data.get("gender", "other"),
            "age": float(data.get("age", 0)),
            "hypertension": int(data.get("hypertension", 0)),
            "heart_disease": int(data.get("heartDisease", 0)),
            "smoking_history": data.get("smokingHistory", "never"),
            "bmi": float(data.get("bmi", 0)),
            "HbA1c_level": float(data.get("hba1cLevel", 0)),
            "blood_glucose_level": float(data.get("bloodGlucoseLevel", 0)),
        }])

        # Apply encoders
        for col, le in label_encoders.items():
            if col in df.columns:
                df[col] = le.transform(df[col])

        # Prediction
        prediction = int(model.predict(df)[0])
        probability = (
            round(float(model.predict_proba(df)[0][1]), 4) if hasattr(model, "predict_proba") else None
        )

        # Determine risk level
        if probability is not None:
            if probability < 0.3:
                risk_level = "low"
            elif probability < 0.7:
                risk_level = "medium"
            else:
                risk_level = "high"
        else:
            risk_level = "unknown"

        return {
            "input_data": df.to_dict(orient="records")[0],
            "prediction": prediction,
            "probability": probability,
            "risk_level": risk_level,
            "status": "Likely diabetic" if prediction == 1 else "Not diabetic",
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
