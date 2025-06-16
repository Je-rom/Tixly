-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailTokenExpires" TIMESTAMP(3),
ADD COLUMN     "emailVerificationToken" TEXT,
ADD COLUMN     "refreshToken" TEXT;
