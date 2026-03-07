/*
  Warnings:

  - You are about to drop the column `categorieId` on the `Depot` table. All the data in the column will be lost.
  - Added the required column `categorieId` to the `Oeuvre` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Depot" DROP CONSTRAINT "Depot_categorieId_fkey";

-- AlterTable
ALTER TABLE "Depot" DROP COLUMN "categorieId";

-- AlterTable
ALTER TABLE "Oeuvre" ADD COLUMN     "categorieId" INTEGER NOT NULL,
ADD COLUMN     "description_ar" TEXT,
ADD COLUMN     "description_fr" TEXT;

-- AddForeignKey
ALTER TABLE "Oeuvre" ADD CONSTRAINT "Oeuvre_categorieId_fkey" FOREIGN KEY ("categorieId") REFERENCES "Categorie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
