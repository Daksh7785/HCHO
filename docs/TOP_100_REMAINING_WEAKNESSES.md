# ATMOS-WATCH: Top 100 Scientific & Operational Weaknesses Audit

This document presents a rigorous self-audit of **ATMOS-WATCH**, cataloging 100 remaining technical, scientific, operational, and policy weaknesses. It serves as a roadmap for future research and deployment iterations.

---

## 1. Data Ingestion & Satellite Calibration Gaps (G1 - G20)

1. **G1: Cloud Masking Occlusions**: Persistent monsoon cloud cover completely blocks Sentinel-5P TROPOMI UV/VIS measurements for weeks, causing prolonged data gaps.
2. **G2: INSAT-3D AOD Bright Surface Bias**: AOD retrievals exhibit significant positive biases over reflective arid regions like Rajasthan.
3. **G3: Static Tropopause Height Corrections**: Relies on static meteorological approximations for vertical column conversions, ignoring seasonal variation.
4. **G4: Sentinel-5P Row Anomaly Neglect**: TROPOMI row anomalies are not dynamically flagged, potentially introducing striping artifacts.
5. **G5: Fixed Aerosol Single Scattering Albedo (SSA)**: Generalizes SSA over India, disregarding varying carbon levels.
6. **G6: Lack of Direct Stratospheric Ozone Subtraction**: Column O3 calculations fail to subtract stratospheric components dynamically.
7. **G7: INSAT-3D Calibration Drift**: Lacks automatic drift correction for solar channels over long-term temporal series.
8. **G8: HCHO Temperature Dependence**: HCHO photolysis rates are not corrected for ambient air temperature gradients.
9. **G9: Fixed Quality Assurance Value (qa_value) Cutoffs**: Static 0.5 qa_value threshold discards salvageable data in marginal cloud conditions.
10. **G10: Absence of GCOM-C SGLI Integration**: Misses high-resolution (250m) polar-orbiting AOD inputs.
11. **G11: Static Humidity Correction in AOD-PM2.5**: Relies on linear approximations for relative humidity hygroscopic growth.
12. **G12: Spatial Grid Edge Artifacts**: IDW spatial interpolation shows edge boundary discontinuities.
13. **G13: Lack of Dynamic Cloud Fraction Weighting**: Does not weight satellite columns by cloud fractions.
14. **G14: Missing INSAT-3D Thermal Anomalies**: Does not ingest INSAT-3D fires to supplement MODIS.
15. **G15: Planetary Boundary Layer Height (PBLH) Temporal Lag**: Uses daily average PBLH, ignoring hourly diurnal mixing heights.
16. **G16: Solar Zenith Angle Correction**: Column densities are uncorrected for extreme solar angles during solstice months.
17. **G17: Absence of NO2 Glyoxal Ratios**: VOC reactivity assessment lacks Glyoxal/HCHO ratios.
18. **G18: Fixed Surface Albedo Climatology**: Ignores real-time surface changes due to soil moisture or vegetation harvesting.
19. **G19: Non-ingestion of Sentinel-5P CO Quality Flags**: CO column inputs are not filtered for solar glint anomalies.
20. **G20: Neglect of Spatial Reprojection Errors**: Spatial resampling from curvilinear TROPOMI coordinates to WGS84 causes minor geographic distortions.

---

## 2. Physical Dispersion & Transport Modeling Gaps (G21 - G40)

