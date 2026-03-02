/*
  Warnings:

  - A unique constraint covering the columns `[cin]` on the table `Deposant` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[raisonSociale]` on the table `Deposant` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Deposant_cin_key" ON "Deposant"("cin");

-- CreateIndex
CREATE UNIQUE INDEX "Deposant_raisonSociale_key" ON "Deposant"("raisonSociale");
