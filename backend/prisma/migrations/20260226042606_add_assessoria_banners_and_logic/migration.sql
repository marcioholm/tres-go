/*
  Warnings:

  - You are about to drop the column `conversionRateGoal` on the `WorkspacePerformanceConfig` table. All the data in the column will be lost.
  - You are about to drop the column `defaultReportPeriod` on the `WorkspacePerformanceConfig` table. All the data in the column will be lost.
  - You are about to drop the column `firstResponseGoal` on the `WorkspacePerformanceConfig` table. All the data in the column will be lost.
  - You are about to drop the column `inactivityThreshold` on the `WorkspacePerformanceConfig` table. All the data in the column will be lost.
  - You are about to drop the column `manualAttribution` on the `WorkspacePerformanceConfig` table. All the data in the column will be lost.
  - You are about to drop the column `reportVisibility` on the `WorkspacePerformanceConfig` table. All the data in the column will be lost.
  - You are about to drop the column `resetTimerOnTransfer` on the `WorkspacePerformanceConfig` table. All the data in the column will be lost.
  - You are about to drop the column `resolutionGoal` on the `WorkspacePerformanceConfig` table. All the data in the column will be lost.
  - You are about to drop the column `saleAttribution` on the `WorkspacePerformanceConfig` table. All the data in the column will be lost.
  - You are about to drop the column `timeCalculation` on the `WorkspacePerformanceConfig` table. All the data in the column will be lost.
  - You are about to drop the column `transferCountsConversion` on the `WorkspacePerformanceConfig` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "BannerType" AS ENUM ('INFO', 'WARNING', 'SUCCESS', 'UPSELL', 'FEATURE', 'EDUCATIONAL', 'SOCIAL_PROOF', 'PROMO');

-- CreateEnum
CREATE TYPE "BannerPosition" AS ENUM ('DASHBOARD_TOP', 'SIDEBAR', 'INBOX_EMPTY', 'MODAL');

-- CreateEnum
CREATE TYPE "SalesAssignmentRule" AS ENUM ('LAST_INTERACTION', 'FIRST_INTERACTION', 'LINEAR', 'MANUAL');

-- CreateEnum
CREATE TYPE "DefaultViewPeriod" AS ENUM ('TODAY', 'LAST_7_DAYS', 'LAST_30_DAYS', 'THIS_MONTH');

-- AlterEnum
ALTER TYPE "SessionEndReason" ADD VALUE 'REOPENED';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "mainChallenge" TEXT,
ADD COLUMN     "onboardingModalShown" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "onboardingStep" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "referralSource" TEXT,
ADD COLUMN     "teamSize" TEXT;

-- AlterTable
ALTER TABLE "WorkspacePerformanceConfig" DROP COLUMN "conversionRateGoal",
DROP COLUMN "defaultReportPeriod",
DROP COLUMN "firstResponseGoal",
DROP COLUMN "inactivityThreshold",
DROP COLUMN "manualAttribution",
DROP COLUMN "reportVisibility",
DROP COLUMN "resetTimerOnTransfer",
DROP COLUMN "resolutionGoal",
DROP COLUMN "saleAttribution",
DROP COLUMN "timeCalculation",
DROP COLUMN "transferCountsConversion",
ADD COLUMN     "autoAssignLeads" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "defaultViewPeriod" "DefaultViewPeriod" NOT NULL DEFAULT 'LAST_7_DAYS',
ADD COLUMN     "firstResponseSlaMinutes" INTEGER NOT NULL DEFAULT 15,
ADD COLUMN     "idleConversationAlertMinutes" INTEGER NOT NULL DEFAULT 30,
ADD COLUMN     "salesAssignmentRule" "SalesAssignmentRule" NOT NULL DEFAULT 'LAST_INTERACTION',
ADD COLUMN     "showRevenueToAgents" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "targetConversionRate" DOUBLE PRECISION NOT NULL DEFAULT 30.0,
ADD COLUMN     "targetCsat" DOUBLE PRECISION NOT NULL DEFAULT 4.5,
ADD COLUMN     "targetMonthlyVolume" INTEGER NOT NULL DEFAULT 100;

-- DropEnum
DROP TYPE "ReportPeriod";

-- DropEnum
DROP TYPE "ReportVisibility";

-- DropEnum
DROP TYPE "SaleAttribution";

-- DropEnum
DROP TYPE "TimeCalculation";

-- CreateTable
CREATE TABLE "SmartBanner" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "ctaText" TEXT,
    "ctaUrl" TEXT,
    "type" "BannerType" NOT NULL DEFAULT 'INFO',
    "position" "BannerPosition" NOT NULL DEFAULT 'DASHBOARD_TOP',
    "triggerCondition" TEXT,
    "targetNiche" TEXT,
    "targetPlan" TEXT,
    "minTrialDays" INTEGER,
    "maxTrialDays" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "views" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SmartBanner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BannerDismissal" (
    "id" TEXT NOT NULL,
    "bannerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dismissedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BannerDismissal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BannerDismissal_bannerId_userId_key" ON "BannerDismissal"("bannerId", "userId");

-- AddForeignKey
ALTER TABLE "BannerDismissal" ADD CONSTRAINT "BannerDismissal_bannerId_fkey" FOREIGN KEY ("bannerId") REFERENCES "SmartBanner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BannerDismissal" ADD CONSTRAINT "BannerDismissal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