21. **G21: Two-Dimensional Wind Vector Simplification**: Uses u/v components at a single vertical pressure level (850 hPa), ignoring 3D wind shears.
22. **G22: Absence of Lagrange Plume Dispersion**: Lacks physical particle trajectory simulations (e.g. HYSPLIT integration).
23. **G23: Neglect of Wet Deposition Scavenging**: Wet deposition is simplified, underestimating washout during monsoons.
24. **G24: Zero Deposition Velocity for Gaseous HCHO**: Ignores dry deposition of VOCs to soil and forest canopies.
25. **G25: Fixed Plume Rise Heights**: Assumes standard biomass injection heights, ignoring fire radiative power (FRP) dynamics.
26. **G26: Topographic Barrier Neglect**: IGW dispersion models do not incorporate the physical blocking effects of the Western Ghats or Himalayas.
27. **G27: Single Lag Day Wind Advection**: Plume calculations assume wind vector persistency over only 24 hours.
28. **G28: Absence of Chemical Loss Coefficients**: Column HCHO lacks photochemical oxidation degradation rates.
29. **G29: Neglect of Secondary Organic Aerosol (SOA) Production**: Fails to model the chemical conversion of HCHO to secondary particulates.
30. **G30: Homogeneous Surface Roughness**: Assumes constant land friction, ignoring urban canopy resistance.
31. **G31: Absence of Eddy Diffusion Coefficients**: Turbulent mixing parameters are excluded from dispersion trails.
32. **G32: Static Planetary Boundary Layer (PBL) Entrainment**: Assumes zero vertical exchange at the boundary layer top.
33. **G33: Neglect of Mountain-Valley Breezes**: Ignores local diurnal wind patterns in hilly states.
34. **G34: Zero Chemical Interaction with NO2**: Wind transport calculates gases independently without modeling ozone titration.
35. **G35: Static Plume Width Expansion**: Transport plumes are represented as straight vectors rather than dispersing cones.
36. **G36: Absence of Vertical Velocity (w_wind) Ingestion**: Ignores vertical drafts which scatter particles.
37. **G37: Fixed Receptor Sampling Buffer**: Receptor impacted zones use a static radius search.
38. **G38: Neglect of Urban Heat Island (UHI) Effects**: Local temperature variances in urban centers are ignored.
39. **G39: Lack of Real-Time ERA5 Wind Access**: API queries rely on daily averages rather than real-time hourly vectors.
40. **G40: Boundary Reflection Neglect**: Dispersion models assume infinite boundaries, ignoring plume reflections off inversion layers.

---

## 3. Deep Learning & Uncertainty Quantification Gaps (G41 - G60)

41. **G41: Fixed Dropout Rates for Bayesian MC**: Dropout rate is statically set to 0.1, underestimating epistemic uncertainty.
42. **G42: Lack of Aleatoric Uncertainty Output**: Network only models weight uncertainty, neglecting input sensor noise.
43. **G43: Linear Convolution Architectures**: CNN-LSTM uses simple 1D filters, ignoring complex 2D spatial relationships.
44. **G44: Vanishing Gradient Risk in Long Lags**: LSTMs struggle with temporal dependencies beyond 14 days without attention mechanisms.
45. **G45: Fixed Spatial Resolution Downscaling**: Limits grid cells to a rigid 10km scale.
46. **G46: Lack of Multi-task Loss Balancing**: Loss weights for individual pollutants are manually tuned.
47. **G47: Deterministic Output Projections**: Outputs are point estimates with standard deviation, rather than full probabilistic distributions.
48. **G48: Neglect of Covariance between Pollutants**: CNN-LSTM predicts pollutants independently, ignoring cross-pollutant correlations.
49. **G49: Absence of Physics-Informed Loss Constraints**: Models can predict physically impossible pollutant concentrations.
50. **G50: Batch Normalization Artifacts**: Batch normalization layers introduce noise when testing small samples.
51. **G51: Overfitting to the Indo-Gangetic Plain**: Training dataset is dominated by Northern India samples.
52. **G52: Hyperparameter Tuning Constraints**: Network parameters were tuned manually rather than using automated searches.
53. **G53: Ignored Coordinate Embeddings**: Latitude and longitude coordinates are not directly encoded into neural layers.
54. **G54: Fixed Temporal Window Lags**: Rigidly sets temporal inputs to 3 lag days.
55. **G55: Absence of Transformer Architectures**: Does not utilize spatial-temporal transformers.
56. **G56: Standard Deviation Bias in Small MC Runs**: Runs only 10 MC dropout passes, yielding unstable uncertainty bounds.
57. **G57: Lack of Dynamic Early Stopping**: Model trains for fixed epochs, risking overfitting.
58. **G58: Deterministic Input Masking**: Missing grid cells are imputed with static defaults instead of probabilistic estimations.
59. **G59: Absence of Adversarial Robustness Auditing**: Networks are vulnerable to corrupted input sensor signals.
60. **G60: Fixed Learning Rate Decay**: Uses static step decay rather than cosine annealing schedules.

---

## 4. Ground Truth & Validation Constraints (G61 - G80)

