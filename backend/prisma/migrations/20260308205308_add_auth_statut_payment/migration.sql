/*
  Warnings:

  - Added the required column `userId` to the `Depot` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Statut" AS ENUM ('EN_ATTENTE', 'PAYE', 'CERTIFIE');

-- AlterTable
ALTER TABLE "Depot" ADD COLUMN     "konnectPaymentRef" TEXT,
ADD COLUMN     "statut" "Statut" NOT NULL DEFAULT 'EN_ATTENTE',
ADD COLUMN     "userId" INTEGER NOT NULL,
ALTER COLUMN "montant" SET DEFAULT 30;

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- AddForeignKey
ALTER TABLE "Depot" ADD CONSTRAINT "Depot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
