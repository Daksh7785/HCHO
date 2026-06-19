# HCHO Setup Guide

Welcome to the **HCHO (Formaldehyde) Air Quality Monitoring Platform** developer setup guide. Follow these instructions to get your local environment running.

---

## Prerequisites
Ensure the following tools are installed on your machine:
- **Git** (version 2.40+)
- **Node.js** (version 18.0+ or v24.15.0+)
- **Python** (version 3.10+ or 3.14.4+)
- **Docker Desktop** (required for databases, Redis, and metrics)

---

## 1. Project Initialization & Secrets Configuration

1. **Clone the repository** and navigate to the project directory:
   ```bash
   git clone <repo-url>
   cd HCHO
   ```

2. **Copy the Environment Variables Template**:
   ```bash
   copy .env.example .env
   ```
   Open the `.env` file and customize passwords or credentials if required.

---

## 2. Launch Local Database & Caching Services

We use Docker Compose to run PostgreSQL (PostGIS), Redis, Qdrant, and Prometheus.

1. **Start the containers** in detached mode:
   ```bash
   docker compose up -d
   ```

2. **Verify that the containers are healthy**:
   ```bash
   docker compose ps
   ```

---

## 3. Python Environment Setup

We recommend setting up a virtual environment to isolate dependencies.

1. **Create and activate the virtual environment**:
   ```powershell
   # Windows PowerShell
   python -m venv .venv
   .venv\Scripts\Activate.ps1
   ```

2. **Install requirements**:
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

---

## 4. Frontend Node Setup

1. **Install Node modules**:
   ```bash
   npm install
   ```

---

## 5. Database Migrations & Seeding

1. **Apply Spatial Database Migrations**:
   We will initialize the PostGIS schemas. Open a SQL client (e.g. pgAdmin, DBeaver) or execute:
   ```bash
   # Connect to PostgreSQL container and run migration commands
   docker exec -i hcho-postgres psql -U postgres -d hcho_db < db/migration_template.sql
   ```

2. **Seed Mock GIS Data**:
   Seed Indian AQI monitoring stations and mock Formaldehyde hotspots:
   ```bash
   python -m db.seed_data
   ```

---

## 6. Running the Development Servers

1. **Start the FastAPI Backend**:
   Create a standard run command or execute:
   ```bash
   # Activate env and run
   uvicorn api.main:app --reload
   ```

2. **Start the Next.js Frontend**:
   ```bash
   npm run dev:frontend
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.
