import pytest
import numpy as np
import torch
from fastapi.testclient import TestClient

from app.main import app
from app.utils.aqi_calc import calculate_aqi, get_sub_index, get_aqi_category
from app.utils.geospatial import calculate_haversine_distance, idw_interpolate
from app.utils.clustering import cluster_anomalies_to_hotspots
from app.services.ml_service import CNNLSTMNet, MLService

client = TestClient(app)

# ==============================================================================
# 1. TEST AQI CALCULATOR (NAAQS)
# ==============================================================================
def test_aqi_breakpoints():
    assert get_sub_index("pm25", 15.0) == 25
    assert get_sub_index("pm25", 45.0) == 75
    assert get_sub_index("pm25", 75.0) == 150
    assert get_sub_index("pm25", 105.0) == 250
    
    assert get_aqi_category(45) == "Good"
    assert get_aqi_category(120) == "Moderate"
    assert get_aqi_category(350) == "Very Poor"
    assert get_aqi_category(450) == "Severe"

def test_overall_aqi():
    aqi, category, dominant = calculate_aqi(pm25=45.0, no2=20.0, so2=5.0)
    assert aqi == 75
    assert category == "Satisfactory"
    assert dominant == "PM2.5"

# ==============================================================================
# 2. TEST GEOSPATIAL CALCULATIONS & CRS INTERPOLATION
# ==============================================================================
def test_haversine_distance():
    delhi_lat, delhi_lon = 28.6139, 77.2090
    chd_lat, chd_lon = 30.7333, 76.7794
    dist = calculate_haversine_distance(delhi_lat, delhi_lon, chd_lat, chd_lon)
    assert 220.0 <= dist <= 260.0

def test_idw_interpolation():
    sources = [
        (10.0, 10.0, 100.0),
        (10.2, 10.0, 150.0),
        (10.0, 10.2, 200.0)
    ]
    assert idw_interpolate(sources, 10.0, 10.0) == 100.0
    
    interp = idw_interpolate(sources, 10.1, 10.1)
    assert 100.0 <= interp <= 200.0

# ==============================================================================
# 3. TEST ANOMALY CLUSTERING (DBSCAN + SHAPELY CONVEX HULL)
# ==============================================================================
def test_clustering_hotspots():
    points = [
        (30.0, 75.0, 0.0003),
        (30.05, 75.0, 0.00032),
        (30.0, 75.05, 0.00034)
    ]
    clusters = cluster_anomalies_to_hotspots(points, eps_degrees=0.15, min_samples=2)
    assert len(clusters) == 1
    assert clusters[0]["pixel_count"] == 3
    assert clusters[0]["area_km2"] >= 5.0

# ==============================================================================
# 4. TEST PYTORCH MODEL SHAPE & MC INFERENCE
# ==============================================================================
def test_pytorch_model_dims():
    model = CNNLSTMNet(input_dim=14, hidden_dim=32, output_dim=5)
    x = torch.randn(4, 3, 14)
    out = model(x)
    assert out.shape == (4, 5)

def test_ml_service_batch_predict():
    MLService.load_model()
    mock_features = [[0.5] * 14, [0.8] * 14]
    mean_preds, std_preds = MLService.predict_batch(mock_features, num_mc_runs=3)
    assert mean_preds.shape == (2, 5)
    assert std_preds.shape == (2, 5)
    assert np.all(mean_preds[:, 0] >= 5.0)

# ==============================================================================
# 5. TEST API ROUTES
# ==============================================================================
def test_api_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_api_spatial_aqi():
    response = client.get("/api/v1/aqi/spatial/2026-11-10", params={"pollutant": "pm25"})
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["pollutant"] == "pm25"
    assert "data" in json_data
    assert len(json_data["data"]) > 0

def test_api_hcho_hotspots():
    response = client.get("/api/v1/hcho/hotspots/2026-11-10")
    assert response.status_code == 200
    json_data = response.json()
    assert "data" in json_data

# ==============================================================================
# 6. TEST NEW PRODUCTION API ENDPOINTS
# ==============================================================================
def test_api_aqi_explain():
    # Grid cell 1 is simulated in Indo-Gangetic Plain
    response = client.get("/api/v1/aqi/explain/1", params={"date_str": "2026-11-10"})
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["grid_cell_id"] == 1
    assert "shap_values" in json_data
    assert "attention_weights" in json_data
    assert len(json_data["shap_values"]) > 0

def test_api_aqi_forecast():
    # Delhi centroid coordinate query
    response = client.get("/api/v1/aqi/forecast/28.6/77.2", params={"start_date_str": "2026-11-10"})
    assert response.status_code == 200
    json_data = response.json()
    assert "location" in json_data
    assert "forecast" in json_data
    assert len(json_data["forecast"]) == 7

def test_api_active_alerts():
    response = client.get("/api/v1/alerts/active")
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["status"] == "success"
    assert "data" in json_data
    assert len(json_data["data"]) > 0

def test_api_register_alerts():
    payload = {
        "email": "test@cpcb.gov.in",
        "region": "Indo-Gangetic Plain",
        "pm25_threshold": 120.0,
        "hcho_alerts": True
    }
    response = client.post("/api/v1/alerts/register", json=payload)
    assert response.status_code == 201
    json_data = response.json()
    assert json_data["status"] == "success"
    assert "message" in json_data

