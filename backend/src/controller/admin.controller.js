const prisma = require("../config/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//admin login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim()) return res.status(400).json({ error: "Email est obligatoire" });
    if (!password?.trim()) return res.status(400).json({ error: "Mot de passe est obligatoire" });

    const admin = await prisma.admin.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (!admin) return res.status(401).json({ error: "Email ou mot de passe incorrect" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ error: "Email ou mot de passe incorrect" });

    const token = jwt.sign(
      { adminId: admin.id, email: admin.email, isAdmin: true },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Connexion réussie",
      token,
      admin: { id: admin.id, email: admin.email }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET ALL DEPOTS
exports.getAllDepots = async (req, res) => {
  try {
    const depots = await prisma.depot.findMany({
      orderBy: { dateCreation: "desc" },
      include: {
        deposant: true,
        oeuvre:   { include: { categorie: true } },
        auteurs:  { include: { auteur: true } },
        user:     { select: { id: true, email: true } }
      }
    });
    res.json(depots);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET DEPOT BY ID
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
        user:     { select: { id: true, email: true } }
      }
    });

    if (!depot) return res.status(404).json({ error: "Dépôt non trouvé" });
    res.json(depot);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ACCEPT DEPOT
exports.accepterDepot = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "ID invalide" });

    const depot = await prisma.depot.update({
      where: { id },
      data: { statut: "ACCEPTE" }
    });
    res.json({ message: "Dépôt accepté avec succès", depot });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// REJECT DEPOT
exports.rejeterDepot = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "ID invalide" });

    const { motifRejet } = req.body;
    if (!motifRejet?.trim()) {
      return res.status(400).json({ error: "Le motif de rejet est obligatoire" });
    }

    const depot = await prisma.depot.update({
      where: { id },
      data: {
        statut: "REJETE",
        motifRejet: motifRejet.trim()
      }
    });
    res.json({ message: "Dépôt rejeté", depot });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE DEPOT
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

// GET ALL DEPOSANTS
exports.getAllDeposants = async (req, res) => {
  try {
    const deposants = await prisma.deposant.findMany({
      orderBy: { id: "desc" },
      include: {
        _count: { select: { depots: true } },
        depots: {
          select: { statut: true }
        }
      }
    });
    res.json(deposants);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE DEPOSANT
exports.deleteDeposant = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "ID invalide" });

    // Check if deposant has depots linked
    const depots = await prisma.depot.findMany({ where: { deposantId: id } })
    if (depots.length > 0) {
      return res.status(409).json({ 
        error: `Impossible de supprimer ce déposant car il a ${depots.length} dépôt(s) associé(s)` 
      })
    }

    await prisma.deposant.delete({ where: { id } });
    res.json({ message: "Déposant supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ error: "Une erreur est survenue. Veuillez réessayer." });
  }
};

// GET YEARLY REPORT DATA
exports.getYearlyReport = async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();

    // Get all depots for the given year with their oeuvre category
    const depots = await prisma.depot.findMany({
      where: {
        dateDepot: {
          gte: new Date(`${year}-01-01`),
          lte: new Date(`${year}-12-31`)
        }
      },
      include: {
        oeuvre: {
          include: { categorie: true }
        }
      }
    });

    // Build report: 16 categories x 12 months
    const months = [
      "Janvier", "Février", "Mars", "Avril",
      "Mai", "Juin", "Juillet", "Août",
      "Septembre", "Octobre", "Novembre", "Décembre"
    ]

    const report = []

    for (let code = 1; code <= 16; code++) {
      const row = { code, categorie: `صنف ${code}` }

      months.forEach((mois, index) => {
        const count = depots.filter(d =>
          d.oeuvre?.categorie?.code === code &&
          new Date(d.dateDepot).getMonth() === index
        ).length

        const montant = count * 30

        row[`count_${index}`]  = count
        row[`amount_${index}`] = montant
      })

      report.push(row)
    }

    res.json({ year, months, report })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
};

// CHANGE ADMIN PASSWORD
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword?.trim()) return res.status(400).json({ error: "Mot de passe actuel est obligatoire" })
    if (!newPassword?.trim()) return res.status(400).json({ error: "Nouveau mot de passe est obligatoire" })
    if (newPassword.length < 6) return res.status(400).json({ error: "Le mot de passe doit contenir au moins 6 caractères" })

    const admin = await prisma.admin.findUnique({ where: { id: req.adminId } })
    if (!admin) return res.status(404).json({ error: "Admin non trouvé" })

    const isMatch = await bcrypt.compare(currentPassword, admin.password)
    if (!isMatch) return res.status(401).json({ error: "Mot de passe actuel incorrect" })

    const hashed = await bcrypt.hash(newPassword, 10)
    await prisma.admin.update({
      where: { id: req.adminId },
      data: { password: hashed }
    })

    res.json({ message: "Mot de passe modifié avec succès" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}