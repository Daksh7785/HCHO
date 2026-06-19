# HCHO Dependency Report

This report catalogs all language runtimes, command-line utilities, system packages, and library dependencies required for the **HCHO Air Quality Monitoring Platform**.

---

## 1. Discovered System Environment

The host environment runs **Windows** and has the following core toolchains pre-installed:

| Tool | Status | Version |
| :--- | :--- | :--- |
| **Git** | Installed | `2.53.0.windows.3` |
| **Node.js** | Installed | `24.15.0` |
| **npm** | Installed | `11.12.1` |
| **Python** | Installed | `3.14.4` |
| **pip** | Installed | `26.0.1` |
| **pnpm** | Missing | Not found in PATH |
| **Yarn** | Missing | Not found in PATH |
| **uv** | Missing | Not found in PATH |
| **Docker / Compose**| Missing | Not found in PATH (Requires Docker Desktop) |
| **GDAL CLI** | Missing | Not found in PATH (Python's `rasterio` contains internal version `3.12.1`) |

---

## 2. Python Packages Scan

The Python environment has a rich set of libraries pre-installed. The following tables categorize these packages:

### AI, ML & Scientific Computing
- **PyTorch**: `2.12.0` (CPU version)
- **Torchvision**: `0.27.0`
- **Scikit-Learn**: `1.9.0`
- **XGBoost**: `3.2.0`
- **NumPy**: `2.4.6`
- **Pandas**: `3.0.3`
- **SciPy**: `1.17.1`
- **SymPy**: `1.14.0`
- **Matplotlib**: `3.11.0`
- **Plotly**: `6.8.0`

### Earth Observation & GIS
- **Rasterio**: `1.5.0` (Includes GDAL `3.12.1` bindings)
- **GeoPandas**: `1.1.3`
- **Shapely**: `2.1.2`
- **PyProj**: `3.7.2`
- **Pyogrio**: `0.12.1`

### Backend, Database & Task Queue
- **FastAPI**: `0.136.3`
- **Uvicorn**: `0.48.0`
- **SQLAlchemy**: `2.0.51`
- **Celery**: `5.6.3`
- **Redis (Client)**: `8.0.0`
- **Supabase (Client)**: `2.22.4`
- **Pydantic**: `2.13.4`
- **Pydantic Settings**: `2.14.1`

### Quality Assurance & Linting
- **MyPy**: `2.1.0`
- **PyTest**: `9.0.3`
- **Bandit**: `1.9.4`

---

## 3. Missing Dependencies & Action Plan

To support the full scope of the platform, the following components must be installed/configured:

### Python Packages (Missing)
- **Earth Observation**: `xarray`, `rioxarray`, `earthpy`, `sentinelhub`, `google-earth-engine-api`, `pystac`, `pystac-client`, `planetary-computer`.
- **AI/ML**: `tensorflow`, `diffusers`, `accelerate`, `lightgbm`, `jupyter`, `wandb`, `mlflow`, `dvc`.
- **Command-line Package Manager**: `uv` (will be used to isolate local dependencies).

### Node.js Packages (Missing)
- **Frontend Core**: `react`, `react-dom`, `next`, `typescript`, `@types/react`, `@types/react-dom`.
- **Styling**: `postcss`, `autoprefixer`.
- **Mapping & Charts**: `leaflet`, `react-leaflet`, `@types/leaflet`, `recharts`, `framer-motion`.
- **Linting & Code Quality**: `eslint`, `prettier`, `husky`, `lint-staged`, `commitlint`.

### External Services (Missing)
- **PostgreSQL 16 + PostGIS**: Required for storing spatial attributes.
- **Redis**: Required for Celery brokerage and caching.
- **Qdrant**: Vector database for hotspot proximity indexing.
