# ATMOS-WATCH Top Remaining Weaknesses & Gaps

This document presents a self-audit of remaining scientific, operational, and deployment gaps, along with mitigation paths.

---

## 1. Scientific & Modeling Gaps

1. **Short-Term Diurnal Fluctuations**: Satellite overpasses occur once daily (approx. 13:30). The CNN-LSTM model cannot capture morning/evening traffic spikes.
   - *Mitigation*: Integrate geostationary satellite sensor data (such as INSAT-3D hourly products) as model inputs.
2. **Simplified Plume Dispersion**: Wind transport uses basic 2D horizontal advection, ignoring vertical wind shear and atmospheric turbulence.
   - *Mitigation*: Integrate a full 3D Lagrangian particle dispersion model (e.g. FLEXPART) in the long-term roadmap.
3. **Imbalanced Extreme Values**: The training set has fewer extreme pollution values (AQI > 400), leading to underpredictions during severe winter days.
   - *Mitigation*: Apply synthetic data augmentation (SMOTE for regression) or weight-adjust loss functions during model training.

---

## 2. Operational & Database Gaps

4. **TimescaleDB Compression Limits**: Storing daily high-resolution 1km grids India-wide grows database sizes quickly before compression triggers.
   - *Mitigation*: Configure partitioning and compression policies to execute every 12 hours.
5. **Cold Start Inference Latency**: Initial prediction batch execution on CPU is slow (approx. 3-4 seconds) due to PyTorch model initialization.
   - *Mitigation*: Implement model warm-up sequences inside FastAPI’s lifespan hooks.

---

## 3. Data Integration Gaps

6. **Ground Station Local Calibration**: CPCB station points suffer from micro-climatic urban biases (e.g., station placed near a road intersection).
   - *Mitigation*: Apply spatial buffering to exclude station points located within 50 meters of major highways.
7. **Cloud Occlusion Imputations**: Prolonged monsoon cloud coverage reduces input data quality.
   - *Mitigation*: Train a secondary model utilizing meteorological inputs exclusively during heavy rain weeks.
