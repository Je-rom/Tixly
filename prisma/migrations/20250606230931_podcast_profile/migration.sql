/*
  Warnings:

  - You are about to drop the column `bio` on the `OrganizerProfile` table. All the data in the column will be lost.
  - You are about to drop the column `contactInfo` on the `OrganizerProfile` table. All the data in the column will be lost.
  - You are about to drop the column `website` on the `OrganizerProfile` table. All the data in the column will be lost.
  - Added the required column `businessType` to the `OrganizerProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyName` to the `OrganizerProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `country` to the `OrganizerProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `OrganizerProfile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OrganizerProfile" DROP COLUMN "bio",
DROP COLUMN "contactInfo",
DROP COLUMN "website",
ADD COLUMN     "businessType" TEXT NOT NULL,
ADD COLUMN     "companyName" TEXT NOT NULL,
ADD COLUMN     "country" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "socialLinks" JSONB,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "websiteUrl" TEXT;

-- CreateTable
CREATE TABLE "PodcasterProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "podcastName" TEXT NOT NULL,
    "hostNames" TEXT NOT NULL,
    "websiteUrl" TEXT,
    "country" TEXT NOT NULL,
    "socialLinks" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PodcasterProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PodcasterProfile_userId_key" ON "PodcasterProfile"("userId");

-- AddForeignKey
ALTER TABLE "PodcasterProfile" ADD CONSTRAINT "PodcasterProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
