/*
  Warnings:

  - A unique constraint covering the columns `[sectorId]` on the table `KanbanBoard` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "SectorRole" AS ENUM ('SUPERVISOR', 'AGENT');

-- CreateEnum
CREATE TYPE "AutoRuleType" AS ENUM ('KEYWORD', 'CHANNEL', 'TAG', 'BUSINESS_HOUR');

-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "content" TEXT;

-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "sectorId" TEXT;

-- AlterTable
ALTER TABLE "KanbanBoard" ADD COLUMN     "sectorId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'ONLINE';

-- CreateTable
CREATE TABLE "Sector" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT NOT NULL DEFAULT '#6366f1',
    "icon" TEXT NOT NULL DEFAULT 'business',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sector_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SectorMember" (
    "id" TEXT NOT NULL,
    "sectorId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "SectorRole" NOT NULL DEFAULT 'AGENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SectorMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SectorSla" (
    "id" TEXT NOT NULL,
    "sectorId" TEXT NOT NULL,
    "firstResponseTime" INTEGER NOT NULL DEFAULT 5,
    "resolutionTime" INTEGER NOT NULL DEFAULT 120,
    "warningThreshold" INTEGER NOT NULL DEFAULT 80,
    "criticalThreshold" INTEGER NOT NULL DEFAULT 100,

    CONSTRAINT "SectorSla_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SectorAutoRule" (
    "id" TEXT NOT NULL,
    "sectorId" TEXT NOT NULL,
    "type" "AutoRuleType" NOT NULL,
    "value" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SectorAutoRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConversationTransfer" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "fromSectorId" TEXT,
    "toSectorId" TEXT NOT NULL,
    "fromAgentId" TEXT,
    "toAgentId" TEXT,
    "reason" TEXT,
    "note" TEXT,
    "transferredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConversationTransfer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Sector_workspaceId_isActive_idx" ON "Sector"("workspaceId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Sector_workspaceId_name_key" ON "Sector"("workspaceId", "name");

-- CreateIndex
CREATE INDEX "SectorMember_sectorId_idx" ON "SectorMember"("sectorId");

-- CreateIndex
CREATE INDEX "SectorMember_userId_idx" ON "SectorMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SectorMember_sectorId_userId_key" ON "SectorMember"("sectorId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "SectorSla_sectorId_key" ON "SectorSla"("sectorId");

-- CreateIndex
CREATE INDEX "ConversationTransfer_conversationId_idx" ON "ConversationTransfer"("conversationId");

-- CreateIndex
CREATE INDEX "ConversationTransfer_toSectorId_transferredAt_idx" ON "ConversationTransfer"("toSectorId", "transferredAt");

-- CreateIndex
CREATE UNIQUE INDEX "KanbanBoard_sectorId_key" ON "KanbanBoard"("sectorId");

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_sectorId_fkey" FOREIGN KEY ("sectorId") REFERENCES "Sector"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KanbanBoard" ADD CONSTRAINT "KanbanBoard_sectorId_fkey" FOREIGN KEY ("sectorId") REFERENCES "Sector"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sector" ADD CONSTRAINT "Sector_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SectorMember" ADD CONSTRAINT "SectorMember_sectorId_fkey" FOREIGN KEY ("sectorId") REFERENCES "Sector"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SectorMember" ADD CONSTRAINT "SectorMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SectorSla" ADD CONSTRAINT "SectorSla_sectorId_fkey" FOREIGN KEY ("sectorId") REFERENCES "Sector"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SectorAutoRule" ADD CONSTRAINT "SectorAutoRule_sectorId_fkey" FOREIGN KEY ("sectorId") REFERENCES "Sector"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationTransfer" ADD CONSTRAINT "ConversationTransfer_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationTransfer" ADD CONSTRAINT "ConversationTransfer_fromSectorId_fkey" FOREIGN KEY ("fromSectorId") REFERENCES "Sector"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationTransfer" ADD CONSTRAINT "ConversationTransfer_toSectorId_fkey" FOREIGN KEY ("toSectorId") REFERENCES "Sector"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationTransfer" ADD CONSTRAINT "ConversationTransfer_fromAgentId_fkey" FOREIGN KEY ("fromAgentId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationTransfer" ADD CONSTRAINT "ConversationTransfer_toAgentId_fkey" FOREIGN KEY ("toAgentId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
