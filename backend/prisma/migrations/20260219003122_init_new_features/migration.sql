-- CreateEnum
CREATE TYPE "TrafficSource" AS ENUM ('GOOGLE_ADS', 'GOOGLE_ORGANIC', 'META_ADS', 'META_ORGANIC', 'WHATSAPP_DIRECT', 'INSTAGRAM_DIRECT', 'TIKTOK_ADS', 'TIKTOK_ORGANIC', 'YOUTUBE', 'EMAIL_MARKETING', 'INDICATION', 'COLD_CALL', 'EVENT', 'OTHER');

-- CreateEnum
CREATE TYPE "CampaignType" AS ENUM ('SIMPLE', 'TEMPLATE');

-- CreateEnum
CREATE TYPE "TagType" AS ENUM ('GENERAL', 'REMARKETING', 'SEGMENT', 'STATUS');

-- CreateEnum
CREATE TYPE "SaleStatus" AS ENUM ('COMPLETED', 'PENDING', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "ScheduledStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "delayBetween" INTEGER NOT NULL DEFAULT 3000,
ADD COLUMN     "filterSource" "TrafficSource",
ADD COLUMN     "filterTagIds" TEXT[],
ADD COLUMN     "mediaCaption" TEXT,
ADD COLUMN     "mediaFilename" TEXT,
ADD COLUMN     "mediaType" TEXT,
ADD COLUMN     "mediaUrl" TEXT,
ADD COLUMN     "repliesCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "type" "CampaignType" NOT NULL DEFAULT 'SIMPLE',
ADD COLUMN     "variables" JSONB;

-- AlterTable
ALTER TABLE "Contact" ADD COLUMN     "referredBy" TEXT,
ADD COLUMN     "source" "TrafficSource",
ADD COLUMN     "sourceCampaign" TEXT,
ADD COLUMN     "sourceContent" TEXT,
ADD COLUMN     "sourceMedium" TEXT,
ADD COLUMN     "utmCampaign" TEXT,
ADD COLUMN     "utmMedium" TEXT,
ADD COLUMN     "utmSource" TEXT;

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "isInternalNote" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Tag" ADD COLUMN     "type" "TagType" NOT NULL DEFAULT 'GENERAL';

-- CreateTable
CREATE TABLE "BusinessHours" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "isOpen" BOOLEAN NOT NULL DEFAULT true,
    "openTime" TEXT NOT NULL,
    "closeTime" TEXT NOT NULL,

    CONSTRAINT "BusinessHours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuickReply" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "shortcut" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuickReply_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeBase" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KnowledgeBase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KanbanBoard" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Funil de Vendas',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KanbanBoard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KanbanColumn" (
    "id" TEXT NOT NULL,
    "boardId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#6366f1',
    "isWon" BOOLEAN NOT NULL DEFAULT false,
    "isLost" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "KanbanColumn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deal" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "columnId" TEXT NOT NULL,
    "conversationId" TEXT,
    "title" TEXT NOT NULL,
    "value" DOUBLE PRECISION,
    "agentId" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "expectedCloseAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Deal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DealTag" (
    "dealId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "DealTag_pkey" PRIMARY KEY ("dealId","tagId")
);

-- CreateTable
CREATE TABLE "Sale" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "conversationId" TEXT,
    "agentId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "SaleStatus" NOT NULL DEFAULT 'COMPLETED',
    "saleDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SaleItem" (
    "id" TEXT NOT NULL,
    "saleId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "SaleItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduledMessage" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'TEXT',
    "content" JSONB NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "status" "ScheduledStatus" NOT NULL DEFAULT 'PENDING',
    "sentAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScheduledMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaUpload" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "uploadedBy" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "mediaType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MediaUpload_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "KanbanBoard_workspaceId_idx" ON "KanbanBoard"("workspaceId");

-- CreateIndex
CREATE INDEX "KanbanColumn_boardId_order_idx" ON "KanbanColumn"("boardId", "order");

-- CreateIndex
CREATE INDEX "Deal_workspaceId_columnId_idx" ON "Deal"("workspaceId", "columnId");

-- CreateIndex
CREATE INDEX "Deal_workspaceId_contactId_idx" ON "Deal"("workspaceId", "contactId");

-- CreateIndex
CREATE INDEX "Deal_contactId_createdAt_idx" ON "Deal"("contactId", "createdAt");

-- CreateIndex
CREATE INDEX "Sale_workspaceId_contactId_idx" ON "Sale"("workspaceId", "contactId");

-- CreateIndex
CREATE INDEX "Sale_workspaceId_createdAt_idx" ON "Sale"("workspaceId", "createdAt");

-- CreateIndex
CREATE INDEX "Sale_workspaceId_agentId_idx" ON "Sale"("workspaceId", "agentId");

-- CreateIndex
CREATE INDEX "ScheduledMessage_status_scheduledAt_idx" ON "ScheduledMessage"("status", "scheduledAt");

-- CreateIndex
CREATE INDEX "MediaUpload_workspaceId_createdAt_idx" ON "MediaUpload"("workspaceId", "createdAt");

-- AddForeignKey
ALTER TABLE "BusinessHours" ADD CONSTRAINT "BusinessHours_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuickReply" ADD CONSTRAINT "QuickReply_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeBase" ADD CONSTRAINT "KnowledgeBase_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KanbanBoard" ADD CONSTRAINT "KanbanBoard_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KanbanColumn" ADD CONSTRAINT "KanbanColumn_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "KanbanBoard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deal" ADD CONSTRAINT "Deal_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deal" ADD CONSTRAINT "Deal_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deal" ADD CONSTRAINT "Deal_columnId_fkey" FOREIGN KEY ("columnId") REFERENCES "KanbanColumn"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deal" ADD CONSTRAINT "Deal_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deal" ADD CONSTRAINT "Deal_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealTag" ADD CONSTRAINT "DealTag_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealTag" ADD CONSTRAINT "DealTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleItem" ADD CONSTRAINT "SaleItem_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledMessage" ADD CONSTRAINT "ScheduledMessage_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledMessage" ADD CONSTRAINT "ScheduledMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledMessage" ADD CONSTRAINT "ScheduledMessage_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledMessage" ADD CONSTRAINT "ScheduledMessage_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaUpload" ADD CONSTRAINT "MediaUpload_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaUpload" ADD CONSTRAINT "MediaUpload_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
