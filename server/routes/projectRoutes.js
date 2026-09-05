import express from "express";
import "dotenv/config";
import pg from "pg";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

// ======================================================
// FINANCIAL / RISK CALCULATION
// ======================================================

function enrichProject(project) {
  const approvedBudget = Number(project.budget || 0);

  const amountSpent = Number(
    project.amountSpent || 0
  );

  const estimatedFinalCost =
    project.estimatedFinalCost !== null &&
    project.estimatedFinalCost !== undefined
      ? Number(project.estimatedFinalCost)
      : approvedBudget;

  const remainingBudget =
    approvedBudget - amountSpent;

  const additionalFunding = Math.max(
    estimatedFinalCost - approvedBudget,
    0
  );

  const overrunPercentage =
    approvedBudget > 0
      ? (additionalFunding / approvedBudget) * 100
      : 0;

  let financialStatus = "WITHIN_BUDGET";

  if (additionalFunding <= 0) {
    financialStatus = "WITHIN_BUDGET";
  } else if (overrunPercentage <= 5) {
    financialStatus = "BUDGET_WATCH";
  } else if (overrunPercentage <= 15) {
    financialStatus = "FUNDING_RISK";
  } else {
    financialStatus = "CRITICAL_FUNDING_REQUIRED";
  }

  const budgetUtilization =
    approvedBudget > 0
      ? (amountSpent / approvedBudget) * 100
      : 0;

  let riskLevel = "LOW";

  if (financialStatus === "CRITICAL_FUNDING_REQUIRED") {
    riskLevel = "CRITICAL";
  } else if (
    financialStatus === "FUNDING_RISK"
  ) {
    riskLevel = "HIGH";
  } else if (
    project.status === "DELAYED"
  ) {
    riskLevel = "HIGH";
  } else if (
    project.status === "AT_RISK" ||
    financialStatus === "BUDGET_WATCH" ||
    Number(project.progress || 0) < 30
  ) {
    riskLevel = "MEDIUM";
  }

  return {
    ...project,

    approvedBudget,

    amountSpent,

    estimatedFinalCost,

    remainingBudget,

    additionalFunding,

    overrunPercentage: Number(
      overrunPercentage.toFixed(2)
    ),

    budgetUtilization: Number(
      budgetUtilization.toFixed(2)
    ),

    financialStatus,

    riskLevel,

    fundingRequired:
      additionalFunding > 0,
  };
}

// ======================================================
// NORMALIZE JSON DATA
// ======================================================

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

// ======================================================
// CREATE PROJECT
// ======================================================

router.post(
  "/",
  authenticateToken,
  authorizeRoles(
    "ADMIN",
    "OFFICER",
    "CONTRACTOR"
  ),
  async (req, res) => {
    try {
      const {
        name,
        description,
        location,
        budget,
        amountSpent,
        estimatedFinalCost,
        progress,
        status,
        startDate,
        endDate,
        manager,
        issues,
        milestones,
        risks,
        activities,
      } = req.body;

      if (
        !name ||
        !location ||
        !startDate ||
        !endDate
      ) {
        return res.status(400).json({
          message:
            "Name, location, start date and end date are required.",
        });
      }

      const project = await prisma.project.create({
        data: {
          name,
          description:
            description || null,

          location,

          budget:
            budget !== null &&
            budget !== undefined &&
            budget !== ""
              ? Number(budget)
              : null,

          amountSpent:
            amountSpent !== null &&
            amountSpent !== undefined &&
            amountSpent !== ""
              ? Number(amountSpent)
              : null,

          estimatedFinalCost:
            estimatedFinalCost !== null &&
            estimatedFinalCost !== undefined &&
            estimatedFinalCost !== ""
              ? Number(estimatedFinalCost)
              : null,

          progress: Math.max(
            0,
            Math.min(
              100,
              Number(progress || 0)
            )
          ),

          status:
            status || "ON_TRACK",

          startDate: new Date(startDate),

          endDate: new Date(endDate),

          manager:
            manager || null,

          issues:
            issues || null,

          milestones:
            normalizeArray(milestones),

          risks:
            normalizeArray(risks),

          activities:
            normalizeArray(activities),
        },
      });

      res.status(201).json({
        message: "Project created successfully.",
        project: enrichProject(project),
      });
    } catch (error) {
      console.error(
        "Create project error:",
        error
      );

      res.status(500).json({
        message: "Failed to create project.",
        error: error.message,
      });
    }
  }
);

// ======================================================
// GET ALL PROJECTS
// ======================================================

