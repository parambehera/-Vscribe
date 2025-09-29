// redis-client.js
import { createClient } from "redis";

/**
 * Create a single Redis/Valkey client (for get/set cache).
 */
export async function createRedisClient() {
  const url = process.env.VALKEY_URL || "redis://localhost:6379"; // fallback local

  const client = createClient({
    url,
    socket: url.startsWith("rediss://")
      ? { tls: true, rejectUnauthorized: false } // TLS for Aiven
      : {},
  });

  client.on("error", (err) => console.error("Redis/Valkey Client Error", err));
  client.on("connect", () => console.log("Redis/Valkey client connecting..."));
  client.on("ready", () => console.log("✅ Redis/Valkey client ready"));
  client.on("end", () => console.log("Redis/Valkey connection closed"));

  await client.connect();
  return client;
}

/**
 * Create pub/sub clients for Socket.IO adapter.
 */
export async function createAdapterClients() {
  const url = process.env.VALKEY_URL || "redis://localhost:6379";

  const pubClient = createClient({
    url,
    socket: url.startsWith("rediss://")
      ? { tls: true, rejectUnauthorized: false }
      : {},
  });

  const subClient = pubClient.duplicate();

  pubClient.on("error", (err) => console.error("Redis pubClient Error", err));
  subClient.on("error", (err) => console.error("Redis subClient Error", err));

  await pubClient.connect();
  await subClient.connect();

  console.log("✅ Redis/Valkey adapter clients connected (pub/sub)");
  return { pubClient, subClient };
}
