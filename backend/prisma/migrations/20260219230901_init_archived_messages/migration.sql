-- CreateTable
CREATE TABLE "ArchivedMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "fromAgent" BOOLEAN NOT NULL,
    "isInternalNote" BOOLEAN NOT NULL,
    "type" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "status" TEXT NOT NULL,
    "externalId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArchivedMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ArchivedMessage_conversationId_idx" ON "ArchivedMessage"("conversationId");

-- CreateIndex
CREATE INDEX "ArchivedMessage_createdAt_idx" ON "ArchivedMessage"("createdAt");

-- AddForeignKey
ALTER TABLE "ArchivedMessage" ADD CONSTRAINT "ArchivedMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
