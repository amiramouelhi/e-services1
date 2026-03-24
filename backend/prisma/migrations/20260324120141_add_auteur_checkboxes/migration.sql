-- AlterTable
ALTER TABLE "Deposant" ADD COLUMN     "isAuteur" BOOLEAN DEFAULT false,
ADD COLUMN     "isCoAuteur" BOOLEAN DEFAULT false,
ADD COLUMN     "isNon" BOOLEAN DEFAULT false;
