/*
  Warnings:

  - You are about to drop the column `externalId` on the `ArchivedMessage` table. All the data in the column will be lost.
  - You are about to drop the column `externalId` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `mediaPublicUrl` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `mediaType` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `mimeType` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `originalUrl` on the `Message` table. All the data in the column will be lost.
  - The `type` column on the `Message` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[channelId,provider,providerMessageId]` on the table `Message` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `mediaStatus` to the `ArchivedMessage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `provider` to the `ArchivedMessage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `receivedAt` to the `ArchivedMessage` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `ArchivedMessage` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `sequence` on table `ArchivedMessage` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('TEXT', 'IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT', 'STICKER', 'REACTION', 'LOCATION', 'CONTACT', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "MessageProvider" AS ENUM ('ZAPI', 'WA_CLOUD', 'INSTAGRAM', 'MESSENGER');

-- CreateEnum
CREATE TYPE "MediaStatus" AS ENUM ('NONE', 'PENDING', 'READY', 'FAILED');

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_conversationId_fkey";

-- DropIndex
DROP INDEX "Message_channelId_externalId_key";

-- AlterTable
ALTER TABLE "ArchivedMessage" DROP COLUMN "externalId",
ADD COLUMN     "channelId" TEXT,
ADD COLUMN     "mediaFileName" TEXT,
ADD COLUMN     "mediaFinalUrl" TEXT,
ADD COLUMN     "mediaMimeType" TEXT,
ADD COLUMN     "mediaOriginalUrl" TEXT,
ADD COLUMN     "mediaSize" INTEGER,
ADD COLUMN     "mediaStatus" "MediaStatus" NOT NULL,
ADD COLUMN     "provider" "MessageProvider" NOT NULL,
ADD COLUMN     "providerMessageId" TEXT,
ADD COLUMN     "providerTimestamp" TIMESTAMP(3),
ADD COLUMN     "reactionEmoji" TEXT,
ADD COLUMN     "reactionTargetProviderMessageId" TEXT,
ADD COLUMN     "receivedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "senderName" TEXT,
ADD COLUMN     "workspaceId" TEXT,
DROP COLUMN "type",
ADD COLUMN     "type" "MessageType" NOT NULL,
ALTER COLUMN "content" DROP NOT NULL,
ALTER COLUMN "status" DROP NOT NULL,
ALTER COLUMN "sequence" SET NOT NULL;

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "externalId",
DROP COLUMN "mediaPublicUrl",
DROP COLUMN "mediaType",
DROP COLUMN "mimeType",
DROP COLUMN "originalUrl",
ADD COLUMN     "mediaFileName" TEXT,
ADD COLUMN     "mediaFinalUrl" TEXT,
ADD COLUMN     "mediaMimeType" TEXT,
ADD COLUMN     "mediaOriginalUrl" TEXT,
ADD COLUMN     "mediaSize" INTEGER,
ADD COLUMN     "mediaStatus" "MediaStatus" NOT NULL DEFAULT 'NONE',
ADD COLUMN     "provider" "MessageProvider" NOT NULL DEFAULT 'ZAPI',
ADD COLUMN     "providerMessageId" TEXT,
ADD COLUMN     "reactionEmoji" TEXT,
ADD COLUMN     "reactionTargetProviderMessageId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "workspaceId" TEXT,
DROP COLUMN "type",
ADD COLUMN     "type" "MessageType" NOT NULL DEFAULT 'TEXT',
ALTER COLUMN "content" DROP NOT NULL,
ALTER COLUMN "status" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Message_conversationId_idx" ON "Message"("conversationId");

-- CreateIndex
CREATE INDEX "Message_workspaceId_createdAt_idx" ON "Message"("workspaceId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Message_channelId_provider_providerMessageId_key" ON "Message"("channelId", "provider", "providerMessageId");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
