-- ==============================================================================
-- HCHO PLATFORM - DATABASE INITIALIZATION & MIGRATION TEMPLATE
-- Enables PostGIS extensions, creates spatial tables, and configures indices.
-- ==============================================================================

-- 1. Enable PostGIS Extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_raster; -- Support for satellite rasters

-- 2. Create AQI Ground Stations Table
CREATE TABLE IF NOT EXISTS monitoring_stations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    city VARCHAR(50) NOT NULL,
    state VARCHAR(50) NOT NULL,
    geom GEOMETRY(Point, 4326) NOT NULL, -- Point geometry using EPSG:4326 (WGS 84)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create spatial index for fast geographical querying of stations
CREATE INDEX IF NOT EXISTS idx_monitoring_stations_geom ON monitoring_stations USING GIST (geom);

-- 3. Create Formaldehyde (HCHO) Hotspots Table (derived from Sentinel-5P + Burning Events)
CREATE TABLE IF NOT EXISTS hcho_hotspots (
    id SERIAL PRIMARY KEY,
    observed_at TIMESTAMP WITH TIME ZONE NOT NULL,
    frp_value DOUBLE PRECISION,          -- Fire Radiative Power (MW) from VIIRS/MODIS
    hcho_column_amount DOUBLE PRECISION,  -- Formaldehyde column density (mol/m2)
    boundary GEOMETRY(Polygon, 4326) NOT NULL, -- Detected boundary polygon
    confidence DOUBLE PRECISION NOT NULL, -- Detection confidence (0.0 to 1.0)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create spatial GIST index on hotspot boundaries
CREATE INDEX IF NOT EXISTS idx_hcho_hotspots_boundary ON hcho_hotspots USING GIST (boundary);
-- B-Tree indices for timestamp queries
CREATE INDEX IF NOT EXISTS idx_hcho_hotspots_observed ON hcho_hotspots (observed_at DESC);

-- 4. Create Station Air Quality Observations Table (Time-Series)
CREATE TABLE IF NOT EXISTS station_observations (
    id BIGSERIAL PRIMARY KEY,
    station_id INTEGER REFERENCES monitoring_stations(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    pm25 DOUBLE PRECISION,
    pm10 DOUBLE PRECISION,
    hcho_level DOUBLE PRECISION,
    aqi_derived INTEGER,
    status VARCHAR(20) DEFAULT 'raw',
    CONSTRAINT unique_station_timestamp UNIQUE (station_id, timestamp)
);

CREATE INDEX IF NOT EXISTS idx_station_observations_ts ON station_observations (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_station_observations_station_ts ON station_observations (station_id, timestamp DESC);

-- 5. Create Meteorological Telemetry Table (Time-Series Grid Info)
CREATE TABLE IF NOT EXISTS meteorology_grid (
    id BIGSERIAL PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    geom GEOMETRY(Point, 4326) NOT NULL,
    temperature_2m DOUBLE PRECISION,
    relative_humidity_2m DOUBLE PRECISION,
    u_wind_10m DOUBLE PRECISION,
    v_wind_10m DOUBLE PRECISION,
    boundary_layer_height DOUBLE PRECISION
);

CREATE INDEX IF NOT EXISTS idx_meteorology_grid_geom ON meteorology_grid USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_meteorology_grid_ts ON meteorology_grid (timestamp DESC);
