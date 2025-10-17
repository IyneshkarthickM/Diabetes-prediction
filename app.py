import gradio as gr
import joblib
import pandas as pd
import os

# --- Load Models ---
try:
    model_path = "diabetes_model.pkl"
    encoder_path = "label_encoders.pkl"
    
    if not os.path.exists(model_path) or not os.path.exists(encoder_path):
        raise FileNotFoundError("Model or encoder files not found.")

    model = joblib.load(model_path)
    label_encoders = joblib.load(encoder_path)
    print("Models loaded successfully.")

except Exception as e:
    model = None
    label_encoders = None
    print(f"CRITICAL ERROR: Failed to load models on startup: {e}")

# --- Prediction Function ---
def predict_diabetes(gender, age, hypertension, heart_disease, smoking_history, bmi, hba1c_level, blood_glucose_level):
    if model is None or label_encoders is None:
        # This will be visible in the Gradio UI if models fail to load
        raise gr.Error("Error: Models are not loaded. Check the application logs.")

    try:
        # --- Data Type Conversion & DataFrame Creation ---
        input_data = {
            'gender': gender,
            'age': int(age),
            'hypertension': int(hypertension),
            'heart_disease': int(heart_disease),
            'smoking_history': smoking_history,
            'bmi': float(bmi),
            'hba1c_level': float(hba1c_level),
            'blood_glucose_level': int(blood_glucose_level)
        }
        df = pd.DataFrame([input_data])

        # --- Data Preprocessing ---
        for col, le in label_encoders.items():
            if col in df.columns:
                df[col] = le.transform(df[col])
        
        # FIX: Rename column to match the exact feature name the model expects.
        df.rename(columns={'hba1c_level': 'HbA1c_level'}, inplace=True)

        # Use the correct feature names as expected by the model
        model_features = [
            'gender', 'age', 'hypertension', 'heart_disease', 'smoking_history', 
            'bmi', 'HbA1c_level', 'blood_glucose_level'
        ]
        df_features = df[model_features]

        # --- Prediction ---
        prediction = model.predict(df_features)[0]
        probability = model.predict_proba(df_features)[0][1]

        # --- Format Output ---
        risk_level = "high" if probability >= 0.7 else ("medium" if probability >= 0.3 else "low")
        status = "Likely Diabetic" if prediction == 1 else "Not Diabetic"
        probability_formatted = f"{probability:.2%}"

        return status, risk_level, probability_formatted

    except Exception as e:
        error_message = f"Error during prediction: {e}"
        print(error_message)
        raise gr.Error(error_message)

# --- Create the Gradio Interface ---
demo = gr.Interface(
    fn=predict_diabetes,
    title="Diabetes Risk Predictor",
    description="Enter patient details to predict the risk of diabetes. This interface is for demonstration. Use the API for programmatic access.",
    inputs=[
        gr.Radio(label="Gender", choices=["Male", "Female", "Other"]),
        gr.Number(label="Age"),
        gr.Radio(label="Hypertension (History of High Blood Pressure)", choices=[('Yes', 1), ('No', 0)], type="value"),
        gr.Radio(label="Heart Disease (History of)", choices=[('Yes', 1), ('No', 0)], type="value"),
        gr.Dropdown(label="Smoking History", choices=['never', 'No Info', 'current', 'former', 'ever', 'not current']),
        gr.Number(label="Body Mass Index (BMI)"),
        gr.Number(label="Hemoglobin A1c (HbA1c) Level"),
        gr.Number(label="Blood Glucose Level")
    ],
    outputs=[
        gr.Label(label="Prediction Status"),
        gr.Label(label="Risk Level"),
        gr.Label(label="Probability of Diabetes"),
    ],
    allow_flagging="never",
)

# --- Launch the App ---
demo.launch()
