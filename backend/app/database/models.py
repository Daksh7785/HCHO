import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, DateTime, Boolean, JSON, ForeignKey
from sqlalchemy.orm import declarative_base
from sqlalchemy.dialects.postgresql import UUID
from geoalchemy2 import Geometry

Base = declarative_base()

class PredictionsDailyAQI(Base):
    """Daily AQI predictions grid cell results"""
    __tablename__ = "predictions_daily_aqi"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    date = Column(DateTime, nullable=False, index=True)
    grid_cell_id = Column(Integer, nullable=False, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    grid_cell_geom = Column(Geometry(geometry_type='POINT', srid=4326), index=True)
    
    # Concentrations (predicted surface values)
    pm25_concentration = Column(Float, nullable=False)
    no2_concentration = Column(Float, nullable=False)
    so2_concentration = Column(Float, nullable=False)
    o3_concentration = Column(Float, nullable=False)
    co_concentration = Column(Float, nullable=False)
    
    # Uncertainty Estimates (95% Confidence Interval width)
    pm25_uncertainty = Column(Float)
    no2_uncertainty = Column(Float)
    so2_uncertainty = Column(Float)
    o3_uncertainty = Column(Float)
    co_uncertainty = Column(Float)
    
    # Aggregated AQI
    aqi_value = Column(Integer, nullable=False)
    aqi_category = Column(String, nullable=False)
    dominant_pollutant = Column(String)
    
    model_version = Column(String, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    run_id = Column(UUID(as_uuid=True), index=True)


class HCHOHotspots(Base):
    """HCHO hotspot detections and active fire links"""
    __tablename__ = "hcho_hotspots"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    date_detected = Column(DateTime, nullable=False, index=True)
    hotspot_geom = Column(Geometry(geometry_type='POLYGON', srid=4326), index=True)
    center_latitude = Column(Float)
    center_longitude = Column(Float)
    area_km2 = Column(Float)
    
    # TROPOMI HCHO stats
    max_hcho_column = Column(Float)
    mean_hcho_column = Column(Float)
    pixel_count = Column(Integer)
    
    # Fire correlation
    fire_correlation_spearman = Column(Float)
    fire_correlation_pvalue = Column(Float)
    fire_correlated = Column(Boolean)
    
    # Tracking
    hotspot_status = Column(String, default="Active")  # New, Active, Expanding, Resolving
    days_active = Column(Integer, default=1)
    
    # Attribution
    source_region = Column(String)  # e.g., Indo-Gangetic Plain, Central, Northeast
    responsible_states = Column(JSON)  # Array of state names
    population_affected_50km = Column(Integer)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    run_id = Column(UUID(as_uuid=True), index=True)


class CPCBMonitoringStations(Base):
    """Reference list of ground CPCB stations"""
    __tablename__ = "cpcb_monitoring_stations"
    
    station_id = Column(Integer, primary_key=True)
    station_name = Column(String, index=True, nullable=False)
    city_name = Column(String, index=True)
    state_name = Column(String, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    geom = Column(Geometry(geometry_type='POINT', srid=4326), index=True)
    operator = Column(String, default="CPCB")


class GroundTruthMeasurements(Base):
    """CPCB ground stations historical data"""
    __tablename__ = "ground_truth_measurements"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    station_id = Column(Integer, ForeignKey('cpcb_monitoring_stations.station_id'), index=True)
    measurement_date = Column(DateTime, nullable=False, index=True)
    
    pm25_measured = Column(Float)
    no2_measured = Column(Float)
    so2_measured = Column(Float)
    o3_measured = Column(Float)
    co_measured = Column(Float)
    aqi_official = Column(Integer)
    
    created_at = Column(DateTime, default=datetime.utcnow)


class ModelRuns(Base):
    """Execution metadata and performance evaluation metrics"""
    __tablename__ = "model_runs"
    
    run_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    run_date = Column(DateTime, nullable=False, index=True)
    model_version = Column(String)
    start_time = Column(DateTime)
    end_time = Column(DateTime)
    status = Column(String)  # success, failed
    
    # Statistical validation checks
    mean_rmse = Column(Float)
    mean_r2 = Column(Float)
    error_message = Column(String)
    
    notes = Column(String)
