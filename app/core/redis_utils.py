import redis
import time
from contextlib import contextmanager

# Connecting to the Redis container
# Host is "redis" because that's the service name in docker-compose.yml
redis_client = redis.Redis(host="redis", port=6379, db=0)

@contextmanager
def acquire_lock(lock_name: str, timeout: int = 10):
    """
    Tries to acquire a lock. If it's taken, it waits (blocks) until timeout.
    Usage:
        with acquire_lock("my_resource"):
            # do critical stuff
    """
    identifier = "locked"
    end_time = time.time() + timeout
    
    while time.time() < end_time:
        # If it returns True, we got the lock!
        if redis_client.setnx(lock_name, identifier):
            # Set an expiration so the lock doesn't stay forever if the app crashes
            redis_client.expire(lock_name, timeout)
            yield True
            # When we exit the 'with' block, we release the lock
            redis_client.delete(lock_name)
            return
        
        # If we didn't get the lock, wait a tiny bit and try again
        time.sleep(0.001)
        
    # If we waited too long and still didn't get it:
    raise Exception(f"Could not acquire lock for {lock_name}")