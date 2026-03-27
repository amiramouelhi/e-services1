const prisma = require("../config/prisma");

// CREATE
exports.createOeuvre = async (req, res) => {
  try {
    const {
      titre_fr, titre_ar,
      description_fr, description_ar,
      typeSupport_fr, typeSupport_ar,
      categorieId
    } = req.body;

    if (!titre_fr?.trim() && !titre_ar?.trim()) {
      return res.status(400).json({ error: "Le titre en arabe ou en français est obligatoire." });
    }

    if (!categorieId) {
      return res.status(400).json({ error: "La catégorie est obligatoire." });
    }

    const oeuvre = await prisma.oeuvre.create({
      data: {
        titre_fr:       titre_fr?.trim() || null,
        titre_ar:       titre_ar?.trim() || null,
        description_fr: description_fr?.trim() || null,
        description_ar: description_ar?.trim() || null,
        typeSupport_fr: typeSupport_fr?.trim() || null,
        typeSupport_ar: typeSupport_ar?.trim() || null,
        categorieId:    parseInt(categorieId)
      },
      include: { categorie: true }
    });

    res.status(201).json(oeuvre);
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Une erreur est survenue. Veuillez réessayer.' });
  }
};

// GET ALL
exports.getAllOeuvres = async (req, res) => {
  try {
    const oeuvres = await prisma.oeuvre.findMany({
      include: { categorie: true },
      orderBy: { id: "desc" }
    });
    res.json(oeuvres);
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Une erreur est survenue. Veuillez réessayer.' });
  }
};

// GET BY ID
exports.getOeuvreById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) return res.status(400).json({ error: "ID invalide" });

    const oeuvre = await prisma.oeuvre.findUnique({
      where: { id },
      include: { categorie: true }
    });

    if (!oeuvre) return res.status(404).json({ message: "Oeuvre non trouvée" });

    res.json(oeuvre);
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Une erreur est survenue. Veuillez réessayer.' });
  }
};

// UPDATE
exports.updateOeuvre = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) return res.status(400).json({ error: "ID invalide" });

    const existing = await prisma.oeuvre.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "Oeuvre non trouvée" });

    const {
      titre_fr, titre_ar,
      description_fr, description_ar,
      typeSupport_fr, typeSupport_ar,
      categorieId
    } = req.body;

    const merged = {
      titre_fr:       titre_fr?.trim()       || existing.titre_fr,
      titre_ar:       titre_ar?.trim()       || existing.titre_ar,
      description_fr: description_fr?.trim() || existing.description_fr,
      description_ar: description_ar?.trim() || existing.description_ar,
      typeSupport_fr: typeSupport_fr?.trim() || existing.typeSupport_fr,
      typeSupport_ar: typeSupport_ar?.trim() || existing.typeSupport_ar,
      categorieId:    categorieId ? parseInt(categorieId) : existing.categorieId,
    }

    if (!merged.titre_fr && !merged.titre_ar) {
      return res.status(400).json({ error: "Le titre en arabe ou en français est obligatoire." });
    }

    const updated = await prisma.oeuvre.update({
      where: { id },
      data: merged,
      include: { categorie: true }
    });

    res.json(updated);
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Une erreur est survenue. Veuillez réessayer.' });
  }
};

// DELETE
exports.deleteOeuvre = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) return res.status(400).json({ error: "ID invalide" });

    await prisma.oeuvre.delete({ where: { id } });
    res.json({ message: "Oeuvre supprimée avec succès" });
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Une erreur est survenue. Veuillez réessayer.' });
  }
};