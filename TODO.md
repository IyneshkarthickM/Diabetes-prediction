# TODO List for Diabetes Prediction App Implementation

## Backend Modifications
- [x] Modify app.py to return risk level (low/medium/high) based on probability
- [x] Update prediction endpoints to include risk categorization

## Frontend Updates
- [x] Update PatientDashboard.js to call prediction API after saving metrics
- [x] Update floating risk button to display actual risk level
- [x] Add notification creation for medium/high risk to Firestore
- [x] Enhance DoctorDashboard.js to display notifications and highlight high-risk patients

## Testing and Validation
- [ ] Test prediction accuracy and adjust thresholds if needed
- [ ] Ensure API calls are secure and handle errors
- [ ] Verify notifications are sent and received correctly
