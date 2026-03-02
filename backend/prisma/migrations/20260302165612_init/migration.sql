-- CreateTable
CREATE TABLE "Categorie" (
    "id" SERIAL NOT NULL,
    "code" INTEGER NOT NULL,
    "nom" TEXT NOT NULL,

    CONSTRAINT "Categorie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deposant" (
    "id" SERIAL NOT NULL,
    "nomComplet" TEXT NOT NULL,
    "cin" TEXT,
    "adresse" TEXT,
    "telephone" TEXT,
    "email" TEXT,

    CONSTRAINT "Deposant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Auteur" (
    "id" SERIAL NOT NULL,
    "nomComplet" TEXT NOT NULL,

    CONSTRAINT "Auteur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Oeuvre" (
    "id" SERIAL NOT NULL,
    "titre" TEXT NOT NULL,
    "typeSupport" TEXT,

    CONSTRAINT "Oeuvre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Depot" (
    "id" SERIAL NOT NULL,
    "numeroSequentiel" INTEGER,
    "numeroEnregistrementBureau" TEXT,
    "numeroRegistreInterne" TEXT,
    "dateDepot" TIMESTAMP(3) NOT NULL,
    "numeroRecuPaiement" TEXT,
    "montant" DECIMAL(65,30) NOT NULL,
    "numeroCertificat" TEXT,
    "dateEmissionCertificat" TIMESTAMP(3),
    "dateReceptionCertificat" TIMESTAMP(3),
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "categorieId" INTEGER NOT NULL,
    "deposantId" INTEGER NOT NULL,
    "oeuvreId" INTEGER NOT NULL,

    CONSTRAINT "Depot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DepotAuteur" (
    "depotId" INTEGER NOT NULL,
    "auteurId" INTEGER NOT NULL,

    CONSTRAINT "DepotAuteur_pkey" PRIMARY KEY ("depotId","auteurId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Categorie_code_key" ON "Categorie"("code");

-- AddForeignKey
ALTER TABLE "Depot" ADD CONSTRAINT "Depot_categorieId_fkey" FOREIGN KEY ("categorieId") REFERENCES "Categorie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Depot" ADD CONSTRAINT "Depot_deposantId_fkey" FOREIGN KEY ("deposantId") REFERENCES "Deposant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Depot" ADD CONSTRAINT "Depot_oeuvreId_fkey" FOREIGN KEY ("oeuvreId") REFERENCES "Oeuvre"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepotAuteur" ADD CONSTRAINT "DepotAuteur_depotId_fkey" FOREIGN KEY ("depotId") REFERENCES "Depot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepotAuteur" ADD CONSTRAINT "DepotAuteur_auteurId_fkey" FOREIGN KEY ("auteurId") REFERENCES "Auteur"("id") ON DELETE CASCADE ON UPDATE CASCADE;
