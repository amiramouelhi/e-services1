/*
  Warnings:

  - You are about to drop the column `nomComplet` on the `Auteur` table. All the data in the column will be lost.
  - You are about to drop the column `nom` on the `Categorie` table. All the data in the column will be lost.
  - You are about to drop the column `adresse` on the `Deposant` table. All the data in the column will be lost.
  - You are about to drop the column `nomComplet` on the `Deposant` table. All the data in the column will be lost.
  - You are about to drop the column `titre` on the `Oeuvre` table. All the data in the column will be lost.
  - You are about to drop the column `typeSupport` on the `Oeuvre` table. All the data in the column will be lost.
  - Added the required column `nom_ar` to the `Categorie` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nom_fr` to the `Categorie` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Auteur" DROP COLUMN "nomComplet",
ADD COLUMN     "nomComplet_ar" TEXT,
ADD COLUMN     "nomComplet_fr" TEXT;

-- AlterTable
ALTER TABLE "Categorie" DROP COLUMN "nom",
ADD COLUMN     "nom_ar" TEXT NOT NULL,
ADD COLUMN     "nom_fr" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Deposant" DROP COLUMN "adresse",
DROP COLUMN "nomComplet",
ADD COLUMN     "adresse_ar" TEXT,
ADD COLUMN     "adresse_fr" TEXT,
ADD COLUMN     "nomComplet_ar" TEXT,
ADD COLUMN     "nomComplet_fr" TEXT;

-- AlterTable
ALTER TABLE "Oeuvre" DROP COLUMN "titre",
DROP COLUMN "typeSupport",
ADD COLUMN     "titre_ar" TEXT,
ADD COLUMN     "titre_fr" TEXT,
ADD COLUMN     "typeSupport_ar" TEXT,
ADD COLUMN     "typeSupport_fr" TEXT;
