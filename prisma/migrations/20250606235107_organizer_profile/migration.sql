/*
  Warnings:

  - The `hostNames` column on the `PodcasterProfile` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "PodcasterProfile" DROP COLUMN "hostNames",
ADD COLUMN     "hostNames" TEXT[];
