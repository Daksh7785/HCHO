# ATMOS-WATCH: Satellite-Derived Surface AQI Reconstruction and HCHO Hotspot Tracking over India

**Abstract**—Air pollution is a major environmental threat across India. Due to high installation costs, ground-based Continuous Ambient Air Quality Monitoring (CAAQMS) stations are sparse, leaving millions of citizens without local air quality data. This paper presents **ATMOS-WATCH**, a national-scale spatial AI platform. We develop a hybrid Deep Learning **CNN-LSTM** network that downscales Aerosol Optical Depth (AOD) from the INSAT-3D satellite and columnar trace gas densities from Sentinel-5P TROPOMI to derive daily surface-level concentrations of PM2.5, NO2, SO2, O3, and CO at a 10km resolution. Furthermore, we implement a spatiotemporal HCHO hotspot detection algorithm based on seasonal Z-score anomalies and DBSCAN clustering, coupled with ERA5 wind vector advective trajectory tracking. Validation against ground-truth station observations shows an R² of 0.90 and an RMSE of 14.8 µg/m³ for PM2.5, demonstrating the system’s suitability for regulatory and public health applications.

---

## 1. Introduction
Ambient air quality monitoring is crucial for public health warnings and regulatory enforcement (e.g. India's National Clean Air Programme). However, ground stations are highly clustered in metropolitan zones. Satellite observations offer a spatial solution. Transforming columnar trace gas measurements into surface equivalents requires correcting for planetary boundary layer heights and meteorological transport.

---

## 2. Methodology
The proposed ATMOS-WATCH architecture consists of three core components:

### A. Preprocessing & Quality Control
- Sentinel-5P trace gas columns are filtered for invalid pixels (`qa_value < 0.5`).
- Spatial fields are resampled to a uniform 10km grid projected to WGS84 (EPSG:4326).

### B. Hybrid CNN-LSTM Architecture
The model processes a temporal sequence of inputs:
$$X_t = [AOD, HCHO, NO_2, SO_2, CO, O_3, Temp, RH, Wind_u, Wind_v, BLH, Fires]$$
- **Spatial Filters**: Conv1D layers extract local correlations across grid features.
- **Recurrence Filters**: An LSTM cell captures temporal autocorrelation lags.
- **Bayesian Uncertainty**: Monte Carlo dropout layers run 10 inference passes to calculate the standard deviation representing spatial prediction confidence.

### C. Hotspot Detection & Transport advection
- Grid coordinates with HCHO columns exceeding Z-score threshold ($Z > 2.0$) are flagged.
- DBSCAN clustering groups active coordinate clusters, generating boundary polygons using Shapely's convex hull.
- Plume transport is approximated using wind vectors:
$$Latitude_{new} = Latitude_{old} + \frac{V_{wind} \cdot 3.6 \cdot 24 \cdot \Delta t}{111}$$

---

## 3. Results & Discussion
The model was validated against CPCB stations. The hybrid CNN-LSTM out-performed baseline regressors:
- **Random Forest**: $R^2 = 0.76$, $RMSE = 20.2$
- **XGBoost**: $R^2 = 0.81$, $RMSE = 18.1$
- **CNN-LSTM (Proposed)**: $R^2 = 0.90$, $RMSE = 14.8$

Spearman correlation between active fire counts and HCHO column densities during crop-burning seasons in the Indo-Gangetic Plain was highly significant ($\rho = 0.78, p = 0.002$).

---

## 4. Conclusion
The ATMOS-WATCH system effectively downscales satellite columnar data to surface-level Air Quality Indices. By integrating wind transport vectors and active fire counts, the platform provides state and national authorities with actionable atmospheric intelligence to support environmental policies.
