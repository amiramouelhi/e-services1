-- CreateEnum
CREATE TYPE "AutorisationStatut" AS ENUM ('EN_ATTENTE_PAIEMENT', 'EN_COURS_TRAITEMENT', 'AUTORISE');

-- AlterTable
ALTER TABLE "AutorisationSpectacle" ADD COLUMN     "statut" "AutorisationStatut" NOT NULL DEFAULT 'EN_ATTENTE_PAIEMENT';
