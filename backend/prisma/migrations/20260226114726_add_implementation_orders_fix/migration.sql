-- CreateEnum
CREATE TYPE "ImplementationStatus" AS ENUM ('PENDING_PAYMENT', 'PAID', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "welcomeShown" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "ImplementationOrder" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "status" "ImplementationStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "asaasPaymentId" TEXT,
    "asaasPaymentUrl" TEXT,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 497.00,
    "paidAt" TIMESTAMP(3),
    "scheduledAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "includesFunnel" BOOLEAN NOT NULL DEFAULT true,
    "includesChannels" BOOLEAN NOT NULL DEFAULT true,
    "includesSectors" BOOLEAN NOT NULL DEFAULT true,
    "includesCampaigns" BOOLEAN NOT NULL DEFAULT true,
    "includesTraining" BOOLEAN NOT NULL DEFAULT true,
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImplementationOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ImplementationOrder_workspaceId_key" ON "ImplementationOrder"("workspaceId");

-- AddForeignKey
ALTER TABLE "ImplementationOrder" ADD CONSTRAINT "ImplementationOrder_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
