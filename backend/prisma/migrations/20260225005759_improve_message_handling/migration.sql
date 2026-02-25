/*
  Warnings:

  - You are about to drop the column `shortcut` on the `QuickReply` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[zapiInstanceId]` on the table `Channel` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[channelId,externalId]` on the table `Message` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[workspaceId,command]` on the table `QuickReply` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `command` to the `QuickReply` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `QuickReply` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SaleAttribution" AS ENUM ('LAST_AGENT', 'FIRST_AGENT', 'EQUAL_SPLIT', 'MANUAL');

-- CreateEnum
CREATE TYPE "TimeCalculation" AS ENUM ('TOTAL', 'ACTIVE_ONLY');

-- CreateEnum
CREATE TYPE "ReportVisibility" AS ENUM ('ADMIN_ONLY', 'ALL_AGENTS');

-- CreateEnum
CREATE TYPE "ReportPeriod" AS ENUM ('WEEKLY', 'MONTHLY', 'CUSTOM');

-- CreateEnum
CREATE TYPE "KeywordMatchType" AS ENUM ('CONTAINS', 'EXACT', 'STARTS_WITH');

-- CreateEnum
CREATE TYPE "MovedBy" AS ENUM ('AUTOMATIC', 'MANUAL');

-- AlterEnum
ALTER TYPE "ChannelType" ADD VALUE 'ZAPI';

-- DropForeignKey
ALTER TABLE "QuickReply" DROP CONSTRAINT "QuickReply_workspaceId_fkey";

-- AlterTable
ALTER TABLE "Channel" ADD COLUMN     "config" JSONB,
ADD COLUMN     "igUsername" TEXT,
ADD COLUMN     "zapiInstanceId" TEXT;

-- AlterTable
ALTER TABLE "Contact" ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "handle" TEXT;

-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "lastSeq" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "channelId" TEXT,
ADD COLUMN     "mediaPublicUrl" TEXT,
ADD COLUMN     "mediaType" TEXT,
ADD COLUMN     "mimeType" TEXT,
ADD COLUMN     "originalUrl" TEXT,
ADD COLUMN     "providerTimestamp" TIMESTAMP(3),
ADD COLUMN     "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "senderName" TEXT,
ADD COLUMN     "sequence" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "QuickReply" DROP COLUMN "shortcut",
ADD COLUMN     "category" TEXT,
ADD COLUMN     "command" TEXT NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "WebhookEvent" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "instanceId" TEXT,
    "phoneNumberId" TEXT,
    "externalId" TEXT,
    "payload" JSONB NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "error" TEXT,

    CONSTRAINT "WebhookEvent_pkey" PRIMARY KEY ("id")
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
CREATE INDEX "WebhookEvent_status_idx" ON "WebhookEvent"("status");

-- CreateIndex
CREATE INDEX "WebhookEvent_provider_externalId_idx" ON "WebhookEvent"("provider", "externalId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkspacePerformanceConfig_workspaceId_key" ON "WorkspacePerformanceConfig"("workspaceId");

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
CREATE UNIQUE INDEX "Channel_zapiInstanceId_key" ON "Channel"("zapiInstanceId");

-- CreateIndex
CREATE INDEX "Channel_zapiInstanceId_idx" ON "Channel"("zapiInstanceId");

-- CreateIndex
CREATE UNIQUE INDEX "Message_channelId_externalId_key" ON "Message"("channelId", "externalId");

-- CreateIndex
CREATE INDEX "QuickReply_workspaceId_idx" ON "QuickReply"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "QuickReply_workspaceId_command_key" ON "QuickReply"("workspaceId", "command");

-- AddForeignKey
ALTER TABLE "QuickReply" ADD CONSTRAINT "QuickReply_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspacePerformanceConfig" ADD CONSTRAINT "WorkspacePerformanceConfig_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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
