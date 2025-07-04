import express from "express";
import cors from "cors";
import fs from "fs";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import documentRoutes from "./src/routes/documentRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";
import { errorHandler } from "./src/middleware/errorHandler.js";
import { uploadsDir } from "./config/paths.js";
// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log(`Created uploads directory at: ${uploadsDir}`);
} else {
  console.log(`Uploads directory exists at: ${uploadsDir}`);
  const files = fs.readdirSync(uploadsDir);
  console.log(`Files in uploads directory: ${files.join(", ")}`);
}

// Connect to MongoDB
connectDB();

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:3000",
    ],
    credentials: true,
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", documentRoutes); // optionally remove if duplicated
app.use("/api/documents", documentRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
  });
});

// Default root route
app.get('/', (req, res) => {
  res.send('Document Signer API is running!');
});


// Global error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running at: http://localhost:${PORT}`);
  console.log(
    `📊 Health check available at: http://localhost:${PORT}/api/health`
  );
});
