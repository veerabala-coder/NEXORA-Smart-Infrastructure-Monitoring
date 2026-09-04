import express from "express";
import cors from "cors";
import "dotenv/config";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

const app = express();

app.use(cors());
app.use(express.json());

// ===============================
// AUTH ROUTES
// ===============================
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);

// ===============================
// HOME
// ===============================
app.get("/", (req, res) => {
  res.json({
    message: "NEXORA API is running 🚀",
    status: "success",
  });
});

// ===============================
// DATABASE TEST
// ===============================
app.get("/api/db-test", async (req, res) => {
  try {
    const result = await prisma.$queryRaw`SELECT NOW()`;

    res.json({
      message: "Database connection successful ✅",
      time: result,
    });
  } catch (error) {
    console.error("Database connection error:", error);

    res.status(500).json({
      message: "Database connection failed ❌",
      error: error.message,
    });
  }
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`NEXORA server running on http://localhost:${PORT}`);
});