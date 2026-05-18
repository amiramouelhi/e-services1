-- AlterTable: workflow tracking fields for AutorisationSpectacle
ALTER TABLE "AutorisationSpectacle" ADD COLUMN IF NOT EXISTS "prisEnChargeAt"   TIMESTAMP(3);
ALTER TABLE "AutorisationSpectacle" ADD COLUMN IF NOT EXISTS "paiementProofUrl" TEXT;
ALTER TABLE "AutorisationSpectacle" ADD COLUMN IF NOT EXISTS "paiementRecuAt"   TIMESTAMP(3);
ALTER TABLE "AutorisationSpectacle" ADD COLUMN IF NOT EXISTS "authoriseAt"      TIMESTAMP(3);
