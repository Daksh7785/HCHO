# HCHO Operational & Scientific Principles

This document defines the core scientific, architectural, and engineering guidelines for the **HCHO (Formaldehyde) Air Quality Monitoring Platform**. Every design, code addition, and model deployment must comply with these rules to ensure the platform is scientifically sound, cost-effective, and usable by national and state environmental agencies in India.

---

## 1. Core Evaluation Framework (10 Rules)

Before implementing any feature, backend service, or frontend view, the engineering and science teams must answer:
1. **Is this scientifically correct?** Does it accurately represent satellite physics (TROPOMI HCHO column densities) and atmospheric transport?
2. **Is this practically deployable?** Can it run on standard cloud servers or local government hardware without complex dependencies?
3. **Is this economically feasible?** What are the data transfer, computing, and API costs?
4. **Is this scalable?** Can it process burning season data (e.g. Punjab/Haryana stubble burning in Oct-Nov) without bottlenecks?
5. **Is this maintainable?** Will a developer who joins the project in two years understand and modify this code easily?
6. **Is this explainable?** Can we explain why a specific grid shows an HCHO hotspot to a non-technical state representative?
7. **Can government agencies realistically use it?** Does the UI load quickly on office networks and present clear, actionable insights?
8. **Does it solve the actual problem?** Does it improve surface AQI estimation and hotspot tracking?
9. **Is there a simpler alternative?** Can we use a basic spatial interpolation instead of a heavy convolutional model if the accuracy difference is marginal?
10. **Does the benefit justify the cost?**

---

## 2. Scientific & Remote Sensing Principles

To maintain scientific integrity and prevent hallucinations:
- **Satellite Calibration**: Raw Sentinel-5P TROPOMI L2_HCHO columns must be checked for quality flags (`qa_value > 0.5`) to eliminate cloud cover noise.
- **Ground Truth Reference**: Central Pollution Control Board (CPCB) data must be treated as the ground truth. Any interpolated surface values must align with active station reports.
- **Explainability**: Every derived Surface AQI grid must output a **confidence interval** or standard deviation layer representing spatial uncertainty.
- **Atmospheric Reasoning**: Models must integrate wind vector variables (U/V components from ERA5) to represent downwind plume dispersion rather than treating formaldehyde concentrations as static.

---

## 3. Cost-Aware & Practical Infrastructure

All services are designed to minimize operating costs:
- **Compute Optimization**: Standardize on PyTorch CPU models for local dev and inference. Only use GPU instances for training deep architectures.
- **Geospatial Processing**: Avoid full-grid raster re-computation where vector contours or bounding polygon extraction suffices.
- **Storage Management**: Archive historical NetCDF satellite tiles to cold storage, keeping only processed spatial averages, hotspot vectors, and daily statistics in the database.
- **Caching**: Frequently queried regional trends are cached in Redis to minimize database read overhead.

---

## 4. Real-World Deployment Specs (Government & Public Use)

- Centralized dashboard designed to load quickly even over low-bandwidth networks.
- Clean PDF alert reporting format for sharing with local district administrations during stubble burning events.
- Direct spatial exports available in **Shapefile (SHP)**, **GeoJSON**, and **GeoTIFF** formats for easy loading in government GIS software (e.g., QGIS, ArcGIS).
