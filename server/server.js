// server.js
import http from 'http';
import dotenv from 'dotenv';
import app from './src/app.js';
import { connectDB } from './src/config/db.js';
import { createRedisClient, createAdapterClients } from './src/config/redis.js';
import initSocket from './src/socket/index.js';

dotenv.config();

const PORT = process.env.PORT || 4000;
const server = http.createServer(app);

async function start() {
  await connectDB();

  // Redis client for caching and autosave buffer
  const cacheRedisClient = await createRedisClient();

  // init socket with server, cache client and adapter creator function
  // initSocket attaches adapter (pub/sub) and uses cacheRedisClient internally
  await initSocket(server, cacheRedisClient, createAdapterClients);

  server.listen(PORT, () => console.log(`Server running on ${PORT}`));
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
