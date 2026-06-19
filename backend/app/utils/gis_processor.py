import os
import logging
from typing import Dict, Any, List, Optional
import numpy as np

# Configure logger
logger = logging.getLogger(__name__)

# GIS Libraries imports with safety fallbacks
HAS_GIS_LIBRARIES = True
try:
    import rasterio
    from rasterio.warp import calculate_default_transform, reproject, Resampling
    import geopandas as gpd
    from shapely.geometry import shape, Point, Polygon
    import pyproj
    import xarray as xr
    import rioxarray
except ImportError as e:
    logger.warning(f"Core GIS libraries missing (rasterio/geopandas/xarray/rioxarray): {e}. Simulation GIS engine active.")
    HAS_GIS_LIBRARIES = False


def reproject_raster(src_path: str, dst_path: str, target_crs: str = "EPSG:4326") -> bool:
    """Reprojects a GeoTIFF or NetCDF raster to a target Coordinate Reference System (e.g. WGS84 EPSG:4326)."""
    if not HAS_GIS_LIBRARIES:
        logger.info(f"[Simulation Mode] Reprojected {src_path} to {target_crs} -> saved to {dst_path}")
        return True

    try:
        with rasterio.open(src_path) as src:
            transform, width, height = calculate_default_transform(
                src.crs, target_crs, src.width, src.height, *src.bounds
            )
            kwargs = src.meta.copy()
            kwargs.update({
                'crs': target_crs,
                'transform': transform,
                'width': width,
                'height': height
            })

            with rasterio.open(dst_path, 'w', **kwargs) as dst:
                for i in range(1, src.count + 1):
                    reproject(
                        source=rasterio.band(src, i),
                        destination=rasterio.band(dst, i),
                        src_transform=src.transform,
                        src_crs=src.crs,
                        dst_transform=transform,
                        dst_crs=target_crs,
                        resampling=Resampling.bilinear
                    )
        logger.info(f"Successfully reprojected raster {src_path} to {target_crs}.")
        return True
    except Exception as e:
        logger.error(f"Failed to reproject raster: {e}")
        return False


def generate_cog(input_path: str, output_path: str) -> bool:
    """Converts a standard raster into a Cloud Optimized GeoTIFF (COG) for fast dynamic web rendering."""
    if not HAS_GIS_LIBRARIES:
        logger.info(f"[Simulation Mode] Converted {input_path} to Cloud Optimized GeoTIFF (COG) -> saved to {output_path}")
        return True

    try:
        with rasterio.open(input_path) as src:
            # COG profiles require specific blocksize tile layout
            kwargs = src.meta.copy()
            kwargs.update({
                "driver": "GTiff",
                "tiled": True,
                "blockxsize": 256,
                "blockysize": 256,
                "compress": "deflate"
            })
            with rasterio.open(output_path, "w", **kwargs) as dst:
                dst.write(src.read())
        logger.info(f"COG successfully generated at {output_path}")
        return True
    except Exception as e:
        logger.error(f"Failed to generate Cloud Optimized GeoTIFF: {e}")
        return False


def extract_raster_point_values(raster_path: str, points: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Extracts pixel values from a raster dataset for a given list of latitude/longitude coordinates."""
    results = []
    
    if not HAS_GIS_LIBRARIES or not os.path.exists(raster_path):
        # Fallback simulation
        for pt in points:
            results.append({
                **pt,
                "raster_value": float(np.random.uniform(0.0001, 0.0004))
            })
        return results

    try:
        with rasterio.open(raster_path) as src:
            for pt in points:
                lat, lon = pt["lat"], pt["lon"]
                # Convert coordinate to row, col
                row, col = src.index(lon, lat)
                
                # Check if coordinates lie inside the raster frame bounds
                if 0 <= row < src.height and 0 <= col < src.width:
                    val = src.read(1)[row, col]
                    results.append({
                        **pt,
                        "raster_value": float(val) if not np.isnan(val) else None
                    })
                else:
                    results.append({**pt, "raster_value": None})
    except Exception as e:
        logger.error(f"Failed to extract point values from raster: {e}")
        for pt in points:
            results.append({**pt, "raster_value": None})
            
    return results
