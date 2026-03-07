const prisma = require("../config/prisma");

// CREATE
exports.createAuteur = async (req, res) => {
  try {
    const { nomComplet_fr, nomComplet_ar } = req.body;

    if (!nomComplet_fr?.trim() && !nomComplet_ar?.trim()) {
      return res.status(400).json({ error: "Le nom en arabe ou en français est obligatoire." });
    }

    const auteur = await prisma.auteur.create({
      data: {
        nomComplet_fr: nomComplet_fr?.trim() || null,
        nomComplet_ar: nomComplet_ar?.trim() || null,
      }
    });
    res.status(201).json(auteur);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET ALL
exports.getAllAuteurs = async (req, res) => {
  try {
    const auteurs = await prisma.auteur.findMany({ orderBy: { id: "desc" } });
    res.json(auteurs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET BY ID
exports.getAuteurById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) return res.status(400).json({ error: "ID invalide" });

    const auteur = await prisma.auteur.findUnique({ where: { id } });
    if (!auteur) return res.status(404).json({ message: "Auteur non trouvé" });

    res.json(auteur);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE
exports.updateAuteur = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) return res.status(400).json({ error: "ID invalide" });

    const existing = await prisma.auteur.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "Auteur non trouvé" });

    const { nomComplet_fr, nomComplet_ar } = req.body;

    const merged = {
      nomComplet_fr: nomComplet_fr?.trim() || existing.nomComplet_fr,
      nomComplet_ar: nomComplet_ar?.trim() || existing.nomComplet_ar,
    }

    if (!merged.nomComplet_fr && !merged.nomComplet_ar) {
      return res.status(400).json({ error: "Le nom en arabe ou en français est obligatoire." });
    }

    const updated = await prisma.auteur.update({ where: { id }, data: merged });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE
exports.deleteAuteur = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) return res.status(400).json({ error: "ID invalide" });

    await prisma.auteur.delete({ where: { id } });
    res.json({ message: "Auteur supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};