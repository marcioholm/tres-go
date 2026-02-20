-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('TRIAL', 'ACTIVE', 'PAST_DUE', 'BLOCKED', 'CANCELLED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "BillingCycle" AS ENUM ('MONTHLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('PENDING', 'PAID', 'OVERDUE', 'CANCELLED', 'REFUNDED');

-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN     "ip" TEXT,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "target" TEXT,
ALTER COLUMN "workspaceId" DROP NOT NULL,
ALTER COLUMN "entityType" DROP NOT NULL,
ALTER COLUMN "entityId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Workspace" ADD COLUMN     "blockReason" TEXT,
ADD COLUMN     "isBlocked" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "priceMonthly" DOUBLE PRECISION NOT NULL,
    "priceYearly" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "trialDays" INTEGER NOT NULL DEFAULT 14,
    "maxAgents" INTEGER NOT NULL DEFAULT 2,
    "maxChannels" INTEGER NOT NULL DEFAULT 1,
    "maxConversationsPerMonth" INTEGER NOT NULL DEFAULT 500,
    "maxCampaigns" INTEGER NOT NULL DEFAULT 0,
    "maxStorage" INTEGER NOT NULL DEFAULT 1024,
    "maxSectors" INTEGER NOT NULL DEFAULT 1,
    "hasKanban" BOOLEAN NOT NULL DEFAULT false,
    "hasChatbot" BOOLEAN NOT NULL DEFAULT false,
    "hasAI" BOOLEAN NOT NULL DEFAULT false,
    "hasReports" BOOLEAN NOT NULL DEFAULT false,
    "hasAPI" BOOLEAN NOT NULL DEFAULT false,
    "hasWhiteLabel" BOOLEAN NOT NULL DEFAULT false,
    "hasMultiSectors" BOOLEAN NOT NULL DEFAULT false,
    "hasCampaigns" BOOLEAN NOT NULL DEFAULT false,
    "hasSalesHistory" BOOLEAN NOT NULL DEFAULT false,
    "hasScheduledMessages" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'TRIAL',
    "billingCycle" "BillingCycle" NOT NULL DEFAULT 'MONTHLY',
    "asaasCustomerId" TEXT,
    "asaasSubscriptionId" TEXT,
    "trialEndsAt" TIMESTAMP(3),
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "blockedAt" TIMESTAMP(3),
    "priceOverride" DOUBLE PRECISION,
    "discountPercent" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "asaasPaymentId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'PENDING',
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "paymentMethod" TEXT,
    "invoiceUrl" TEXT,
    "pixQrCode" TEXT,
    "pixCopiaECola" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SuperAdmin" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SuperAdmin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspaceUsage" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "conversationsCount" INTEGER NOT NULL DEFAULT 0,
    "messagesCount" INTEGER NOT NULL DEFAULT 0,
    "campaignsSent" INTEGER NOT NULL DEFAULT 0,
    "storageUsedMb" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "agentsActive" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "WorkspaceUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Plan_name_key" ON "Plan"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Plan_slug_key" ON "Plan"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_workspaceId_key" ON "Subscription"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_asaasPaymentId_key" ON "Invoice"("asaasPaymentId");

-- CreateIndex
CREATE UNIQUE INDEX "SuperAdmin_userId_key" ON "SuperAdmin"("userId");

-- CreateIndex
CREATE INDEX "WorkspaceUsage_workspaceId_year_month_idx" ON "WorkspaceUsage"("workspaceId", "year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceUsage_workspaceId_month_year_key" ON "WorkspaceUsage"("workspaceId", "month", "year");

-- CreateIndex
CREATE INDEX "AuditLog_userId_createdAt_idx" ON "AuditLog"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SuperAdmin" ADD CONSTRAINT "SuperAdmin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceUsage" ADD CONSTRAINT "WorkspaceUsage_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
