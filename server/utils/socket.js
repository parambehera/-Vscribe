import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import Document from "../models/Document.model.js";
import { createRedisClient, createAdapterClients } from "./../config/redis.js";


export default async function initSocket(
  server,
  cacheRedisClient,
  adapterClientsCreator
) {
  const io = new Server(server, {
    cors: {
      origin: ["http://localhost:5173", "http://localhost:5174"],
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    },
  });

  try {
    const { pubClient, subClient } = await adapterClientsCreator();
    io.adapter(createAdapter(pubClient, subClient));
    console.log(
      "Socket.IO Redis adapter attached — horizontal scaling enabled"
    );
  } catch (err) {
    console.error("Failed to attach Redis adapter", err);
  }

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // 🔹 Join document
    socket.on("join-document", async ({ docId, userId }) => {
      if (!docId) return;
      socket.join(docId);
      try {
        let cached = await cacheRedisClient.get(`doc:${docId}`);
        if (cached == null) {
          const doc = await Document.findById(docId);
          cached = doc ? doc.content : "";
          await cacheRedisClient.set(`doc:${docId}`, cached);
        }
        socket.emit("document", { content: cached });
        socket.to(docId).emit("user-joined", { userId });
      } catch (err) {
        console.error("join-document error", err);
      }
    });

    // 🔹 Broadcast changes (no autosave, only sync to others + cache)
    // 🔹 Broadcast changes (no autosave, only sync to others + cache)
    socket.on("doc-changes", async ({ docId, delta, content }) => {
      // broadcast both delta and latest content — clients can apply delta or fall back to content
      socket.to(docId).emit("remote-changes", { delta, content });

      if (typeof content === "string") {
        try {
          await cacheRedisClient.set(`doc:${docId}`, content);
        } catch (err) {
          console.error("redis set error", err);
        }
      }
    });

    // 🔹 Manual save (only when user clicks save button)
    socket.on("save-document", async ({ docId }) => {
      try {
        const latest = await cacheRedisClient.get(`doc:${docId}`);
        await Document.findOneAndUpdate(
          { _id: docId },
          { content: latest, $inc: { version: 1 } },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        io.to(docId).emit("document-saved", { docId });
        console.log("✅ Document saved manually:", docId);
      } catch (err) {
        console.error("save-document error", err);
      }
    });

    // 🔹 Cursor sync
    socket.on("cursor-update", ({ docId, userId, range, color }) => {
      socket.to(docId).emit("cursor-update", { userId, range, color });
    });

    // 🔹 Handle user leaving
    socket.on("disconnecting", () => {
      const rooms = Array.from(socket.rooms);
      rooms.forEach((room) => {
        if (room !== socket.id) {
          socket.to(room).emit("user-left", { userId: socket.id });
        }
      });
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", socket.id, reason);
    });
  });

  return io;
}