61. **G61: CAAQMS Station Density Disparity**: 80% of stations are in metropolitan areas, leaving rural India unrepresented.
62. **G62: Ground Sensor Calibration Drift**: CPCB stations exhibit drift and maintenance dropouts.
63. **G63: PM10 Ingestion Deficits**: Ground stations lack consistent PM10 measurements, preventing complete validation.
64. **G64: Point-to-Pixel Representation Error**: Validating a 10km grid cell against a point-source ground monitor introduces bias.
65. **G65: Lack of Ozonesonde Vertical Verification**: Ozone models lack vertical verification.
66. **G66: Station Relocation Neglect**: Does not account for historical station movements.
67. **G67: Bias toward Urban Centroids**: Stations are located near roads, biasing validation toward vehicular sources.
68. **G68: Microscale Local Obstructions**: Validation fails to filter stations situated near trees or buildings.
69. **G69: Absence of Aircraft Validation campaigns**: Lacks vertical column verification from airborne campaigns.
70. **G70: Station Data Ingestion Delays**: Real-time validation is blocked by CPCB portal transmission lags.
71. **G71: Neglect of Instrument Differences**: Treats all ground sensors equally, ignoring calibration variances.
72. **G72: Zero Validation under Dense Smog**: Ground sensors saturate during extreme smog, returning invalid data.
73. **G73: Spatial Autocorrelation Validation Leakage**: Standard validation splits ignore spatial correlations, inflating metrics.
74. **G74: Temporal Autocorrelation Validation Leakage**: Splitting training data randomly causes temporal leakage.
75. **G75: Absence of Cross-Instrument Satellite Validation**: Fails to validate INSAT-3D AOD against MODIS or VIIRS.
76. **G76: Ignored Local Humidity Sensor Bias**: Ground-level RH sensors are uncorrected for local heating.
77. **G77: Lack of Rural Lidar Profiles**: Boundary layer heights are unvalidated in agricultural zones.
78. **G78: Zero Soil Moisture Correction**: Fails to validate dust emissions against soil moisture networks.
79. **G79: Validation Excludes HCHO Ground Truth**: Lacks ground FTIR instruments to validate columnar HCHO.
80. **G80: Neglect of Daytime Inversion Profiles**: Does not validate morning vs evening boundary layer variations.

---

## 5. Policy Enforcement & Command Center Integration Gaps (G81 - G100)

81. **G81: Low-Fidelity Population Density Models**: Population density maps are static decadal estimates.
82. **G82: District Boundary Coarseness**: Policy recommendations use administrative boundaries rather than environmental zones.
83. **G83: Generalization of Policy Directives**: Mitigation rules are generic instead of locally optimized.
84. **G84: Lack of Agricultural Crop Calendars**: Does not align biomass alerts with local harvesting seasons.
85. **G85: Absence of Economic Damage Cost Modeling**: Alerts are purely health-based, ignoring financial impacts on agriculture.
86. **G86: Generalization of Industrial Fuel Mix**: Assumes uniform fuel profiles across districts.
87. **G87: Static Health Exposure Dose Curves**: Exposure assessments assume uniform linear health impacts.
88. **G88: Lack of Real-Time Mobile Warning APIs**: Command center lacks SMS/WhatsApp alert dispatch gateways.
89. **G89: Static Power Plant Emissions Baselines**: Assumes constant industrial emissions profiles.
90. **G90: Absence of Transboundary Ingestion**: Fails to ingest biomass burning sources from Pakistan or Bangladesh.
91. **G91: Zero Integration with Local Hospital Admissions**: Command center does not correlate high AQI with hospital capacity.
92. **G92: Vehicular Emission Inventory Staler than 5 Years**: Relies on outdated vehicular emission databases.
93. **G93: Neglect of Indoor Pollution Exposure**: Assumes ambient outdoor exposure equals total personal exposure.
94. **G94: Fails to Segment Exposed Age Demographics**: Exposure metrics do not isolate high-risk pediatric or geriatric cohorts.
95. **G95: Absence of Wind Farm Wake Effects**: Ignores local wind modifications from coastal turbine installations.
96. **G96: Static Water Misting Efficiency Metrics**: Command center recommends misting without real-time efficiency feedback.
97. **G97: Inability to Audit Enforcement Compliance**: Lacks mechanisms to verify if local GRAP directives are implemented.
98. **G98: Lack of Multi-Lingual Advisory Generation**: Advisory briefings are only generated in English.
99: **G99: Neglect of Small-Scale Brick Kilns**: Small kilns escape monitoring due to spatial grid limitations.
100. **G100: Absence of Feedback Loops for Stubble Incentives**: Policy briefs fail to audit the efficacy of bank transfers on fire counts.
