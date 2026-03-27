-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Statut" ADD VALUE 'EN_ATTENTE_RENOUVELLEMENT';
ALTER TYPE "Statut" ADD VALUE 'RENOUVELE';

-- AlterTable
ALTER TABLE "Depot" ADD COLUMN     "dateExpiration" TIMESTAMP(3),
ADD COLUMN     "dateRenouvellement" TIMESTAMP(3),
ADD COLUMN     "fichierDemandeRenouvellement" TEXT;
