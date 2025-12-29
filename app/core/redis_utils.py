import redis
import time
from contextlib import contextmanager
import os

# Check if we are in production (Render) or local
# On Render, we usually won't have a separate Redis unless we pay.
# So we default to None if the host 'redis' isn't found.
try:
    # Try to connect with a short timeout
    redis_client = redis.Redis(host="redis", port=6379, db=0, socket_connect_timeout=1)
    redis_client.ping() # Check connection
    REDIS_AVAILABLE = True
except Exception:
    print("⚠️ Redis not available. Running in non-concurrency mode.")
    REDIS_AVAILABLE = False

@contextmanager
def acquire_lock(lock_name: str, timeout: int = 10):
    """
    If Redis is up, uses real distributed lock.
    If Redis is down, just pretends to lock (Mock) so the app doesn't crash.
    """
    if not REDIS_AVAILABLE:
        # Fake lock for demo/cloud without Redis
        yield True
        return

    identifier = "locked"
    end_time = time.time() + timeout
    
    while time.time() < end_time:
        if redis_client.setnx(lock_name, identifier):
            redis_client.expire(lock_name, timeout)
            yield True
            redis_client.delete(lock_name)
            return
        time.sleep(0.001)
        
    raise Exception(f"Could not acquire lock for {lock_name}")