/*
  Warnings:

  - You are about to drop the column `chunkSize` on the `File` table. All the data in the column will be lost.
  - You are about to drop the column `concurrency` on the `File` table. All the data in the column will be lost.
  - You are about to drop the column `poolElapse` on the `File` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `File` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "File" DROP COLUMN "chunkSize",
DROP COLUMN "concurrency",
DROP COLUMN "poolElapse",
DROP COLUMN "state";
