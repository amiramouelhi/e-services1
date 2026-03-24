const prisma = require("../config/prisma");

// CREATE
exports.createDepot = async (req, res) => {
  try {
    const userId = req.userId;
    // console.log("=== body ===", req.body)
    const {
      // Deposant info
      nomComplet, cin, raisonSociale, registreCommerce,
      rue, cite, gouvernorat, ville, codePostal, telephone, fax, email,
      // Oeuvre info
      titre, description, typeSupport, categorieId,
      auteurs,
      // Depot fields
      dateDepot,
      numeroSequentiel,
      numeroEnregistrementBureau,
      numeroRegistreInterne,
      numeroRecuPaiement,isAuteur, isNon, isCoAuteur
    } = req.body;

    // Read uploaded files (comes from multer not req.body)
    const fichierCIN             = req.files?.fichierCIN?.[0]?.filename || null;
    const fichierRNE             = req.files?.fichierRNE?.[0]?.filename || null;
    const fichierProcuration     = req.files?.fichierProcuration?.[0]?.filename || null;
    const fichierDossierJuridique = req.files?.fichierDossierJuridique?.[0]?.filename || null;
    const typeDeposant           = req.body.typeDeposant || null;
  
    // Validations
    if (!nomComplet?.trim() && !raisonSociale?.trim())
      return res.status(400).json({ error: "Nom du déposant est obligatoire" });
    if (!cin?.trim() && !raisonSociale?.trim())
      return res.status(400).json({ error: "CIN ou raison sociale est obligatoire" });
    if (!adresse?.trim())
      return res.status(400).json({ error: "Adresse est obligatoire" });
    if (!telephone?.trim())
      return res.status(400).json({ error: "Téléphone est obligatoire" });
    if (!titre?.trim())
      return res.status(400).json({ error: "Titre de l'oeuvre est obligatoire" });
    if (!categorieId)
      return res.status(400).json({ error: "Catégorie est obligatoire" });
    if (!auteurs?.length)
      return res.status(400).json({ error: "Au moins un auteur est obligatoire" });
    if (!dateDepot)
      return res.status(400).json({ error: "Date de dépôt est obligatoire" });

    const depot = await prisma.$transaction(async (tx) => {

      // 1. Create deposant
      const isArabicNom     = /[\u0600-\u06FF]/.test(nomComplet || '')
      const isArabicAdresse = /[\u0600-\u06FF]/.test(adresse || '')

      const deposant = await tx.deposant.create({
        data: {
    nomComplet_fr:          isArabicNom     ? null : nomComplet?.trim(),
    nomComplet_ar:          isArabicNom     ? nomComplet?.trim() : null,
    rue:         rue?.trim()         || null,
    cite:        cite?.trim()        || null,
    gouvernorat: gouvernorat?.trim() || null,
    ville:       ville?.trim()       || null,
    codePostal:  codePostal?.trim()  || null,
    cin:                    cin?.trim()              || null,
    raisonSociale:          raisonSociale?.trim()    || null,
    registreCommerce:       registreCommerce?.trim() || null,
    telephone:              telephone?.trim(),
    fax:                    fax?.trim()              || null,
    email:                  email?.trim()            || null,
    typeDeposant,
    fichierCIN,
    fichierRNE,
    fichierProcuration,
    fichierDossierJuridique,
        isAuteur:   isAuteur === 'true' || isAuteur === true,
    isNon:      isNon === 'true' || isNon === true,
    isCoAuteur: isCoAuteur === 'true' || isCoAuteur === true,
        }
      });

      // 2. Create oeuvre
      const isArabicTitre = /[\u0600-\u06FF]/.test(titre || '')
      const isArabicDesc  = /[\u0600-\u06FF]/.test(description || '')
      const isArabicType  = /[\u0600-\u06FF]/.test(typeSupport || '')

      const oeuvre = await tx.oeuvre.create({
        data: {
          titre_fr:       isArabicTitre ? null : titre?.trim(),
          titre_ar:       isArabicTitre ? titre?.trim() : null,
          description_fr: isArabicDesc  ? null  : description?.trim() || null,
          description_ar: isArabicDesc  ? description?.trim() || null : null,
          typeSupport_fr: isArabicType  ? null  : typeSupport?.trim() || null,
          typeSupport_ar: isArabicType  ? typeSupport?.trim() || null : null,
          categorieId:    parseInt(categorieId),
        }
      });

      // 3. Create auteurs
      const auteurRecords = await Promise.all(
        auteurs.map((name) => {
          const isArabic = /[\u0600-\u06FF]/.test(name)
          return tx.auteur.create({
            data: {
              nomComplet_fr: isArabic ? null : name.trim(),
              nomComplet_ar: isArabic ? name.trim() : null,
            }
          })
        })
      );

      // 4. Create depot
      return await tx.depot.create({
        data: {
          dateDepot:                  new Date(dateDepot),
          montant:                    30,
          statut:                     "EN_ATTENTE",
          numeroSequentiel:           numeroSequentiel           || null,
          numeroEnregistrementBureau: numeroEnregistrementBureau || null,
          numeroRegistreInterne:      numeroRegistreInterne      || null,
          numeroRecuPaiement:         numeroRecuPaiement         || null,
          user:     { connect: { id: userId } },
          deposant: { connect: { id: deposant.id } },
          oeuvre:   { connect: { id: oeuvre.id } },
          auteurs: {
            create: auteurRecords.map((a) => ({
              auteur: { connect: { id: a.id } }
            }))
          }
        },
        include: {
          deposant: true,
          oeuvre:   { include: { categorie: true } },
          auteurs:  { include: { auteur: true } },
          user: {
    select: { id: true, email: true, createdAt: true }
}
        }
      });
    });

    res.status(201).json(depot);
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET ALL
exports.getAllDepots = async (req, res) => {
  try {
    const depots = await prisma.depot.findMany({
      orderBy: { dateCreation: "desc" },
      include: {
        deposant: true,
        oeuvre:   { include: { categorie: true } },
        auteurs:  { include: { auteur: true } },
        user: {
  select: { id: true, email: true, createdAt: true }
}
      }
    });
    res.json(depots);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET BY ID
exports.getDepotById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "ID invalide" });

    const depot = await prisma.depot.findUnique({
      where: { id },
      include: {
        deposant: true,
        oeuvre:   { include: { categorie: true } },
        auteurs:  { include: { auteur: true } },
        user: {
  select: { id: true, email: true, createdAt: true }
}
      }
    });

    if (!depot) return res.status(404).json({ message: "Dépôt non trouvé" });
    res.json(depot);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE
exports.deleteDepot = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "ID invalide" });

    await prisma.depot.delete({ where: { id } });
    res.json({ message: "Dépôt supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET only the logged-in user's depots
exports.getMesDepots = async (req, res) => {
  try {
    const depots = await prisma.depot.findMany({
      where: { userId: req.userId },
      orderBy: { dateCreation: "desc" },
      include: {
        oeuvre: { include: { categorie: true } },
        auteurs: { include: { auteur: true } },
        deposant: true,
      }
    });
    res.json(depots);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
