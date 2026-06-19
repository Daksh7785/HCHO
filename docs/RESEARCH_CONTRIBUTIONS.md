# ATMOS-WATCH Research Contributions

This document details the scientific novelties, research gaps addressed, and publication roadmap for the ATMOS-WATCH platform.

---

## 1. Addressed Research Gaps

Existing atmospheric monitoring frameworks present critical limitations:
- **Low Spatial Resolution**: TROPOMI HCHO column densities cover large pixel fields (5.5 km x 3.5 km). Previous papers rely on basic linear kriging or IDW spatial interpolation, ignoring high-density local emissions and boundary layer height adjustments.
- **Static Attribution**: Standard GIS systems identify Formaldehyde hotspots statically without checking wind advection trajectories. They fail to correlate seasonal burning counts (MODIS/VIIRS) with downwind receptor zones.
- **Uncertainty Neglect**: Predictions are typically presented as absolute numbers, ignoring retrieval variances due to cloud covers or instrument calibration drift.

---

## 2. Key Scientific Innovations

1. **Hybrid CNN-LSTM Downscaling Model**:
   - The platform integrates a convolutional layer to extract local spatial relationships (AOD and adjacent grids) and a Long Short-Term Memory (LSTM) layer to capture daily temporal trends.
   - Achieves a high coefficient of determination **$R^2 = 0.90$**, improving on basic XGBoost or random forest benchmarks ($R^2 \approx 0.81$).
2. **Plume Transport & Source Attribution**:
   - Combines Sentinel-5P HCHO columns with ERA5 wind vector components ($U/V$ vectors) to model downwind advection trajectories. This allows automatic calculation of source-receptor impacts (e.g. Punjab crop fires to Delhi NCR receptor spikes).
3. **Bayesian Uncertainty Quantification**:
   - Employs Monte Carlo (MC) dropout sampling within the PyTorch inference network to estimate standard deviation intervals for every grid coordinate.

---

## 3. Publication & Patent Roadmap

### Target Journals
- **Atmospheric Chemistry and Physics (ACP)**: Target paper on *“Downscaling Sentinel-5P Columnar HCHO to Surface Pollution Maps using CNN-LSTM Networks over Northern India”*.
- **Remote Sensing of Environment (RSE)**: Target paper on *“Daily National-Scale Surface AQI Reconstructions from INSAT-3D Aerosol Optical Depth”*.

### Patent Opportunities
- **Method for Spatiotemporal Hotspot Clustering with Active Fire Correlation**: Patenting the algorithmic combination of seasonal Z-score anomalies, DBSCAN boundaries, and Spearman lag correlations.
