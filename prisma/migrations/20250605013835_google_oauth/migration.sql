-- CreateEnum
CREATE TYPE "SignupMode" AS ENUM ('OAUTH', 'REGULAR');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "signUpMode" "SignupMode";
