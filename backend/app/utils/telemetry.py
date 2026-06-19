import os
import logging
from typing import Optional

logger = logging.getLogger(__name__)

# Integration Flags with Fallbacks
HAS_PROMETHEUS = True
HAS_OPENTELEMETRY = True
HAS_SENTRY = True

try:
    from prometheus_client import Counter, Gauge, Histogram
except ImportError:
    HAS_PROMETHEUS = False
    logger.warning("prometheus_client library missing. Using mock telemetry gauges.")

try:
    from opentelemetry import trace
    from opentelemetry.sdk.trace import TracerProvider
    from opentelemetry.sdk.trace.export import SimpleSpanProcessor, ConsoleSpanExporter
except ImportError:
    HAS_OPENTELEMETRY = False
    logger.warning("opentelemetry SDK missing. Using mock tracer provider.")

try:
    import sentry_sdk
except ImportError:
    HAS_SENTRY = False
    logger.warning("sentry_sdk missing. Using standard logging fallback.")


# 1. Initialize Prometheus Metrics
if HAS_PROMETHEUS:
    HTTP_REQUESTS_TOTAL = Counter(
        "atmos_http_requests_total", 
        "Total number of HTTP requests processed", 
        ["method", "endpoint", "status"]
    )
    PREDICTION_LATENCY_SECONDS = Histogram(
        "atmos_prediction_latency_seconds", 
        "Duration of ML model prediction runs"
    )
    ACTIVE_WEBSOCKET_CONNECTIONS = Gauge(
        "atmos_active_websocket_connections", 
        "Count of active real-time alert clients connected"
    )
else:
    # Mock fallback classes for offline/minimal installations
    class MockMetric:
        def labels(self, *args, **kwargs): return self
        def inc(self, *args, **kwargs): pass
        def observe(self, *args, **kwargs): pass
        def dec(self, *args, **kwargs): pass
        
    HTTP_REQUESTS_TOTAL = MockMetric()
    PREDICTION_LATENCY_SECONDS = MockMetric()
    ACTIVE_WEBSOCKET_CONNECTIONS = MockMetric()


# 2. Initialize OpenTelemetry Tracing
def setup_tracing() -> None:
    """Configures the Global Tracer Provider for end-to-end tracing."""
    if not HAS_OPENTELEMETRY:
        logger.info("OpenTelemetry trace provider configured in simulator mode.")
        return
        
    try:
        provider = TracerProvider()
        processor = SimpleSpanProcessor(ConsoleSpanExporter())
        provider.add_span_processor(processor)
        trace.set_tracer_provider(provider)
        logger.info("OpenTelemetry successfully initialized.")
    except Exception as e:
        logger.error(f"Failed to initialize OpenTelemetry provider: {e}")


def get_tracer(name: str):
    """Returns a tracer instance from the global trace provider."""
    if HAS_OPENTELEMETRY:
        return trace.get_tracer(name)
    
    # Mock tracer wrapper
    class MockSpan:
        def __enter__(self): return self
        def __exit__(self, exc_type, exc_val, exc_tb): pass
        def set_attribute(self, key, value): pass
        
    class MockTracer:
        def start_as_current_span(self, name): return MockSpan()
        
    return MockTracer()


# 3. Initialize Sentry Error Tracking
def init_sentry_tracking() -> None:
    """Initializes Sentry exception collection portal."""
    sentry_dsn = os.getenv("SENTRY_DSN", "")
    if not sentry_dsn:
        logger.info("Sentry DSN not found. Standard logs will be used for exception tracking.")
        return
        
    if not HAS_SENTRY:
        logger.warning("Sentry DSN present but sentry_sdk package is missing.")
        return
        
    try:
        sentry_sdk.init(
            dsn=sentry_dsn,
            traces_sample_rate=1.0,
            profiles_sample_rate=1.0,
        )
        logger.info("Sentry SDK error monitoring successfully initialized.")
    except Exception as e:
        logger.error(f"Failed to start Sentry SDK: {e}")
