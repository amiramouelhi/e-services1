-- CreateTable
CREATE TABLE "Organisateur" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "mf" TEXT,
    "adresse" TEXT,
    "telephone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Organisateur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutorisationSpectacle" (
    "id" SERIAL NOT NULL,
    "numeroAutorisation" TEXT,
    "isOrganisateur" BOOLEAN NOT NULL DEFAULT false,
    "sfat" TEXT,
    "hasArtistesEtrangers" BOOLEAN NOT NULL DEFAULT false,
    "dateCommission" TIMESTAMP(3),
    "pvCommission" TEXT,
    "nombreSpectacles" INTEGER NOT NULL DEFAULT 1,
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organisateurId" INTEGER,

    CONSTRAINT "AutorisationSpectacle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Spectacle" (
    "id" SERIAL NOT NULL,
    "dateSpectacle" TIMESTAMP(3) NOT NULL,
    "horaireSpectacle" TEXT,
    "lieuSpectacle" TEXT NOT NULL,
    "typeSpectacle" TEXT NOT NULL,
    "budget" DECIMAL(65,30),
    "natureManif" TEXT,
    "hasEtrangers" BOOLEAN,
    "autorisationId" INTEGER NOT NULL,

    CONSTRAINT "Spectacle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Artiste" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "nationalite" TEXT NOT NULL,
    "pays" TEXT,
    "identite" TEXT,
    "spectacleId" INTEGER NOT NULL,

    CONSTRAINT "Artiste_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Depense" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "montant" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "fichier" TEXT,
    "artisteId" INTEGER NOT NULL,

    CONSTRAINT "Depense_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AutorisationSpectacle" ADD CONSTRAINT "AutorisationSpectacle_organisateurId_fkey" FOREIGN KEY ("organisateurId") REFERENCES "Organisateur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Spectacle" ADD CONSTRAINT "Spectacle_autorisationId_fkey" FOREIGN KEY ("autorisationId") REFERENCES "AutorisationSpectacle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Artiste" ADD CONSTRAINT "Artiste_spectacleId_fkey" FOREIGN KEY ("spectacleId") REFERENCES "Spectacle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Depense" ADD CONSTRAINT "Depense_artisteId_fkey" FOREIGN KEY ("artisteId") REFERENCES "Artiste"("id") ON DELETE CASCADE ON UPDATE CASCADE;
