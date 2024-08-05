/*
  Warnings:

  - You are about to drop the column `userId` on the `File` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "File" DROP CONSTRAINT "File_userId_fkey";

-- AlterTable
ALTER TABLE "File" DROP COLUMN "userId";

-- CreateTable
CREATE TABLE "_UserFiles" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_UserFiles_AB_unique" ON "_UserFiles"("A", "B");

-- CreateIndex
CREATE INDEX "_UserFiles_B_index" ON "_UserFiles"("B");

-- AddForeignKey
ALTER TABLE "_UserFiles" ADD CONSTRAINT "_UserFiles_A_fkey" FOREIGN KEY ("A") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserFiles" ADD CONSTRAINT "_UserFiles_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
