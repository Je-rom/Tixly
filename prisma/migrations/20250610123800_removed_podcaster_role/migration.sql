/*
  Warnings:

  - The values [PODCASTER] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `Podcast` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PodcasterProfile` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('ATTENDEE', 'ORGANIZER', 'ADMIN');
ALTER TABLE "UserRole" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Podcast" DROP CONSTRAINT "Podcast_eventId_fkey";

-- DropForeignKey
ALTER TABLE "PodcasterProfile" DROP CONSTRAINT "PodcasterProfile_userId_fkey";

-- DropTable
DROP TABLE "Podcast";

-- DropTable
DROP TABLE "PodcasterProfile";
