-- CreateEnum
CREATE TYPE "CampaignContactStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED_REPLY', 'FAILED');

-- AlterEnum
ALTER TYPE "CampaignType" ADD VALUE 'MULTI_STEP';

-- CreateTable
CREATE TABLE "CampaignStep" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "delayHours" INTEGER NOT NULL DEFAULT 0,
    "content" TEXT,
    "mediaUrl" TEXT,
    "mediaType" TEXT,
    "mediaCaption" TEXT,
    "mediaFilename" TEXT,
    "variables" JSONB,
    "condition" TEXT,

    CONSTRAINT "CampaignStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignContactLog" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "currentStepId" TEXT,
    "status" "CampaignContactStatus" NOT NULL DEFAULT 'ACTIVE',
    "nextExecutionAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CampaignContactLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CampaignStep_campaignId_order_idx" ON "CampaignStep"("campaignId", "order");

-- CreateIndex
CREATE INDEX "CampaignContactLog_nextExecutionAt_status_idx" ON "CampaignContactLog"("nextExecutionAt", "status");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignContactLog_campaignId_contactId_key" ON "CampaignContactLog"("campaignId", "contactId");

-- AddForeignKey
ALTER TABLE "CampaignStep" ADD CONSTRAINT "CampaignStep_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignContactLog" ADD CONSTRAINT "CampaignContactLog_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignContactLog" ADD CONSTRAINT "CampaignContactLog_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignContactLog" ADD CONSTRAINT "CampaignContactLog_currentStepId_fkey" FOREIGN KEY ("currentStepId") REFERENCES "CampaignStep"("id") ON DELETE SET NULL ON UPDATE CASCADE;
