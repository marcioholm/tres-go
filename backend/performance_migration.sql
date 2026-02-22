-- CreateEnum
CREATE TYPE "SaleAttribution" AS ENUM ('LAST_AGENT', 'FIRST_AGENT', 'EQUAL_SPLIT', 'MANUAL');

-- CreateEnum
CREATE TYPE "TimeCalculation" AS ENUM ('TOTAL', 'ACTIVE_ONLY');

-- CreateEnum
CREATE TYPE "ReportVisibility" AS ENUM ('ADMIN_ONLY', 'ALL_AGENTS');

-- CreateEnum
CREATE TYPE "ReportPeriod" AS ENUM ('WEEKLY', 'MONTHLY', 'CUSTOM');

-- CreateEnum
CREATE TYPE "SessionEndReason" AS ENUM ('RESOLVED', 'TRANSFERRED', 'REASSIGNED');

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "senderName" TEXT;

-- CreateTable
CREATE TABLE "WorkspacePerformanceConfig" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "saleAttribution" "SaleAttribution" NOT NULL DEFAULT 'LAST_AGENT',
    "manualAttribution" BOOLEAN NOT NULL DEFAULT false,
    "timeCalculation" "TimeCalculation" NOT NULL DEFAULT 'ACTIVE_ONLY',
    "inactivityThreshold" INTEGER NOT NULL DEFAULT 30,
    "resetTimerOnTransfer" BOOLEAN NOT NULL DEFAULT false,
    "transferCountsConversion" BOOLEAN NOT NULL DEFAULT false,
    "firstResponseGoal" INTEGER NOT NULL DEFAULT 5,
    "resolutionGoal" INTEGER NOT NULL DEFAULT 1440,
    "conversionRateGoal" DOUBLE PRECISION NOT NULL DEFAULT 30.0,
    "reportVisibility" "ReportVisibility" NOT NULL DEFAULT 'ADMIN_ONLY',
    "defaultReportPeriod" "ReportPeriod" NOT NULL DEFAULT 'MONTHLY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkspacePerformanceConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConversationSession" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "endReason" "SessionEndReason",
    "durationMinutes" INTEGER,
    "messagesSent" INTEGER NOT NULL DEFAULT 0,
    "messagesReceived" INTEGER NOT NULL DEFAULT 0,
    "firstResponseAt" TIMESTAMP(3),
    "firstResponseMinutes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConversationSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConversationConversion" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "primaryAgentId" TEXT,
    "allAgentIds" TEXT[],
    "value" DOUBLE PRECISION,
    "convertedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "convertedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConversationConversion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WorkspacePerformanceConfig_workspaceId_key" ON "WorkspacePerformanceConfig"("workspaceId");

-- CreateIndex
CREATE INDEX "ConversationSession_agentId_idx" ON "ConversationSession"("agentId");

-- CreateIndex
CREATE INDEX "ConversationSession_conversationId_idx" ON "ConversationSession"("conversationId");

-- CreateIndex
CREATE UNIQUE INDEX "ConversationConversion_conversationId_key" ON "ConversationConversion"("conversationId");

-- AddForeignKey
ALTER TABLE "WorkspacePerformanceConfig" ADD CONSTRAINT "WorkspacePerformanceConfig_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationSession" ADD CONSTRAINT "ConversationSession_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationSession" ADD CONSTRAINT "ConversationSession_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationConversion" ADD CONSTRAINT "ConversationConversion_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationConversion" ADD CONSTRAINT "ConversationConversion_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

