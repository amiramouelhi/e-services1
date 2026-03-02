const prisma = require("../config/prisma");

// CREATE
exports.createDeposant = async (req, res) => {
  try {
    const {
      nomComplet_fr,
      nomComplet_ar,
      cin,
      raisonSociale,
      registreCommerce,
      adresse_fr,
      adresse_ar,
      telephone,
      fax,
      email
    } = req.body;

    // nom obligatoire
    if (!nomComplet_fr?.trim() && !nomComplet_ar?.trim()) {
      return res.status(400).json({ error: "Le nom et prénom est obligatoire." });
    }

    // cin obligatoire
    if (!cin?.trim() && !raisonSociale?.trim()) {
      return res.status(400).json({ error: "La pièce d'identité ou la raison sociale est obligatoire." });
    }

    // adresse obligatoire
    if (!adresse_fr?.trim() && !adresse_ar?.trim()) {
      return res.status(400).json({ error: "L'adresse postale est obligatoire." });
    }

    // num tel obligatoire
    if (!telephone?.trim()) {
      return res.status(400).json({ error: "Le numéro de téléphone est obligatoire." });
    }

    const deposant = await prisma.deposant.create({
      data: {
        nomComplet_fr: nomComplet_fr?.trim() || null,
        nomComplet_ar: nomComplet_ar?.trim() || null,
        cin:              cin?.trim() || null,
        raisonSociale:    raisonSociale?.trim() || null,
        registreCommerce: registreCommerce?.trim() || null,
        adresse_fr:   adresse_fr?.trim() || null,
        adresse_ar:   adresse_ar?.trim() || null,
        telephone:    telephone?.trim(),
        fax:          fax?.trim() || null,
        email:        email?.trim() || null,
      }
    });

    res.status(201).json(deposant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET ALL
exports.getAllDeposants = async (req, res) => {
  try {
    const deposants = await prisma.deposant.findMany({
      orderBy: { id: "desc" }
    });

    res.json(deposants);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET BY ID
exports.getDeposantById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: "ID invalide" });
    }

    const deposant = await prisma.deposant.findUnique({
      where: { id }
    });

    if (!deposant) {
      return res.status(404).json({ message: "Déposant non trouvé" });
    }

    res.json(deposant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// SEARCH by CIN or Raison Sociale
exports.searchDeposant = async (req, res) => {
  try {
    const { q } = req.query  // GET /deposants/search?q=12345678

    if (!q?.trim()) {
      return res.status(400).json({ error: "Paramètre de recherche requis" })
    }

    const deposants = await prisma.deposant.findMany({
      where: {
        OR: [
          { cin: { contains: q.trim(), mode: 'insensitive' } },
          { raisonSociale: { contains: q.trim(), mode: 'insensitive' } }
        ]
      }
    })

    res.json(deposants)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// UPDATE
exports.updateDeposant = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: "ID invalide" });
    }

    // Fetch existing record first
    const existing = await prisma.deposant.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Déposant non trouvé" });
    }

    const {
      nomComplet_fr, nomComplet_ar,
      cin, raisonSociale, registreCommerce,
      adresse_fr, adresse_ar,
      telephone, fax, email
    } = req.body;

    // use new value if provided, otherwise keep existing
    const merged = {
      nomComplet_fr:    nomComplet_fr?.trim()    || existing.nomComplet_fr,
      nomComplet_ar:    nomComplet_ar?.trim()    || existing.nomComplet_ar,
      cin:              cin?.trim()              || existing.cin,
      raisonSociale:    raisonSociale?.trim()    || existing.raisonSociale,
      registreCommerce: registreCommerce?.trim() || existing.registreCommerce,
      adresse_fr:       adresse_fr?.trim()       || existing.adresse_fr,
      adresse_ar:       adresse_ar?.trim()       || existing.adresse_ar,
      telephone:        telephone?.trim()        || existing.telephone,
      fax:              fax?.trim()              || existing.fax,
      email:            email?.trim()            || existing.email,
    }

    // Validate merged result
    if (!merged.nomComplet_fr && !merged.nomComplet_ar && !merged.raisonSociale) {
      return res.status(400).json({ error: "Le nom (FR/AR) ou la raison sociale est obligatoire." });
    }
    if (!merged.cin && !merged.raisonSociale) {
      return res.status(400).json({ error: "La pièce d'identité ou la raison sociale est obligatoire." });
    }
    if (!merged.adresse_fr && !merged.adresse_ar) {
      return res.status(400).json({ error: "L'adresse postale est obligatoire." });
    }
    if (!merged.telephone) {
      return res.status(400).json({ error: "Le numéro de téléphone est obligatoire." });
    }

    //Save merged data
    const updated = await prisma.deposant.update({
      where: { id },
      data: merged
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE
exports.deleteDeposant = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    await prisma.deposant.delete({
      where: { id }
    });

    res.json({
      message: "Déposant supprimé avec succès"
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};