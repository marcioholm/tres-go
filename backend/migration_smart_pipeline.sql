-- CreateEnum
CREATE TYPE "ChannelType" AS ENUM ('INSTAGRAM', 'MESSENGER', 'WHATSAPP', 'ZAPI');

-- CreateEnum
CREATE TYPE "ChannelStatus" AS ENUM ('CONNECTING', 'ACTIVE', 'ERROR', 'DISCONNECTED');

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

-- CreateEnum
CREATE TYPE "KeywordMatchType" AS ENUM ('CONTAINS', 'EXACT', 'STARTS_WITH');

-- CreateEnum
CREATE TYPE "MovedBy" AS ENUM ('AUTOMATIC', 'MANUAL');

-- DropForeignKey
ALTER TABLE "Channel" DROP CONSTRAINT "Channel_workspaceId_fkey";

-- DropForeignKey
ALTER TABLE "QuickReply" DROP CONSTRAINT "QuickReply_workspaceId_fkey";

-- AlterTable
ALTER TABLE "Channel" DROP COLUMN "isActive",
ADD COLUMN     "accessToken" TEXT,
ADD COLUMN     "displayName" TEXT,
ADD COLUMN     "igAccountId" TEXT,
ADD COLUMN     "igUsername" TEXT,
ADD COLUMN     "pageAvatar" TEXT,
ADD COLUMN     "pageId" TEXT,
ADD COLUMN     "pageName" TEXT,
ADD COLUMN     "phoneNumber" TEXT,
ADD COLUMN     "phoneNumberId" TEXT,
ADD COLUMN     "status" "ChannelStatus" NOT NULL DEFAULT 'CONNECTING',
ADD COLUMN     "wabaId" TEXT,
ADD COLUMN     "webhookSecret" TEXT,
DROP COLUMN "type",
ADD COLUMN     "type" "ChannelType" NOT NULL,
ALTER COLUMN "config" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Contact" ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "externalId" TEXT,
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "handle" TEXT,
ADD COLUMN     "lastName" TEXT,
ALTER COLUMN "name" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "convertedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "senderName" TEXT;

-- AlterTable
ALTER TABLE "QuickReply" DROP COLUMN "shortcut",
ADD COLUMN     "category" TEXT,
ADD COLUMN     "command" TEXT NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "niche" TEXT,
ALTER COLUMN "name" DROP NOT NULL;

-- CreateTable
CREATE TABLE "MetaIntegration" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "pageId" TEXT NOT NULL,
    "pageName" TEXT NOT NULL,
    "pageAccessToken" TEXT NOT NULL,
    "userAccessTokenLongLived" TEXT NOT NULL,
    "igBusinessAccountId" TEXT,
    "tokenExpiresAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'active',

    CONSTRAINT "MetaIntegration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LegalAcceptance" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "termsVersion" TEXT NOT NULL DEFAULT '1.0',
    "privacyVersion" TEXT NOT NULL DEFAULT '1.0',
    "acceptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "LegalAcceptance_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "Pipeline" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "sectorId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pipeline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PipelineStage" (
    "id" TEXT NOT NULL,
    "pipelineId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#6366f1',
    "order" INTEGER NOT NULL,
    "isConversion" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PipelineStage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PipelineKeyword" (
    "id" TEXT NOT NULL,
    "stageId" TEXT NOT NULL,
    "phrase" TEXT NOT NULL,
    "matchType" "KeywordMatchType" NOT NULL DEFAULT 'CONTAINS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PipelineKeyword_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConversationPipelineStage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "stageId" TEXT NOT NULL,
    "movedBy" "MovedBy" NOT NULL,
    "triggeredBy" TEXT,
    "movedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConversationPipelineStage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MetaIntegration_pageId_key" ON "MetaIntegration"("pageId");

-- CreateIndex
CREATE UNIQUE INDEX "LegalAcceptance_userId_key" ON "LegalAcceptance"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkspacePerformanceConfig_workspaceId_key" ON "WorkspacePerformanceConfig"("workspaceId");

-- CreateIndex
CREATE INDEX "ConversationSession_agentId_idx" ON "ConversationSession"("agentId");

-- CreateIndex
CREATE INDEX "ConversationSession_conversationId_idx" ON "ConversationSession"("conversationId");

-- CreateIndex
CREATE UNIQUE INDEX "ConversationConversion_conversationId_key" ON "ConversationConversion"("conversationId");

-- CreateIndex
CREATE UNIQUE INDEX "Pipeline_sectorId_key" ON "Pipeline"("sectorId");

-- CreateIndex
CREATE INDEX "Pipeline_workspaceId_idx" ON "Pipeline"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "Pipeline_workspaceId_sectorId_key" ON "Pipeline"("workspaceId", "sectorId");

-- CreateIndex
CREATE INDEX "PipelineStage_pipelineId_idx" ON "PipelineStage"("pipelineId");

-- CreateIndex
CREATE INDEX "PipelineKeyword_stageId_idx" ON "PipelineKeyword"("stageId");

-- CreateIndex
CREATE INDEX "ConversationPipelineStage_conversationId_idx" ON "ConversationPipelineStage"("conversationId");

-- CreateIndex
CREATE INDEX "QuickReply_workspaceId_idx" ON "QuickReply"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "QuickReply_workspaceId_command_key" ON "QuickReply"("workspaceId", "command");

-- AddForeignKey
ALTER TABLE "Channel" ADD CONSTRAINT "Channel_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuickReply" ADD CONSTRAINT "QuickReply_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LegalAcceptance" ADD CONSTRAINT "LegalAcceptance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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

-- AddForeignKey
ALTER TABLE "Pipeline" ADD CONSTRAINT "Pipeline_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pipeline" ADD CONSTRAINT "Pipeline_sectorId_fkey" FOREIGN KEY ("sectorId") REFERENCES "Sector"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PipelineStage" ADD CONSTRAINT "PipelineStage_pipelineId_fkey" FOREIGN KEY ("pipelineId") REFERENCES "Pipeline"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PipelineKeyword" ADD CONSTRAINT "PipelineKeyword_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "PipelineStage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationPipelineStage" ADD CONSTRAINT "ConversationPipelineStage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationPipelineStage" ADD CONSTRAINT "ConversationPipelineStage_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "PipelineStage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

