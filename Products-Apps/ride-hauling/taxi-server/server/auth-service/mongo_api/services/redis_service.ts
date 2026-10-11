import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

// Initialize the Redis client
const redisClient = new Redis(redisUrl, {
  retryStrategy: (times) => {
    // Reconnect after
    return Math.min(times * 50, 2000);
  }
});

redisClient.on('connect', () => {
  console.log('Redis connected successfully for Dispatching and Search.');
});

redisClient.on('error', (err) => {
  console.error('Redis connection error:', err);
});

export class RedisService {
  /**
   * Health check for Redis
   */
  static async isAlive() {
    try {
      const ping = await redisClient.ping();
      return ping === 'PONG';
    } catch (e) {
      return false;
    }
  }

  /**
   * Adds an active ride search to the redis queue
   */
  static async addActiveSearch(rideId: string, initialConfig: object) {
    const key = `active_search:${rideId}`;
    await redisClient.hset(key, {
      ...initialConfig,
      start_time: Date.now(),
      level: 0
    });
    // Expire the key after 1 hour maximum just to avoid stale memory
    await redisClient.expire(key, 3600);
    await redisClient.sadd('active_searches', rideId);
  }

  /**
   * Remove an active search when it is completed, cancelled or timed out
   */
  static async removeActiveSearch(rideId: string) {
    await redisClient.del(`active_search:${rideId}`);
    await redisClient.srem('active_searches', rideId);
  }

  /**
   * Update the iteration level for a search
   */
  static async updateSearchLevel(rideId: string, level: number) {
    await redisClient.hset(`active_search:${rideId}`, 'level', level);
  }

  /**
   * Get all currently active searches
   */
  static async getActiveSearches() {
    const activeIds = await redisClient.smembers('active_searches');
    const searches = [];
    
    for (const id of activeIds) {
      const data = await redisClient.hgetall(`active_search:${id}`);
      if (Object.keys(data).length === 0) {
        // Orphaned ID
        await redisClient.srem('active_searches', id);
      } else {
        searches.push({ rideId: id, ...data });
      }
    }
    return searches;
  }
}

export default redisClient;
