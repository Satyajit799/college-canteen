/*
  Warnings:

  - A unique constraint covering the columns `[qrToken]` on the table `QRCode` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "QRCode" ADD COLUMN     "qrToken" TEXT,
ADD COLUMN     "qrUsedAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "QRCode_qrToken_key" ON "QRCode"("qrToken");
