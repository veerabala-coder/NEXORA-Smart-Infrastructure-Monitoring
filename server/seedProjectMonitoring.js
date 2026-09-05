import "dotenv/config";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

const monitoringData = {
  "Cuddalore Coastal Drainage Project": {
    amountSpent: 185000000,
    estimatedFinalCost: 275000000,
    issues:
      "Material cost increase and monsoon-related construction interruption.",
    milestones: [
      { name: "Survey & Design", status: "Completed", progress: 100 },
      { name: "Drain Construction", status: "In Progress", progress: 72 },
      { name: "Pumping Station", status: "In Progress", progress: 48 },
      { name: "Final Inspection", status: "Pending", progress: 0 }
    ],
    risks: [
      {
        title: "Material Cost Increase",
        level: "HIGH",
        description: "Construction material prices have increased."
      },
      {
        title: "Monsoon Delay",
        level: "MEDIUM",
        description: "Heavy rainfall may affect construction activities."
      }
    ],
    activities: [
      {
        date: "2026-08-28",
        text: "Drain construction progress updated to 72%."
      },
      {
        date: "2026-08-25",
        text: "Material cost review completed."
      }
    ]
  },

  "Perambalur Solar Energy Infrastructure": {
    amountSpent: 125000000,
    estimatedFinalCost: 155000000,
    issues:
      "Grid integration approval is taking longer than expected.",
    milestones: [
      { name: "Site Survey", status: "Completed", progress: 100 },
      { name: "Solar Panel Installation", status: "In Progress", progress: 78 },
      { name: "Grid Integration", status: "In Progress", progress: 42 },
      { name: "Commissioning", status: "Pending", progress: 0 }
    ],
    risks: [
      {
        title: "Grid Integration",
        level: "HIGH",
        description: "Approval and connection activities may delay commissioning."
      },
      {
        title: "Equipment Delivery",
        level: "LOW",
        description: "Remaining equipment deliveries are being monitored."
      }
    ],
    activities: [
      {
        date: "2026-08-30",
        text: "Solar panel installation reached 78%."
      },
      {
        date: "2026-08-26",
        text: "Grid integration documentation submitted."
      }
    ]
  },

  "Ariyalur Rural Water Supply": {
    amountSpent: 72000000,
    estimatedFinalCost: 78000000,
    issues:
      "Difficult rural access is slowing pipeline installation.",
    milestones: [
      { name: "Water Source Survey", status: "Completed", progress: 100 },
      { name: "Pipeline Installation", status: "In Progress", progress: 68 },
      { name: "Overhead Tank Construction", status: "In Progress", progress: 55 },
      { name: "Water Quality Testing", status: "Pending", progress: 0 }
    ],
    risks: [
      {
        title: "Rural Access",
        level: "MEDIUM",
        description: "Remote locations are increasing transportation time."
      }
    ],
    activities: [
      {
        date: "2026-08-29",
        text: "Pipeline installation progress updated."
      },
      {
        date: "2026-08-24",
        text: "Water quality testing plan prepared."
      }
    ]
  }
};

async function main() {
  const projects = await prisma.project.findMany();

  console.log(`Found ${projects.length} projects.`);

  for (const project of projects) {
    const special = monitoringData[project.name];

    let amountSpent;
    let estimatedFinalCost;
    let issues;
    let milestones;
    let risks;
    let activities;

    if (special) {
      amountSpent = special.amountSpent;
      estimatedFinalCost = special.estimatedFinalCost;
      issues = special.issues;
      milestones = special.milestones;
      risks = special.risks;
      activities = special.activities;
    } else {
      const budget = project.budget || 0;

      const overrunRate =
        project.status === "DELAYED"
          ? 0.12
          : project.status === "AT_RISK"
            ? 0.06
            : project.id % 7 === 0
              ? 0.04
              : 0;

      estimatedFinalCost = budget * (1 + overrunRate);

      const progress = Math.max(0, Math.min(100, project.progress || 0));

      amountSpent =
        budget > 0
          ? Math.min(estimatedFinalCost, budget * (0.25 + progress / 125))
          : 0;

      if (project.status === "DELAYED") {
        issues = "Schedule delay requires close monitoring and corrective action.";
      } else if (project.status === "AT_RISK") {
        issues = "Project is progressing with identified schedule or resource risks.";
      } else if (project.status === "COMPLETED") {
        issues = "Project completed. Final financial reconciliation is pending.";
      } else {
        issues = "No major issues reported. Routine monitoring is in progress.";
      }

      milestones = [
        {
          name: "Planning & Survey",
          status: progress >= 25 ? "Completed" : "In Progress",
          progress: Math.min(100, Math.round(progress + 20))
        },
        {
          name: "Main Construction",
          status: progress >= 70 ? "Completed" : "In Progress",
          progress: Math.min(100, progress)
        },
        {
          name: "Testing & Inspection",
          status: progress >= 90 ? "In Progress" : "Pending",
          progress: progress >= 90 ? 50 : 0
        },
        {
          name: "Final Handover",
          status: progress === 100 ? "Completed" : "Pending",
          progress: progress === 100 ? 100 : 0
        }
      ];

      risks = [];

      if (project.status === "DELAYED") {
        risks.push({
          title: "Schedule Risk",
          level: "HIGH",
          description: "Project completion is behind the planned schedule."
        });
      }

      if (project.status === "AT_RISK") {
        risks.push({
          title: "Execution Risk",
          level: "MEDIUM",
          description: "Current project conditions require additional monitoring."
        });
      }

      if (overrunRate > 0) {
        risks.push({
          title: "Budget Risk",
          level: overrunRate >= 0.1 ? "HIGH" : "MEDIUM",
          description: "Estimated final cost is above the approved budget."
        });
      }

      if (risks.length === 0) {
        risks.push({
          title: "Routine Monitoring",
          level: "LOW",
          description: "No major project risks currently identified."
        });
      }

      activities = [
        {
          date: "2026-08-30",
          text: `Project progress currently at ${progress}%.`
        },
        {
          date: "2026-08-25",
          text: "Latest project monitoring review completed."
        }
      ];
    }

    await prisma.project.update({
      where: { id: project.id },
      data: {
        amountSpent,
        estimatedFinalCost,
        issues,
        milestones,
        risks,
        activities
      }
    });

    console.log(`Updated: ${project.name}`);
  }

  console.log("Project monitoring data seeded successfully.");
}

main()
  .catch((error) => {
    console.error("Seed error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });