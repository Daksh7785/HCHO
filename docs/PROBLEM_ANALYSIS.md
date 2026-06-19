# ATMOS-WATCH Problem Analysis

This document details the scientific analysis of the air quality monitoring gaps, regulatory challenges, and remote sensing constraints over India.

---

## 1. The Ground Monitoring Gap in India

The Central Pollution Control Board (CPCB) operates the Continuous Ambient Air Quality Monitoring Network (CAAQMS). However, it faces severe constraints:
- **Station Density**: There are only approximately 400 continuous monitoring stations across India's 3.3 million km² territory.
- **Geographic Bias**: Over 70% of these stations are concentrated in major metropolitan cities (such as Delhi NCR, Mumbai, Bengaluru).
- **Rural Exclusions**: More than **65% of India's population** lives in suburban or rural districts located more than 100 km from the nearest ground-truth station. These populations remain devoid of local, real-time air quality metrics.
- **Capital Cost**: Building, operating, and calibrating a single ground station costs upwards of ₹1.5 Crore ($180,000 USD) in initial capital, making dense nationwide coverage economically unfeasible.

---

## 2. Remote Sensing Data Gaps & Retrieval Constraints

Satellites (such as Sentinel-5P and INSAT-3D) provide national coverage, but present specific physical retrieval challenges:
- **Cloud Masking Interference**: During monsoon seasons (June-September), persistent cloud cover obscures optical observations. Sentinel-5P TROPOMI column retrievals are flagged as invalid (quality flag `qa_value < 0.5`) in cloud-heavy pixels.
- **AOD-to-Surface Downscaling**: Aerosol Optical Depth (AOD) from INSAT-3D measures the total integrated light extinction in a vertical column of air. Converting this columnar AOD into a surface-level $PM_{2.5}$ concentration requires adjusting for planetary boundary layer height (BLH), humidity, and temperature.
- **Temporal Resolution**: Sentinel-5P has a daily overpass rate (approx. 13:30 local time), which does not capture diurnal variations in emissions.

---

## 3. Atmospheric Transport & Chemical Transformations

Air pollution is not stationary:
- **Biomass Burning Transports**: Crop residue burning (stubble burning) in Punjab and Haryana during October-November releases massive columns of Volatile Organic Compounds (VOCs), indicated by Formaldehyde (HCHO) spikes.
- **Wind Drift**: Under prevailing northwesterly winds, these HCHO and particulate plumes are transported downwind across the Indo-Gangetic Plain, triggering severe pollution episodes in Delhi, Haryana, and western Uttar Pradesh.
- **Secondary Pollutants**: HCHO acts as a precursor for ground-level Ozone ($O_3$) formation via photochemical reactions with $NO_x$ under strong sunlight, adding complex non-linear chemical dynamics.

---

## 4. Policy & National Objectives Alignment

Developing a reliable satellite-derived spatial AQI grid directly aligns with:
- **National Clean Air Programme (NCAP)**: Which targets a 20-40% reduction in particulate concentrations in non-attainment cities.
- **Sustainable Development Goal (SDG) Target 11.6**: Reducing the adverse environmental impact of cities by monitoring air quality.
- **Disaster Response**: Enabling state disaster management agencies to issue health advisories downwind of active burning hotspots.
