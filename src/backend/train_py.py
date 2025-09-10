import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, classification_report
from sklearn.ensemble import RandomForestClassifier
import xgboost as xgb
import pickle
import joblib


df = pd.read_csv("diabetes_prediction_dataset.csv")


categorical_cols = ["gender", "smoking_history"]
label_encoders = {}

for col in categorical_cols:
    le = LabelEncoder()
    df[col] = le.fit_transform(df[col].astype(str))
    label_encoders[col] = le  # save each encoder separately

# =========================
# Split dataset
# =========================
X = df.drop("diabetes", axis=1)
y = df["diabetes"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42
)

# =========================
# Train RandomForest
# =========================
rf_model = RandomForestClassifier(
    n_estimators=200, random_state=42, class_weight="balanced"
)
rf_model.fit(X_train, y_train)
rf_preds = rf_model.predict(X_test)

rf_metrics = {
    "Accuracy": accuracy_score(y_test, rf_preds),
    "Precision": precision_score(y_test, rf_preds),
    "Recall": recall_score(y_test, rf_preds),
    "F1-Score": f1_score(y_test, rf_preds),
    "ROC-AUC": roc_auc_score(y_test, rf_preds),
}

print("\n=== Random Forest Results ===")
print(rf_metrics)
print(classification_report(y_test, rf_preds))


xgb_model = xgb.XGBClassifier(
    n_estimators=300,
    learning_rate=0.1,
    max_depth=6,
    subsample=0.8,
    colsample_bytree=0.8,
    random_state=42,
    scale_pos_weight=(y.value_counts()[0] / y.value_counts()[1])
)
xgb_model.fit(X_train, y_train)
xgb_preds = xgb_model.predict(X_test)

xgb_metrics = {
    "Accuracy": accuracy_score(y_test, xgb_preds),
    "Precision": precision_score(y_test, xgb_preds),
    "Recall": recall_score(y_test, xgb_preds),
    "F1-Score": f1_score(y_test, xgb_preds),
    "ROC-AUC": roc_auc_score(y_test, xgb_preds),
}

print("\n=== XGBoost Results ===")
print(xgb_metrics)
print(classification_report(y_test, xgb_preds))

# =========================
# Pick best model
# =========================
best_model = xgb_model if xgb_metrics["Recall"] >= rf_metrics["Recall"] else rf_model
best_name = "XGBoost" if best_model == xgb_model else "RandomForest"

# =========================
# Save model + encoders
# =========================
joblib.dump(best_model, "diabetes_model.pkl")
joblib.dump(label_encoders, "label_encoders.pkl")

print(f"\n✅ Best model ({best_name}) saved as diabetes_model.pkl")
print("✅ Label encoders saved as label_encoders.pkl")