# ==============================================================================
# 7. TEST SCIENTIFIC & QUALITY ENDPOINTS
# ==============================================================================
def test_api_aqi_benchmark():
    response = client.get("/api/v1/aqi/benchmark")
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["status"] == "success"
    assert "metrics" in json_data
    assert "best_model" in json_data
    assert len(json_data["metrics"]) >= 5

def test_api_hcho_transport():
    response = client.get("/api/v1/hcho/transport/28.6/77.2", params={"date_str": "2026-11-10"})
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["status"] == "success"
    assert "source" in json_data["data"]
    assert "wind" in json_data["data"]
    assert "trajectory" in json_data["data"]

def test_api_hcho_severity():
    response = client.get("/api/v1/hcho/severity", params={"date_str": "2026-11-10"})
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["status"] == "success"
    assert "data" in json_data
    assert len(json_data["data"]) > 0
    first_hs = json_data["data"][0]
    assert "severity_score" in first_hs
    assert "risk_category" in first_hs
    assert "national_rank" in first_hs

def test_api_quality_report():
    response = client.get("/api/v1/quality/report", params={"date_str": "2026-11-10"})
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["status"] == "success"
    report = json_data["data"]
    assert "data_reliability_score" in report
    assert "audit_status" in report

def test_api_exposure_report():
    response = client.get("/api/v1/exposure/report", params={"date_str": "2026-11-10"})
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["status"] == "success"
    assert "summary" in json_data["data"]
    assert "state_exposure" in json_data["data"]
    assert "district_exposure" in json_data["data"]

def test_api_hcho_causal():
    response = client.get("/api/v1/hcho/causal", params={"date_str": "2026-11-10"})
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["status"] == "success"
    assert "fire_to_hcho_correlation" in json_data
    assert "hcho_to_pm25_correlation" in json_data
    assert "scientific_finding" in json_data

def test_api_source_attribution():
    response = client.get("/api/v1/aqi/source_attribution", params={"date_str": "2026-11-10"})
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["status"] == "success"
    assert "biomass_burning" in json_data["data"]
    assert "vehicular_emissions" in json_data["data"]

def test_api_aqi_anomalies():
    response = client.get("/api/v1/aqi/anomalies", params={"date_str": "2026-11-10"})
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["status"] == "success"
    assert "anomalies_count" in json_data
    assert "data" in json_data

def test_api_aqi_seasonal():
    response = client.get("/api/v1/aqi/seasonal", params={"date_str": "2026-11-10"})
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["status"] == "success"
    assert "season_name" in json_data["data"]
    assert "operational_mitigation_directives" in json_data["data"]

def test_api_district_rankings():
    response = client.get("/api/v1/district/rankings", params={"date_str": "2026-11-10"})
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["status"] == "success"
    assert "most_polluted_districts" in json_data["data"]
    assert "highest_fire_districts" in json_data["data"]

def test_api_policy_brief():
    response = client.get("/api/v1/policy/brief", params={"date_str": "2026-11-10"})
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["status"] == "success"
    assert "executive_summary" in json_data
    assert "regulatory_warnings" in json_data
    assert "mitigation_directives" in json_data

def test_api_validation_report():
    response = client.get("/api/v1/validation/report", params={"date_str": "2026-11-10"})
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["status"] == "success"
    assert "loso_validation" in json_data
    assert "spatial_validation" in json_data
    assert "temporal_validation" in json_data
    assert "seasonal_validation" in json_data
    assert "cross_state_validation" in json_data

# ==============================================================================
# 8. TEST DOWNLOADERS (API FALLBACKS)
# ==============================================================================
def test_live_downloaders():
    from datetime import date
    from app.data_pipeline.downloaders import (
        Sentinel5PDownloader,
        INSAT3DDownloader,
        CPCBStationDownloader,
        FirmsFireDownloader,
        Era5MeteorologyDownloader,
        ImdaaMeteorologyDownloader,
        Merra2AerosolDownloader
    )
    
    d1 = Sentinel5PDownloader()
    res1 = d1.download_hcho(date(2026, 11, 10))
    assert res1["status"] == "fallback"
    
    d2 = INSAT3DDownloader()
    res2 = d2.download_aod(date(2026, 11, 10))
    assert res2["status"] == "fallback"
    
    d3 = CPCBStationDownloader()
    res3 = d3.fetch_live_aqi()
    assert res3["status"] == "fallback"
    
    d4 = FirmsFireDownloader()
    res4 = d4.fetch_active_fires(date(2026, 11, 10))
    assert res4["status"] == "fallback"
    
    d5 = Era5MeteorologyDownloader()
    res5 = d5.download_meteorology(date(2026, 11, 10))
    assert res5["status"] == "fallback"
    
    d6 = ImdaaMeteorologyDownloader()
    res6 = d6.download_imdaa_data(date(2026, 11, 10))
    assert res6["status"] == "fallback"
    
    d7 = Merra2AerosolDownloader()
    res7 = d7.download_merra2_data(date(2026, 11, 10))
    assert res7["status"] == "fallback"
