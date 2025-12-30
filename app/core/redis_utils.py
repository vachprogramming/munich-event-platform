import redis
import time
from contextlib import contextmanager
import os

# 1. Attempt to connect to Redis
# On Render Free Tier, this will likely fail because there is no Redis service.
REDIS_AVAILABLE = False
try:
    # Set a very short timeout (1 second) so we don't hang the app waiting
    redis_client = redis.Redis(host="redis", port=6379, db=0, socket_connect_timeout=1)
    redis_client.ping() # Test connection
    REDIS_AVAILABLE = True
except Exception:
    print("⚠️ Redis not available. Running in non-concurrency mode (Safe for Demo).")
    REDIS_AVAILABLE = False

@contextmanager
def acquire_lock(lock_name: str, timeout: int = 10):
    """
    If Redis is up, uses real distributed lock.
    If Redis is down, just yields True (Mock Lock) so the app doesn't crash.
    """
    # 2. If Redis is missing, just skip the lock logic
    if not REDIS_AVAILABLE:
        yield True
        return

    # 3. If Redis works, do the real locking
    identifier = "locked"
    end_time = time.time() + timeout
    
    while time.time() < end_time:
        try:
            if redis_client.setnx(lock_name, identifier):
                redis_client.expire(lock_name, timeout)
                yield True
                redis_client.delete(lock_name)
                return
        except Exception:
            # If connection drops mid-operation, fail gracefully
            break
        
        time.sleep(0.001)
        
    # If we are here, we failed to lock, but for a demo, we might just let it slide
    # or raise an error. Let's raise to be safe, but usually we won't hit this 
    # if REDIS_AVAILABLE is False.
    raise Exception(f"Could not acquire lock for {lock_name}")