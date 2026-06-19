# HCHO Environment Setup & Configuration

This document provides specialized guidelines for configuring and verifying system environments on Windows hosts.

---

## 1. Runtime Configurations

### Python virtualenv (Windows)
Always run python commands within an isolated virtual environment.
- **Creation**:
  ```powershell
  python -m venv .venv
  ```
- **Activation** (PowerShell execution policy bypass if needed):
  ```powershell
  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
  .venv\Scripts\Activate.ps1
  ```
- **Pip Check**:
  Verify you are running pip inside the virtual environment:
  ```powershell
  Get-Command pip
  # Should point to: ...\HCHO\.venv\Scripts\pip.exe
  ```

---

## 2. Docker Containers & Port Bindings

Our services bind to standard ports. Make sure there are no local conflicts:

| Service | Container Name | Port | Shared Volume |
| :--- | :--- | :--- | :--- |
| **PostgreSQL 16** | `hcho-postgres` | `5432` | `postgres_data` |
| **Redis** | `hcho-redis` | `6379` | `redis_data` |
| **Qdrant** | `hcho-qdrant` | `6333` / `6334` | `qdrant_data` |
| **Prometheus** | `hcho-prometheus` | `9090` | `prometheus_data` |
| **Grafana** | `hcho-grafana` | `3000` | `grafana_data` |

### Windows Local Firewall & Port Verification
If port conflicts occur, check which processes are occupying the ports:
```powershell
Get-NetTCPConnection -LocalPort 5432 -ErrorAction SilentlyContinue
Get-NetTCPConnection -LocalPort 6379 -ErrorAction SilentlyContinue
```

---

## 3. Earth Observation (GIS) Local Settings

Because Windows doesn't compile spatial libraries (GDAL, Proj, GEOS) natively, our environment relies on pre-compiled Python wheels.
- `rasterio` contains a private static build of GDAL. Do not install a separate global GDAL unless you need the command-line tools.
- Set the `PROJ_LIB` environment variable if coordinate transformations throw Proj exceptions:
  ```powershell
  $env:PROJ_LIB = "$PSScriptRoot\.venv\Lib\site-packages\pyproj\proj_dir\share\proj"
  ```
- When using Google Earth Engine, authenticate using the service account credentials listed in `.env`:
  ```bash
  earthengine authenticate --service-account-file=config/gee_key.json
  ```
