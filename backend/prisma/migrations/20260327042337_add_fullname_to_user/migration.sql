/*
  Warnings:

  - The values [EN_ATTENTE,PAYE,ACCEPTE,REJETE,RENOUVELE] on the enum `Statut` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `fullName` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Statut_new" AS ENUM ('CERTIFIE', 'EN_ATTENTE_RENOUVELLEMENT');
ALTER TABLE "Depot" ALTER COLUMN "statut" DROP DEFAULT;
ALTER TABLE "Depot" ALTER COLUMN "statut" TYPE "Statut_new" USING ("statut"::text::"Statut_new");
ALTER TYPE "Statut" RENAME TO "Statut_old";
ALTER TYPE "Statut_new" RENAME TO "Statut";
DROP TYPE "Statut_old";
ALTER TABLE "Depot" ALTER COLUMN "statut" SET DEFAULT 'CERTIFIE';
COMMIT;

-- AlterTable
ALTER TABLE "Depot" ALTER COLUMN "statut" SET DEFAULT 'CERTIFIE';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "fullName" TEXT NOT NULL;
