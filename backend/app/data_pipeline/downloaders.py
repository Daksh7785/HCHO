import os
import logging
import requests
from datetime import date
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

class Sentinel5PDownloader:
    """Live Sentinel-5P TROPOMI Column Downloader (API connection via Copernicus Dataspace / SentinelSat)"""
    def __init__(self):
        self.username = os.getenv("COPERNICUS_USERNAME")
        self.password = os.getenv("COPERNICUS_PASSWORD")
        self.api_url = "https://catalogue.dataspace.copernicus.eu/odata/v1"

    def download_hcho(self, target_date: date) -> Dict[str, Any]:
        """Download Sentinel-5P HCHO L2 column products for the Indian region."""
        if not self.username or not self.password:
            logger.warning("Copernicus credentials missing. Falling back to simulated Sentinel-5P HCHO data.")
            return {"status": "fallback", "source": "simulator", "count": 100}
        
        # Realistic Copernicus OData catalog search query
        date_str = target_date.strftime("%Y-%m-%d")
        query_url = (
            f"{self.api_url}/Products?$filter=Attributes/OData.CSC.StringAttribute/any(a:a/Name eq 'productType' "
            f"and a/Value eq 'L2__HCHO___') and ContentDate/Start gt {date_str}T00:00:00.000Z and "
            f"ContentDate/End lt {date_str}T23:59:59.999Z"
        )
        try:
            response = requests.get(query_url, auth=(self.username, self.password), timeout=15)
            if response.status_code == 200:
                products = response.json().get("value", [])
                logger.info(f"Sentinel-5P HCHO API search found {len(products)} products.")
                return {"status": "success", "source": "Copernicus Catalogue API", "products": products}
            else:
                logger.error(f"Sentinel-5P Catalogue API query returned status {response.status_code}")
        except Exception as e:
            logger.error(f"Failed to query Sentinel-5P Copernicus API: {e}")
        
        return {"status": "fallback", "source": "simulator", "error": "API query failure"}


class INSAT3DDownloader:
    """Live INSAT-3D Aerosol Optical Depth (AOD) Downloader (MOSDAC connection)"""
    def __init__(self):
        self.api_key = os.getenv("MOSDAC_API_KEY")
        self.api_url = "https://api.mosdac.gov.in/v1/insat3d/aod"

    def download_aod(self, target_date: date) -> Dict[str, Any]:
        """Query MOSDAC catalog for INSAT-3D/3DR IMAGER AOD products."""
        if not self.api_key:
            logger.warning("MOSDAC API key missing. Falling back to simulated INSAT-3D AOD data.")
            return {"status": "fallback", "source": "simulator"}
        
        params = {
            "api_key": self.api_key,
            "date": target_date.strftime("%Y-%m-%d"),
            "region": "India"
        }
        try:
            response = requests.get(self.api_url, params=params, timeout=15)
            if response.status_code == 200:
                data = response.json()
                logger.info("Successfully fetched INSAT-3D AOD catalogue metadata.")
                return {"status": "success", "source": "MOSDAC API", "data": data}
        except Exception as e:
            logger.error(f"Failed to query MOSDAC INSAT-3D API: {e}")
            
        return {"status": "fallback", "source": "simulator"}


class CPCBStationDownloader:
    """Live CPCB CAAQMS Station Ground-Truth API retrieval"""
    def __init__(self):
        # Central Pollution Control Board CAAQMS portal endpoints
        self.api_url = "https://api.cpcb.gov.in/v1/live/station-data"
        self.api_key = os.getenv("CPCB_API_KEY")

    def fetch_live_aqi(self) -> Dict[str, Any]:
        """Fetch real-time station ambient readings across India."""
        if not self.api_key:
            logger.warning("CPCB API key missing. Falling back to simulated ground stations.")
            return {"status": "fallback", "source": "simulator"}
            
        headers = {"Authorization": f"Bearer {self.api_key}"}
        try:
            response = requests.get(self.api_url, headers=headers, timeout=10)
            if response.status_code == 200:
                data = response.json()
                logger.info("CPCB CAAQMS real-time telemetry successfully retrieved.")
                return {"status": "success", "source": "CPCB Live API", "stations": data.get("records", [])}
        except Exception as e:
            logger.error(f"Failed to fetch live CPCB ground station telemetry: {e}")
            
        return {"status": "fallback", "source": "simulator"}


class FirmsFireDownloader:
    """Live MODIS/VIIRS Active Fire hotspot downloader (FIRMS connection)"""
    def __init__(self):
        self.map_key = os.getenv("FIRMS_MAP_KEY")
        # NASA FIRMS API base url
        self.api_url = "https://firms.modaps.eosdis.nasa.gov/api/country/csv"

    def fetch_active_fires(self, target_date: date) -> Dict[str, Any]:
        """Fetch active fire counts for India using MODIS and VIIRS satellite sensors."""
        if not self.map_key:
            logger.warning("NASA FIRMS Map Key missing. Falling back to simulated MODIS/VIIRS fire hotspots.")
            return {"status": "fallback", "source": "simulator"}
            
        # India country code is IND, source options: MODIS_SP, VIIRS_NOAA20, VIIRS_SNPP
        url = f"{self.api_url}/{self.map_key}/VIIRS_SNPP/IND/1/{target_date.strftime('%Y-%m-%d')}"
        try:
            response = requests.get(url, timeout=15)
            if response.status_code == 200:
                # FIRMS returns CSV text data
                fire_records = response.text.split("\n")
                logger.info(f"NASA FIRMS API returned {len(fire_records) - 1} active fire observations for India.")
                return {"status": "success", "source": "NASA FIRMS API", "count": len(fire_records) - 2}
        except Exception as e:
            logger.error(f"Failed to fetch active fires from NASA FIRMS API: {e}")
            
        return {"status": "fallback", "source": "simulator"}


