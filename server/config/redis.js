import Redis from "ioredis";
import dotenv from "dotenv";
dotenv.config();

export async function createRedisClient() {
  const client = new Redis({
    port: Number(process.env.REDIS_PORT),
    host: process.env.REDIS_HOST,
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
  });
  return client;
}

/**
 * Create pub/sub clients for Socket.IO adapter.
 */
export async function createAdapterClients() {
  const pubClient = new Redis({
    port: Number(process.env.REDIS_PORT),
    host: process.env.REDIS_HOST,
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
  });
  const subClient = new Redis({
    port: Number(process.env.REDIS_PORT),
    host: process.env.REDIS_HOST,
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
  });
  return { pubClient, subClient };
}
