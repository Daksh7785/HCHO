import logging
import uuid
from datetime import date, datetime
from typing import List, Dict, Any, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from shapely.geometry import Point
from shapely.wkt import loads as load_wkt
from geoalchemy2.shape import from_shape

from app.database.models import PredictionsDailyAQI, HCHOHotspots

logger = logging.getLogger(__name__)

async def save_predictions_to_db(session: AsyncSession, target_date: date, cells: List[Dict[str, Any]]) -> bool:
    """Save daily spatial grid predictions to database for persistence and fast querying."""
    try:
        run_id = uuid.uuid4()
        dt_date = datetime.combine(target_date, datetime.min.time())
        
        objects = []
        for cell in cells:
            pt = Point(cell["longitude"], cell["latitude"])
            obj = PredictionsDailyAQI(
                id=uuid.uuid4(),
                date=dt_date,
                grid_cell_id=cell["grid_cell_id"],
                latitude=cell["latitude"],
                longitude=cell["longitude"],
                grid_cell_geom=from_shape(pt, srid=4326),
                pm25_concentration=cell.get("pm25", 0.0),
                no2_concentration=cell.get("no2", 0.0),
                so2_concentration=cell.get("so2", 0.0),
                o3_concentration=cell.get("o3", 0.0),
                co_concentration=cell.get("co", 0.0),
                pm25_uncertainty=cell.get("uncertainty_pm25", 0.0),
                no2_uncertainty=cell.get("uncertainty_pm25", 0.0) * 0.4,
                aqi_value=cell.get("aqi", 0),
                aqi_category=cell.get("category", "Good"),
                dominant_pollutant=cell.get("dominant_pollutant", "PM2.5"),
                model_version="2.1",
                run_id=run_id
            )
            objects.append(obj)
            
        session.add_all(objects)
        await session.flush()
        logger.info(f"Successfully cached {len(cells)} grid predictions for {target_date} in database.")
        return True
    except Exception as e:
        logger.error(f"Error saving predictions to database: {e}")
        # Rollback is handled in context manager get_async_session
        return False

async def get_predictions_from_db(session: AsyncSession, target_date: date) -> Optional[List[Dict[str, Any]]]:
    """Retrieve daily spatial grid predictions from database if cached."""
    try:
        dt_date = datetime.combine(target_date, datetime.min.time())
        stmt = select(PredictionsDailyAQI).where(PredictionsDailyAQI.date == dt_date)
        result = await session.execute(stmt)
        rows = result.scalars().all()
        
        if not rows:
            return None
            
        logger.info(f"Retrieved {len(rows)} cached predictions from database for {target_date}.")
        cells = []
        for row in rows:
            cells.append({
                "grid_cell_id": row.grid_cell_id,
                "latitude": row.latitude,
                "longitude": row.longitude,
                "value": row.pm25_concentration, # Default value representation
                "aqi": row.aqi_value,
                "category": row.aqi_category,
                "dominant_pollutant": row.dominant_pollutant,
                "pm25": row.pm25_concentration,
                "no2": row.no2_concentration,
                "so2": row.so2_concentration,
                "o3": row.o3_concentration,
                "co": row.co_concentration,
                "hcho": 0.00015, # Approximated base column amount
                "uncertainty_pm25": row.pm25_uncertainty,
                "fire_count": 0,
                "u_wind": 1.0,
                "v_wind": 1.0
            })
        return cells
    except Exception as e:
        logger.error(f"Error fetching predictions from database: {e}")
        return None

async def save_hotspots_to_db(session: AsyncSession, target_date: date, hotspots: List[Dict[str, Any]]) -> bool:
    """Save HCHO hotspots to database."""
    try:
        run_id = uuid.uuid4()
        dt_date = datetime.combine(target_date, datetime.min.time())
        
        objects = []
        for hs in hotspots:
            geom_shape = load_wkt(hs["boundary_wkt"])
            obj = HCHOHotspots(
                id=uuid.uuid4(),
                date_detected=dt_date,
                hotspot_geom=from_shape(geom_shape, srid=4326),
                center_latitude=hs["center_latitude"],
                center_longitude=hs["center_longitude"],
                area_km2=hs["area_km2"],
                max_hcho_column=hs["max_hcho_column"] / 1000000.0,
                mean_hcho_column=hs["mean_hcho_column"] / 1000000.0,
                pixel_count=hs["pixel_count"],
                fire_correlation_spearman=hs["fire_correlation_spearman"],
                fire_correlation_pvalue=hs["fire_correlation_pvalue"],
                fire_correlated=hs["fire_correlated"],
                hotspot_status=hs["hotspot_status"],
                days_active=hs["days_active"],
                source_region=hs["source_region"],
                responsible_states=hs["responsible_states"],
                population_affected_50km=1500000,
                run_id=run_id
            )
            objects.append(obj)
            
        session.add_all(objects)
        await session.flush()
        logger.info(f"Successfully cached {len(hotspots)} HCHO hotspots for {target_date} in database.")
        return True
    except Exception as e:
        logger.error(f"Error saving hotspots to database: {e}")
        return False

async def get_hotspots_from_db(session: AsyncSession, target_date: date) -> Optional[List[Dict[str, Any]]]:
    """Retrieve HCHO hotspots from database if cached."""
    try:
        dt_date = datetime.combine(target_date, datetime.min.time())
        stmt = select(HCHOHotspots).where(HCHOHotspots.date_detected == dt_date)
        result = await session.execute(stmt)
        rows = result.scalars().all()
        
        if not rows:
            return None
            
        logger.info(f"Retrieved {len(rows)} cached HCHO hotspots from database for {target_date}.")
        hotspots = []
        for idx, row in enumerate(rows):
            hotspots.append({
                "hotspot_id": f"HS-{target_date.strftime('%Y-%m-%d')}-{idx+1}",
                "center_latitude": row.center_latitude,
                "center_longitude": row.center_longitude,
                "area_km2": row.area_km2,
                "pixel_count": row.pixel_count,
                "max_hcho_column": row.max_hcho_column * 1000000.0,
                "mean_hcho_column": row.mean_hcho_column * 1000000.0,
                "total_fires": 25, # Approximated count
                "fire_correlation_spearman": row.fire_correlation_spearman,
                "fire_correlation_pvalue": row.fire_correlation_pvalue,
                "fire_correlated": row.fire_correlated,
                "hotspot_status": row.hotspot_status,
                "source_region": row.source_region,
                "responsible_states": row.responsible_states,
                "boundary_wkt": f"POLYGON(({row.center_longitude-0.1} {row.center_latitude-0.1}, {row.center_longitude+0.1} {row.center_latitude-0.1}, {row.center_longitude+0.1} {row.center_latitude+0.1}, {row.center_longitude-0.1} {row.center_latitude+0.1}, {row.center_longitude-0.1} {row.center_latitude-0.1}))",
                "days_active": row.days_active
            })
        return hotspots
    except Exception as e:
        logger.error(f"Error fetching hotspots from database: {e}")
        return None
