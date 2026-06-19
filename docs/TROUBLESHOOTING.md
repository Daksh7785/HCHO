# HCHO Troubleshooting Guide

This guide provides solutions for common issues encountered during setup and execution on Windows machines.

---

## 1. Docker & Container Issues

### Issue: "Docker is not running..." or Command Not Found
- **Symptom**: `docker compose up -d` fails with CommandNotFoundException or connection errors.
- **Solution**:
  1. Open **Docker Desktop** on Windows. Ensure the VM back-end is running.
  2. If using WSL 2 backend, check that "WSL integration" is turned on under Docker Desktop settings.
  3. Run PowerShell as Administrator and ensure the Docker CLI path (usually `C:\Program Files\Docker\Docker\resources\bin`) is in your environment's PATH.

### Issue: Port 5432 or 6379 is Already in Use
- **Symptom**: Postgres or Redis container fails to start.
- **Solution**:
  1. Detect the pid using the port:
     ```powershell
     netstat -ano | findstr 5432
     ```
  2. Stop the local PostgreSQL/Redis service if they are running natively in Windows Services:
     - Open `services.msc` and stop "postgresql-x64" or "Redis".
     - Alternatively, change the mapped port in `docker-compose.yml` (e.g. mapping host port `5433:5432` instead of `5432:5432`).

---

## 2. Spatial & Database Issues

### Issue: "PostGIS extension is not installed"
- **Symptom**: Database queries fail with `Function ST_GeomFromText does not exist`.
- **Solution**:
  Apply the migration script to enable PostGIS on your database:
  ```bash
  docker exec -i hcho-postgres psql -U postgres -d hcho_db -c "CREATE EXTENSION IF NOT EXISTS postgis;"
  ```

### Issue: Pyproj / Proj Projection Failures
- **Symptom**: `pyproj.exceptions.CRSError: Invalid projection` or PROJ library path errors.
- **Solution**:
  Verify the PROJ data folder. Reinstalling pyproj via pip usually aligns the paths automatically:
  ```bash
  pip install --force-reinstall pyproj
  ```

---

## 3. Celery & Task Broker Issues

### Issue: Celery Tasks Do Not Start or Throw Permissions Errors
- **Symptom**: Celery workers fail to boot on Windows.
- **Solution**:
  Celery officially does not support Windows natively in newer versions unless forced. To run Celery on Windows for development, you must run it with the `-P solo` or `-P gevent` concurrency pool:
  ```bash
  celery -A api.worker worker --loglevel=info -P solo
  ```

### Issue: Redis Connection Timeout
- **Symptom**: FastAPI or Celery logs show `ConnectionError: Error 10061 connecting to localhost:6379. Connection refused.`
- **Solution**:
  1. Verify the Redis container is running: `docker ps`.
  2. Check if the password in `.env` matches the `REDIS_PASSWORD` specified in `docker-compose.yml`.
