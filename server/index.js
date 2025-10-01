import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import userRoutes from "./routes/userRoutes.js";
import documentRoutes from "./routes/documentRouter.js";
// import mongoose from "mongoose";
import connectDB from "./config/db.js";
import { createRedisClient, createAdapterClients } from "./config/redis.js";
import initSocket from "./utils/socket.js";
dotenv.config();
const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"], // allow your frontend(s)
    credentials: true, // allow cookies/auth headers if needed
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

// A simple route for the root URL
app.get("/", (req, res) => {
  res.send("Hello, World! This is an Express server.");
});

// User-related routes
app.use("/user", userRoutes);
// Document-related routes
app.use("/documents", documentRoutes);

// Error handling middleware
app.use((err, req, res, _next) => {
  console.error(err);
  res.status(400).json({ message: err.message || "Unexpected error" });
});

// Initialize and start the server
async function startServer() {
  try {
    // Connect to database
    await connectDB();

    // Initialize Redis client for caching and autosave buffer
    const cacheRedisClient = await createRedisClient();

    // Initialize Socket.IO with Redis adapter
    // initSocket attaches adapter (pub/sub) and uses cacheRedisClient internally
    await initSocket(server, cacheRedisClient, createAdapterClients);

    // Start the HTTP server
    server.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (err) {
    console.error("Failed to initialize server components:", err);
    process.exit(1);
  }
}

// Start the server
startServer();
