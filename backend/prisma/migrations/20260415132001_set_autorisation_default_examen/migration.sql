-- AlterTable: change default to EN_COURS_EXAMEN now that the value is committed
ALTER TABLE "AutorisationSpectacle" ALTER COLUMN "statut" SET DEFAULT 'EN_COURS_EXAMEN';