router.get(
  "/",
  authenticateToken,
  async (req, res) => {
    try {
      const projects =
        await prisma.project.findMany({
          orderBy: {
            createdAt: "desc",
          },
        });

      res.json({
        projects:
          projects.map(enrichProject),
      });
    } catch (error) {
      console.error(
        "Get projects error:",
        error
      );

      res.status(500).json({
        message: "Failed to fetch projects.",
        error: error.message,
      });
    }
  }
);

// ======================================================
// GET SINGLE PROJECT
// ======================================================

router.get(
  "/:id",
  authenticateToken,
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      if (!Number.isInteger(id)) {
        return res.status(400).json({
          message: "Invalid project ID.",
        });
      }

      const project =
        await prisma.project.findUnique({
          where: { id },
        });

      if (!project) {
        return res.status(404).json({
          message: "Project not found.",
        });
      }

      res.json({
        project: enrichProject(project),
      });
    } catch (error) {
      console.error(
        "Get project error:",
        error
      );

      res.status(500).json({
        message: "Failed to fetch project.",
        error: error.message,
      });
    }
  }
);

// ======================================================
// UPDATE PROJECT
// ======================================================

router.put(
  "/:id",
  authenticateToken,
  authorizeRoles(
    "ADMIN",
    "OFFICER",
    "CONTRACTOR"
  ),
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      if (!Number.isInteger(id)) {
        return res.status(400).json({
          message: "Invalid project ID.",
        });
      }

      const existing =
        await prisma.project.findUnique({
          where: { id },
        });

      if (!existing) {
        return res.status(404).json({
          message: "Project not found.",
        });
      }

      const {
        name,
        description,
        location,
        budget,
        amountSpent,
        estimatedFinalCost,
        progress,
        status,
        startDate,
        endDate,
        manager,
        issues,
        milestones,
        risks,
        activities,
      } = req.body;

      const project =
        await prisma.project.update({
          where: { id },

          data: {
            name:
              name !== undefined
                ? name
                : existing.name,

            description:
              description !== undefined
                ? description
                : existing.description,

            location:
              location !== undefined
                ? location
                : existing.location,

            budget:
              budget !== undefined
                ? budget === null ||
                  budget === ""
                  ? null
                  : Number(budget)
                : existing.budget,

            amountSpent:
              amountSpent !== undefined
                ? amountSpent === null ||
                  amountSpent === ""
                  ? null
                  : Number(amountSpent)
                : existing.amountSpent,

            estimatedFinalCost:
              estimatedFinalCost !== undefined
                ? estimatedFinalCost === null ||
                  estimatedFinalCost === ""
                  ? null
                  : Number(
                      estimatedFinalCost
                    )
                : existing.estimatedFinalCost,

            progress:
              progress !== undefined
                ? Math.max(
                    0,
                    Math.min(
                      100,
                      Number(progress)
                    )
                  )
                : existing.progress,

            status:
              status !== undefined
                ? status
                : existing.status,

            startDate:
              startDate !== undefined
                ? new Date(startDate)
                : existing.startDate,

            endDate:
              endDate !== undefined
                ? new Date(endDate)
                : existing.endDate,

            manager:
              manager !== undefined
                ? manager || null
                : existing.manager,

            issues:
              issues !== undefined
                ? issues || null
                : existing.issues,

            milestones:
              milestones !== undefined
                ? normalizeArray(milestones)
                : existing.milestones,

            risks:
              risks !== undefined
                ? normalizeArray(risks)
                : existing.risks,

            activities:
              activities !== undefined
                ? normalizeArray(activities)
                : existing.activities,
          },
        });

      res.json({
        message: "Project updated successfully.",
        project: enrichProject(project),
      });
    } catch (error) {
      console.error(
        "Update project error:",
        error
      );

      res.status(500).json({
        message: "Failed to update project.",
        error: error.message,
      });
    }
  }
);

// ======================================================
// DELETE PROJECT
// ======================================================

router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles(
    "ADMIN",
    "OFFICER"
  ),
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      if (!Number.isInteger(id)) {
        return res.status(400).json({
          message: "Invalid project ID.",
        });
      }

      const existing =
        await prisma.project.findUnique({
          where: { id },
        });

      if (!existing) {
        return res.status(404).json({
          message: "Project not found.",
        });
      }

      await prisma.project.delete({
        where: { id },
      });

      res.json({
        message:
          "Project deleted successfully.",
      });
    } catch (error) {
      console.error(
        "Delete project error:",
        error
      );

      res.status(500).json({
        message: "Failed to delete project.",
        error: error.message,
      });
    }
  }
);

export default router;