/*
  Warnings:

  - You are about to drop the column `adresse_ar` on the `Deposant` table. All the data in the column will be lost.
  - You are about to drop the column `adresse_fr` on the `Deposant` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Deposant" DROP COLUMN "adresse_ar",
DROP COLUMN "adresse_fr",
ADD COLUMN     "cite" TEXT,
ADD COLUMN     "codePostal" TEXT,
ADD COLUMN     "gouvernorat" TEXT,
ADD COLUMN     "rue" TEXT,
ADD COLUMN     "ville" TEXT;
