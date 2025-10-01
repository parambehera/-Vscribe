import Redis from "ioredis";
import dotenv from "dotenv";
dotenv.config();

const redisCredentials = {
  port: Number(process.env.REDIS_PORT),
  host: process.env.REDIS_HOST,
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
};

// redis client
export async function createRedisClient() {
  const client = new Redis(redisCredentials);
  return client;
}

// pub/sub clients for socket.io-redis adapter
export async function createAdapterClients() {
  const pubClient = new Redis(redisCredentials);
  const subClient = new Redis(redisCredentials);
  return { pubClient, subClient };
}
