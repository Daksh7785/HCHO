import sys
import socket
import importlib

def check_library(lib_name):
    try:
        module = importlib.import_module(lib_name)
        version = getattr(module, '__version__', 'available')
        return True, version
    except ImportError:
        return False, "Not Installed"

def check_port(host, port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(1.0)
        try:
            s.connect((host, port))
            return True
        except (socket.timeout, ConnectionRefusedError):
            return False

def main():
    print("======================================================================")
    print("HCHO PLATFORM - ENVIRONMENT VALIDATION RUN")
    print("======================================================================\n")

    # 1. System Info
    print(f"Python Version: {sys.version.split()[0]}")
    print(f"Platform: {sys.platform}\n")

    # 2. Check Core Python Libraries
    libraries = {
        "AI/ML Environment": ["torch", "torchvision", "xgboost", "sklearn", "cv2", "albumentations", "numpy", "pandas"],
        "Geospatial / GIS Toolchain": ["rasterio", "geopandas", "shapely", "pyproj"],
        "Backend / Database Toolchain": ["fastapi", "sqlalchemy", "redis", "pydantic"]
    }

    all_passed = True
    print("--- Python Packages Check ---")
    for category, libs in libraries.items():
        print(f"\n[Category: {category}]")
        for lib in libs:
            status, info = check_library(lib)
            status_str = "SUCCESS" if status else "FAILED"
            print(f"  - {lib:<16}: [{status_str}] (Version/Details: {info})")
            if not status:
                all_passed = False

    # 3. Check Database Ports
    services = {
        "PostgreSQL (PostGIS)": 5432,
        "Redis Message Broker": 6379,
        "Qdrant Vector Database": 6333,
        "Prometheus Server": 9090,
        "Grafana Dashboard": 3000
    }

    print("\n--- Database & Services Port Check ---")
    for service_name, port in services.items():
        active = check_port("localhost", port)
        active_str = "ACTIVE" if active else "INACTIVE (Offline or Docker not started)"
        print(f"  - {service_name:<24} on port {port:<5}: [{active_str}]")

    print("\n======================================================================")
    if all_passed:
        print("VALIDATION SUCCESS: All core Python packages are present.")
    else:
        print("VALIDATION WARNING: Some optional packages are missing.")
    print("======================================================================")

if __name__ == "__main__":
    main()
