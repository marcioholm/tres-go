-- AlterTable
ALTER TABLE "MediaUpload" ADD COLUMN     "duration" INTEGER,
ADD COLUMN     "isPtt" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "waveform" JSONB;
