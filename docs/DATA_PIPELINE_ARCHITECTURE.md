# ATMOS-WATCH Data Ingestion & Pipeline Architecture

This document describes the design of the automated ingestion, preprocessing, and feature engineering pipelines for the ATMOS-WATCH platform.

---

## 1. Pipeline Flow Overview

```
[Satellite Observations]        [Ground Telemetry]         [Meteorological Fields]
 - INSAT-3D AOD                  - CPCB Station Readings    - ERA5 Boundary Layer Ht
 - TROPOMI HCHO/NO2/SO2/O3/CO                               - ERA5 Temp, RH, Winds
           │                            │                            │
           ▼                            ▼                            ▼
[QA Filtering & Cloud Mask]     [Station Geocoding]         [Spatial Resampling]
 - Filter qa_value < 0.5         - PostGIS POINT format      - Bilinear grid interpolation
           │                            │                            │
           └───────────────────────────┬┴────────────────────────────┘
                                       ▼
                            [Daily Spatial Alignment]
                             - EPSG:4326 Grid Layout
                             - 10km x 10km grid cells
                                       │
                                       ▼
                           [Feature Vector Compilation]
                            - 12 Channel spatial array
                                       │
                                       ▼
                          [PyTorch Model Inference]
```

---

## 2. Ingestion & Quality Control (QC) Rules

### A. Satellite Products Quality Filtering
- **Sentinel-5P (TROPOMI)**: Column densities for HCHO, $NO_2$, $SO_2$, $CO$, and $O_3$ are filtered using their respective quality variables. Data points with `qa_value < 0.5` (indicating severe cloud contamination, snow, or sensor anomalies) are masked and excluded from downstream spatial aggregations.
- **INSAT-3D (AOD)**: Optical depth grids are masked for cloud cover using the cloud mask product. Pixels with high reflectivity are dropped to prevent ground-albedo errors.

### B. Spatial Resampling & Grid Projection
- **Grid Layout**: India is mapped onto a uniform grid with a spatial resolution of **10km x 10km** (approximately 0.1° x 0.1°).
- **Coordinate Reference System (CRS)**: All layers are reprojected and aligned to **WGS 84 (EPSG:4326)**.
- **Alignment Method**:
  - Continuous meteorological parameters (temp, RH, winds) are resampled using **Bilinear Interpolation**.
  - Discontinuous values (such as VIIRS active fire counts) are aggregated spatially as counts within each 10km grid cell boundary.

### C. Missing Data Imputation & Fallbacks
1. **Short-Term Satellite Gaps**: If a grid cell is cloud-covered for a single day, the pipeline runs a spatial Inverse Distance Weighting (IDW) interpolation from adjacent cells.
2. **Persistent Cloud Gaps**: If cloud cover persists (e.g. during Monsoons), the pipeline falls back to **climatological averages** combined with meteorological predictor variables to estimate surface values.
3. **Data Lineage**: Every row written to the database includes a `quality_flag` ("Good", "Interpolated", "Climatology-Fallback") to preserve auditability.
