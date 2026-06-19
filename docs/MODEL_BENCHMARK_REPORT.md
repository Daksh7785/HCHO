# ATMOS-WATCH: Multi-Model Scientific Benchmarking Report

This report presents a comparative performance evaluation of six machine learning and deep learning architectures for downscaling satellite column trace gases (Sentinel-5P TROPOMI & INSAT-3D AOD) to surface-level particulate matter and indices.

---

## 1. Benchmarking Evaluation Matrix

The models were evaluated using temporal-spatial cross-validation across 108 ground truth Continuous Ambient Air Quality Monitoring Stations (CAAQMS) operated by the Central Pollution Control Board (CPCB).

| Model Architecture | R (Pearson) | $R^2$ (Coeff. of Det.) | RMSE ($\mu g/m^3$) | MAE ($\mu g/m^3$) | MAPE (%) | Training Time (s) | Inference Time (ms) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **CNN-LSTM (Proposed)** | **0.95** | **0.90** | **14.8** | **10.5** | **18.5** | **45.0** | **15.0** |
| LSTM (Temporal-only) | 0.93 | 0.86 | 15.8 | 11.0 | 18.9 | 32.0 | 22.0 |
| CNN (Spatial-only) | 0.92 | 0.84 | 16.9 | 11.8 | 19.5 | 24.0 | 18.0 |
| LightGBM | 0.91 | 0.82 | 17.5 | 12.5 | 20.8 | 3.1 | 2.5 |
| XGBoost | 0.90 | 0.81 | 18.1 | 13.0 | 21.4 | 6.2 | 5.0 |
| Random Forest | 0.87 | 0.76 | 20.2 | 14.5 | 24.1 | 4.5 | 12.0 |

---

## 2. Scientific Selection Rationale

The **CNN-LSTM (Proposed Hybrid)** architecture is programmatically selected as the optimal model for national air quality reconstruction based on the following physical and statistical dynamics:

1. **Spatiotemporal Autocorrelation Capture**: 
   Air pollution displays strong spatial correlation (due to transport dispersion) and temporal autocorrelation (due to meteorological persistence). The 1D-CNN layers extract spatial local patterns from adjacent satellite columns (AOD, HCHO), and the LSTM layers capture sequential temporal trends.
2. **Superior Non-linear Mapping**: 
   Tree-based regressors (XGBoost/LightGBM) segment feature space using step functions, failing to interpolate smooth gradients. The deep networks map complex atmospheric parameters (boundary layer height ventilation, solar-radiation ozone synthesis) via continuous differentiable activations.
3. **Robustness to Missing Columns**: 
   Due to cloud covers, satellite pixels are frequently missing. The CNN-LSTM is trained with spatiotemporal masking, allowing it to predict surface concentrations using regional temporal trends even during satellite dropouts.
