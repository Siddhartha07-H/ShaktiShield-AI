import time
from collections import defaultdict
from threading import Lock
from fastapi import Request, HTTPException, status

class InMemoryRateLimiter:
    def __init__(self, requests_limit: int, window_seconds: int):
        self.requests_limit = requests_limit
        self.window_seconds = window_seconds
        self.client_records = defaultdict(list)
        self.lock = Lock()

    def check(self, key: str):
        now = time.time()
        with self.lock:
            timestamps = self.client_records[key]
            # Prune timestamps older than window
            cutoff = now - self.window_seconds
            valid_timestamps = [t for t in timestamps if t > cutoff]
            if len(valid_timestamps) >= self.requests_limit:
                retry_after = int(valid_timestamps[0] + self.window_seconds - now) + 1
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=f"Rate limit exceeded. Please wait {retry_after} seconds before trying again.",
                    headers={"Retry-After": str(retry_after)}
                )
            valid_timestamps.append(now)
            self.client_records[key] = valid_timestamps

# Rate limiters for different sensitive workflows
login_limiter = InMemoryRateLimiter(requests_limit=10, window_seconds=60) # 10 attempts per minute
sos_limiter = InMemoryRateLimiter(requests_limit=5, window_seconds=60)    # 5 SOS triggers per minute
register_limiter = InMemoryRateLimiter(requests_limit=8, window_seconds=60)

def rate_limit_login(request: Request):
    client_ip = request.client.host if request.client else "unknown"
    login_limiter.check(f"login_{client_ip}")

def rate_limit_sos(request: Request):
    client_ip = request.client.host if request.client else "unknown"
    sos_limiter.check(f"sos_{client_ip}")

def rate_limit_register(request: Request):
    client_ip = request.client.host if request.client else "unknown"
    register_limiter.check(f"register_{client_ip}")
