import threading
import time
from collections import defaultdict, deque

from fastapi import HTTPException, Request, status

# In-memory sliding window, keyed by scope + client IP. Raw IPs live only here and
# are dropped after the window, never written to the database.
#
# Limits: one process only. Move to Redis if you run several workers.
# Behind a proxy (Render, nginx) start uvicorn with --proxy-headers, otherwise every
# request looks like it comes from the proxy's IP.
# Mobile carriers share IPs between many users, so keep limits generous.

_hits: dict = defaultdict(deque)
_lock = threading.Lock()
_MAX_WINDOW_SECONDS = 3600
_calls_since_sweep = 0


def _sweep(now: float) -> None:
    """Drop keys that have been idle longer than the largest window."""
    stale = [k for k, q in _hits.items() if not q or now - q[-1] > _MAX_WINDOW_SECONDS]
    for key in stale:
        del _hits[key]


def rate_limit(max_calls: int, window_seconds: int, scope: str):
    """Dependency factory: allow `max_calls` per `window_seconds` per IP for `scope`."""

    def dependency(request: Request) -> None:
        global _calls_since_sweep
        ip = request.client.host if request.client else "unknown"
        key = f"{scope}:{ip}"
        now = time.monotonic()

        with _lock:
            _calls_since_sweep += 1
            if _calls_since_sweep >= 1000:
                _calls_since_sweep = 0
                _sweep(now)

            hits = _hits[key]
            while hits and now - hits[0] > window_seconds:
                hits.popleft()

            if len(hits) >= max_calls:
                retry_after = int(window_seconds - (now - hits[0])) + 1
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Too many requests. Please slow down.",
                    headers={"Retry-After": str(retry_after)},
                )
            hits.append(now)

    return dependency
