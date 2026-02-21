/*
  Warnings:

  - You are about to drop the column `config` on the `Channel` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `Channel` table. All the data in the column will be lost.
  - Changed the type of `type` on the `Channel` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ChannelType" AS ENUM ('INSTAGRAM', 'MESSENGER', 'WHATSAPP');

-- CreateEnum
CREATE TYPE "ChannelStatus" AS ENUM ('CONNECTING', 'ACTIVE', 'ERROR', 'DISCONNECTED');

-- DropForeignKey
ALTER TABLE "Channel" DROP CONSTRAINT "Channel_workspaceId_fkey";

-- AlterTable
ALTER TABLE "Channel" DROP COLUMN "config",
DROP COLUMN "isActive",
ADD COLUMN     "accessToken" TEXT,
ADD COLUMN     "displayName" TEXT,
ADD COLUMN     "igAccountId" TEXT,
ADD COLUMN     "pageAvatar" TEXT,
ADD COLUMN     "pageId" TEXT,
ADD COLUMN     "pageName" TEXT,
ADD COLUMN     "phoneNumber" TEXT,
ADD COLUMN     "phoneNumberId" TEXT,
ADD COLUMN     "status" "ChannelStatus" NOT NULL DEFAULT 'CONNECTING',
ADD COLUMN     "wabaId" TEXT,
ADD COLUMN     "webhookSecret" TEXT,
DROP COLUMN "type",
ADD COLUMN     "type" "ChannelType" NOT NULL;

-- AddForeignKey
ALTER TABLE "Channel" ADD CONSTRAINT "Channel_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