class Era5MeteorologyDownloader:
    """ECMWF ERA5 Meteorological wind vector & boundary layer height downloader."""
    def __init__(self):
        self.cds_url = os.getenv("CDSAPI_URL")
        self.cds_key = os.getenv("CDSAPI_KEY")

    def download_meteorology(self, target_date: date) -> Dict[str, Any]:
        """Fetch ERA5 meteorological parameters using the CDS API client."""
        if not self.cds_key:
            logger.warning("Copernicus CDSAPI Key missing. Falling back to simulated meteorological reanalysis.")
            return {"status": "fallback", "source": "simulator"}
            
        try:
            import cdsapi
            client = cdsapi.Client(url=self.cds_url, key=self.cds_key)
            # Query boundary layer height, temperature, relative humidity, and 10m wind components
            result = client.retrieve(
                'reanalysis-era5-single-levels',
                {
                    'product_type': 'reanalysis',
                    'format': 'netcdf',
                    'variable': [
                        '10m_u_component_of_wind', '10m_v_component_of_wind',
                        '2m_temperature', '2m_dewpoint_temperature', 'boundary_layer_height'
                    ],
                    'year': str(target_date.year),
                    'month': f"{target_date.month:02d}",
                    'day': f"{target_date.day:02d}",
                    'time': '12:00',
                    'area': [38.0, 68.0, 8.0, 98.0], # India Bounding Box
                }
            )
            logger.info("Successfully queued ERA5 reanalysis request on ECMWF Copernicus CDS.")
            return {"status": "success", "source": "ECMWF CDS API", "download_url": result.location}
        except ImportError:
            logger.error("cdsapi python library not installed. Cannot retrieve live ERA5 files.")
        except Exception as e:
            logger.error(f"Failed to request ECMWF ERA5 data: {e}")
            
        return {"status": "fallback", "source": "simulator"}


class ImdaaMeteorologyDownloader:
    """Live IMDAA (Indian Monsoon Data Assimilation and Analysis) Regional Reanalysis Downloader"""
    def __init__(self):
        self.api_url = "https://api.ncmrwf.gov.in/v1/imdaa"
        self.api_key = os.getenv("IMDAA_API_KEY")

    def download_imdaa_data(self, target_date: date) -> Dict[str, Any]:
        """Query NCMRWF data service for IMDAA regional reanalysis products over India."""
        if not self.api_key:
            logger.warning("IMDAA API key missing. Falling back to simulated IMDAA regional reanalysis.")
            return {"status": "fallback", "source": "simulator"}
            
        params = {
            "api_key": self.api_key,
            "date": target_date.strftime("%Y-%m-%d"),
            "parameter": "temperature_humidity_surface"
        }
        try:
            response = requests.get(self.api_url, params=params, timeout=15)
            if response.status_code == 200:
                logger.info("Successfully fetched live IMDAA reanalysis metadata.")
                return {"status": "success", "source": "NCMRWF IMDAA API", "data": response.json()}
        except Exception as e:
            logger.error(f"Failed to query NCMRWF IMDAA API: {e}")
        return {"status": "fallback", "source": "simulator"}


class Merra2AerosolDownloader:
    """Live NASA MERRA-2 (Modern-Era Retrospective analysis for Research and Applications) Downloader"""
    def __init__(self):
        self.api_url = "https://goldsmr4.gesdisc.eosdis.nasa.gov/opendap/MERRA2"
        self.username = os.getenv("EARTHDATA_USERNAME")
        self.password = os.getenv("EARTHDATA_PASSWORD")

    def download_merra2_data(self, target_date: date) -> Dict[str, Any]:
        """Query NASA Earthdata GES DISC OPeNDAP server for MERRA-2 aerosol profiles."""
        if not self.username or not self.password:
            logger.warning("NASA Earthdata credentials missing. Falling back to simulated MERRA-2 aerosol data.")
            return {"status": "fallback", "source": "simulator"}
            
        date_str = target_date.strftime("%Y%m%d")
        query_url = f"{self.api_url}/M2T1NXAER.5.12.4/2026/11/MERRA2_400.tavg1_2d_aer_Nx.{date_str}.nc4"
        try:
            response = requests.head(query_url, auth=(self.username, self.password), timeout=15)
            if response.status_code in [200, 302]:
                logger.info(f"NASA MERRA-2 product found on GES DISC: {query_url}")
                return {"status": "success", "source": "NASA GES DISC OPenDAP", "url": query_url}
        except Exception as e:
            logger.error(f"Failed to query NASA MERRA-2 Earthdata API: {e}")
        return {"status": "fallback", "source": "simulator"}
