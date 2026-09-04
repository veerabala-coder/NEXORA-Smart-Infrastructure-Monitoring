import express from "express";
import "dotenv/config";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

const router = express.Router();


// =====================================================
// CREATE PROJECT
// POST /api/projects
// =====================================================

router.post(
  "/",
  authenticateToken,
  authorizeRoles("ADMIN", "OFFICER", "CONTRACTOR"),
  async (req, res) => {
    try {
      const {
        name,
        description,
        location,
        budget,
        progress,
        status,
        startDate,
        endDate,
        manager,
      } = req.body || {};

      if (!name || !location || !startDate || !endDate) {
        return res.status(400).json({
          message:
            "Name, location, start date and end date are required",
        });
      }

      const project = await prisma.project.create({
        data: {
          name,
          description: description || null,
          location,
          budget:
            budget !== undefined &&
            budget !== null &&
            budget !== ""
              ? Number(budget)
              : null,

          progress:
            progress !== undefined &&
            progress !== null &&
            progress !== ""
              ? Number(progress)
              : 0,

          status: status || "ON_TRACK",

          startDate: new Date(startDate),

          endDate: new Date(endDate),

          manager: manager || null,
        },
      });

      return res.status(201).json({
        message: "Project created successfully",
        project,
      });

    } catch (error) {
      console.error("Create project error:", error);

      return res.status(500).json({
        message: "Failed to create project",
        error: error.message,
      });
    }
  }
);


// =====================================================
// GET ALL PROJECTS
// GET /api/projects
// =====================================================

router.get(
  "/",
  authenticateToken,
  async (req, res) => {
    try {
      const projects = await prisma.project.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });

      return res.status(200).json({
        projects,
      });

    } catch (error) {
      console.error("Get projects error:", error);

      return res.status(500).json({
        message: "Failed to fetch projects",
        error: error.message,
      });
    }
  }
);


// =====================================================
// GET SINGLE PROJECT
// GET /api/projects/:id
// =====================================================

router.get(
  "/:id",
  authenticateToken,
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      if (!Number.isInteger(id)) {
        return res.status(400).json({
          message: "Invalid project ID",
        });
      }

      const project = await prisma.project.findUnique({
        where: {
          id,
        },
      });

      if (!project) {
        return res.status(404).json({
          message: "Project not found",
        });
      }

      return res.status(200).json({
        project,
      });

    } catch (error) {
      console.error("Get project error:", error);

      return res.status(500).json({
        message: "Failed to fetch project",
        error: error.message,
      });
    }
  }
);


// =====================================================
// UPDATE PROJECT
// PUT /api/projects/:id
// =====================================================

router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("ADMIN", "OFFICER", "CONTRACTOR"),
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      if (!Number.isInteger(id)) {
        return res.status(400).json({
          message: "Invalid project ID",
        });
      }

      const {
        name,
        description,
        location,
        budget,
        progress,
        status,
        startDate,
        endDate,
        manager,
      } = req.body || {};

      const project = await prisma.project.update({
        where: {
          id,
        },

        data: {
          ...(name !== undefined && {
            name,
          }),

          ...(description !== undefined && {
            description,
          }),

          ...(location !== undefined && {
            location,
          }),

          ...(budget !== undefined && {
            budget:
              budget === null || budget === ""
                ? null
                : Number(budget),
          }),

          ...(progress !== undefined && {
            progress: Number(progress),
          }),

          ...(status !== undefined && {
            status,
          }),

          ...(startDate !== undefined && {
            startDate: new Date(startDate),
          }),

          ...(endDate !== undefined && {
            endDate: new Date(endDate),
          }),

          ...(manager !== undefined && {
            manager,
          }),
        },
      });

      return res.status(200).json({
        message: "Project updated successfully",
        project,
      });

    } catch (error) {
      console.error("Update project error:", error);

      return res.status(500).json({
        message: "Failed to update project",
        error: error.message,
      });
    }
  }
);


// =====================================================
// DELETE PROJECT
// DELETE /api/projects/:id
// =====================================================

router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("ADMIN", "OFFICER"),
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      if (!Number.isInteger(id)) {
        return res.status(400).json({
          message: "Invalid project ID",
        });
      }

      await prisma.project.delete({
        where: {
          id,
        },
      });

      return res.status(200).json({
        message: "Project deleted successfully",
      });

    } catch (error) {
      console.error("Delete project error:", error);

      return res.status(500).json({
        message: "Failed to delete project",
        error: error.message,
      });
    }
  }
);


export default router;