/*
  Warnings:

  - The `numeroSequentiel` column on the `Depot` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Depot" DROP COLUMN "numeroSequentiel",
ADD COLUMN     "numeroSequentiel" INTEGER;
