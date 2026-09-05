-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "activities" JSONB,
ADD COLUMN     "amountSpent" DOUBLE PRECISION,
ADD COLUMN     "estimatedFinalCost" DOUBLE PRECISION,
ADD COLUMN     "issues" TEXT,
ADD COLUMN     "milestones" JSONB,
ADD COLUMN     "risks" JSONB;
