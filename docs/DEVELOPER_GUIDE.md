# HCHO Developer Guide

This document describes coding standards, git workflows, coordinate systems, and quality assurance processes for the **HCHO Air Quality Monitoring Platform**.

---

## 1. Coding Standards

### Python (Backend & ML)
- **Formatting**: We use **Ruff** for code formatting and linting. Lines are limited to **100 characters**.
- **Type Annotations**: Python code must include type hints (PEP 484) for all function arguments and returns.
- **Asynchronous Database Queries**: All SQLAlchemy queries must use the asynchronous API (`select`, `execute` within an async session context). Avoid blocking database code in FastAPI handlers.
- **Validation**: Use **Pydantic v2** models to validate request payloads and environmental settings.

### JavaScript/TypeScript (Frontend)
- **Formatting**: We use **Prettier** for formatting.
- **ESLint**: Enable default Next.js linting rules.
- **Components**: Write clean functional components using TypeScript definitions.

---

## 2. Spatial Data & Coordinate reference systems (CRS)

When writing geospatial scripts, adhere to these standards:
- **Default Geographic CRS**: **WGS 84 (EPSG:4326)**. All databases (PostGIS tables, geojson exports) use this system by default. Lat/Lon order must be: `longitude first` for WKT and GeoJSON, and `latitude first` for standard query parameters.
- **Projected CRS**: For accurate area/distance calculations (such as hotspot buffers and fire radii), reproject datasets to **UTM Zone 43N (EPSG:32643)** (covers central India) or the appropriate UTM zone:
  ```python
  # Reproject to UTM Zone 43N
  gdf_utm = gdf.to_crs(epsg=32643)
  ```
- **Raster Handling**: Always use `rasterio` context managers to read satellite files to ensure file handles are closed properly.

---

## 3. Git Workflow

- **Branch Naming**:
  - Feature branches: `feature/short-desc`
  - Bug fixes: `bugfix/issue-id-short-desc`
  - Hotfixes: `hotfix/short-desc`
- **Commits**: Follow conventional commits (`feat: ...`, `fix: ...`, `docs: ...`, `test: ...`).
- **Pull Requests**: Pull requests must pass linting and pytest testing runs before merging to the `main` branch.

---

## 4. Quality Assurance & Testing

### Python Backend Testing
We use **PyTest** to write and run unit tests.
1. **Run all tests**:
   ```bash
   pytest
   ```
2. **Generate test coverage report**:
   ```bash
   pytest --cov=. --cov-report=html
   ```

### Frontend Code Quality
1. **Verify ESLint and formatting**:
   ```bash
   npm run lint:frontend
   npm run format:check
   ```
2. **Apply Prettier formatting**:
   ```bash
   npm run format:write
   ```
