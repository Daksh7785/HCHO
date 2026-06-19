# HCHO Bootstrap Plan

This document details the Project Analysis, Technology Stack, and Platform Requirements for the **HCHO (Formaldehyde) Air Quality Monitoring Platform**.

---

## 1. Project Type & Scope

The HCHO platform is a **Spatial AI & Deep Learning Platform** designed to:
- Derive Surface Air Quality Index (AQI) from satellite observations (e.g. Sentinel-5P TROPOMI).
- Detect Formaldehyde (HCHO) hotspots during biomass burning events across India.
- Integrate satellite products, meteorological datasets (ERA5/GFS), and ground monitoring station data (CPCB).
- Deploy deep learning models (e.g. U-Net, Spatial-Temporal ConvLSTMs) for real-time pollution mapping and predictive intelligence.

---

## 2. Technology Stack

### Core & Frontend Toolchain
- **Framework**: React / Next.js (TypeScript)
- **Styling**: Modern Vanilla CSS for clean styling.
- **Geospatial Mapping**: Leaflet or Mapbox GL JS for interactive raster/vector overlays.
- **Data Visualization**: Recharts / Chart.js for pollution trend graphs and timeseries charts.
- **State Management**: Zustand / React Query for efficient client-side data state.

### Backend Toolchain
- **Framework**: FastAPI (Python 3.14) for high-performance asynchronous API endpoints.
- **Task Queue**: Celery with Redis for asynchronous downloading and ingestion of satellite files.
- **Database ORM**: SQLAlchemy 2.0 / asyncpg for asynchronous database operations.
- **Data Validation**: Pydantic v2.

### Databases
- **Relational & Spatial Database**: PostgreSQL 16+ with PostGIS extension for storing station points, hotspot boundaries, and raster telemetry.
- **Cache & Message Broker**: Redis 7.
- **Vector Database**: Qdrant for semantic and spatial-vector indexing of pollution events and hotspot embeddings.

---

## 3. Toolchain & Environment Requirements

### AI & ML Requirements
- **Frameworks**: PyTorch (CPU-mode for development, CUDA-enabled for production training/inference), XGBoost.
- **Utilities**: Scikit-Learn (preprocessing), OpenCV (image processing of raster tiles), Albumentations (data augmentation).
- **Observability**: Weights & Biases or MLflow for model training telemetry.

### Earth Observation (GIS) Requirements
- **Core Libraries**: Rasterio (reading geotiffs/rasters), Shapely (geometry manipulation), PyProj (coordinate transformations), GeoPandas (vector GIS dataframes), Xarray (handling multi-dimensional NetCDF satellite datasets).
- **APIs & SDKs**: Sentinel Hub SDK, Google Earth Engine Python SDK, Planetary Computer SDK.

### Infrastructure & DevOps Requirements
- **Containerization**: Docker, Docker Compose for local service isolation.
- **Orchestration**: Kubernetes with Helm charts for scaling API and worker nodes.
- **Infrastructure as Code (IaC)**: Terraform for GCP/AWS cloud resource provisioning.
- **CI/CD**: GitHub Actions for automated linting, testing, and deployment.
- **Observability**: Prometheus & Grafana for service metrics, Loki for log aggregation, Sentry for exception tracking.

---

## 4. Security Requirements
- **Secrets Management**: Environment variables managed via local `.env` files (ignored in Git) and integrated with Google Cloud Secret Manager / HashiCorp Vault in production.
- **Code Quality & Static Analysis**: Automated code scanning using Ruff, Bandit, and ESLint.
- **Authentication**: Stateless JSON Web Token (JWT) credentials for securing API routes and dashboard views.
