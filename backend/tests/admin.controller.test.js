jest.mock("../src/config/prisma", () => ({
  admin: { findUnique: jest.fn(), update: jest.fn() },
  user: { findMany: jest.fn(), update: jest.fn() },
  depot: { findMany: jest.fn(), findUnique: jest.fn(), update: jest.fn(), delete: jest.fn() },
  deposant: { findMany: jest.fn(), delete: jest.fn() },
  autorisationSpectacle: { findMany: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
}));
jest.mock("bcrypt", () => ({ hash: jest.fn(), compare: jest.fn() }));
jest.mock("jsonwebtoken", () => ({ sign: jest.fn() }));

const prisma = require("../src/config/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const controller = require("../src/controller/admin.controller");
const { mockReq, mockRes } = require("./helpers");

const GENERIC_ERROR = { error: "Une erreur est survenue. Veuillez réessayer." };

beforeEach(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
});

describe("login (admin)", () => {
  const admin = { id: 1, email: "admin@otdav.tn", password: "hashed" };

  beforeEach(() => {
    process.env.JWT_SECRET = "test-secret";
  });

  it("logs in and returns a JWT", async () => {
    prisma.admin.findUnique.mockResolvedValue(admin);
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue("admin-token");
    const res = mockRes();

    await controller.login(mockReq({ body: { email: " Admin@OTDAV.tn ", password: "secret" } }), res);

    expect(prisma.admin.findUnique).toHaveBeenCalledWith({ where: { email: "admin@otdav.tn" } });
    expect(jwt.sign).toHaveBeenCalledWith(
      { adminId: 1, email: "admin@otdav.tn", isAdmin: true },
      "test-secret",
      { expiresIn: "7d" }
    );
    expect(res.json).toHaveBeenCalledWith({
      message: "Connexion réussie",
      token: "admin-token",
      admin: { id: 1, email: "admin@otdav.tn" },
    });
  });

  it("returns 400 when email is missing", async () => {
    const res = mockRes();
    await controller.login(mockReq({ body: { password: "secret" } }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Email est obligatoire" });
  });

  it("returns 400 when password is missing", async () => {
    const res = mockRes();
    await controller.login(mockReq({ body: { email: "admin@otdav.tn" } }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Mot de passe est obligatoire" });
  });

  it("returns 401 for incorrect credentials", async () => {
    prisma.admin.findUnique.mockResolvedValue(admin);
    bcrypt.compare.mockResolvedValue(false);
    const res = mockRes();
    await controller.login(mockReq({ body: { email: "admin@otdav.tn", password: "wrong" } }), res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Email ou mot de passe incorrect" });
    expect(jwt.sign).not.toHaveBeenCalled();
  });

  it("returns 500 on DB error", async () => {
    prisma.admin.findUnique.mockRejectedValue(new Error("db"));
    const res = mockRes();
    await controller.login(mockReq({ body: { email: "admin@otdav.tn", password: "secret" } }), res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(GENERIC_ERROR);
  });
});

describe("getAllDepots / getDepotById", () => {
  it("returns the list of deposits", async () => {
    prisma.depot.findMany.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    const res = mockRes();
    await controller.getAllDepots(mockReq(), res);
    expect(prisma.depot.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { dateCreation: "desc" } })
    );
    expect(res.json).toHaveBeenCalledWith([{ id: 1 }, { id: 2 }]);
  });

  it("returns 400 for an invalid ID", async () => {
    const res = mockRes();
    await controller.getDepotById(mockReq({ params: { id: "abc" } }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "ID invalide" });
  });

  it("returns 404 when the deposit is not found", async () => {
    prisma.depot.findUnique.mockResolvedValue(null);
    const res = mockRes();
    await controller.getDepotById(mockReq({ params: { id: "3" } }), res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Dépôt non trouvé" });
  });

  it("returns the deposit with full details", async () => {
    const depot = { id: 3, deposant: {}, oeuvre: { categorie: {} }, auteurs: [], user: {} };
    prisma.depot.findUnique.mockResolvedValue(depot);
    const res = mockRes();

    await controller.getDepotById(mockReq({ params: { id: "3" } }), res);

    expect(prisma.depot.findUnique).toHaveBeenCalledWith({
      where: { id: 3 },
      include: {
        deposant: true,
        oeuvre: { include: { categorie: true } },
        auteurs: { include: { auteur: true } },
        user: { select: { id: true, email: true } },
      },
    });
    expect(res.json).toHaveBeenCalledWith(depot);
  });
});

describe("deleteDepot", () => {
  it("deletes the deposit", async () => {
    prisma.depot.delete.mockResolvedValue({});
    const res = mockRes();
    await controller.deleteDepot(mockReq({ params: { id: "4" } }), res);
    expect(prisma.depot.delete).toHaveBeenCalledWith({ where: { id: 4 } });
    expect(res.json).toHaveBeenCalledWith({ message: "Dépôt supprimé avec succès" });
  });

  it("returns 400 for an invalid ID", async () => {
    const res = mockRes();
    await controller.deleteDepot(mockReq({ params: { id: "x" } }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(prisma.depot.delete).not.toHaveBeenCalled();
  });

  it("returns 500 on DB error", async () => {
    prisma.depot.delete.mockRejectedValue(new Error("db"));
    const res = mockRes();
    await controller.deleteDepot(mockReq({ params: { id: "4" } }), res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(GENERIC_ERROR);
  });
});

describe("getAllDeposants / deleteDeposant", () => {
  it("returns the list of déposants with deposit counts", async () => {
    prisma.deposant.findMany.mockResolvedValue([{ id: 1, _count: { depots: 2 } }]);
    const res = mockRes();
    await controller.getAllDeposants(mockReq(), res);
    expect(prisma.deposant.findMany).toHaveBeenCalledWith({
      orderBy: { id: "desc" },
      include: { _count: { select: { depots: true } }, depots: { select: { statut: true } } },
    });
    expect(res.json).toHaveBeenCalledWith([{ id: 1, _count: { depots: 2 } }]);
  });

  it("returns 400 for an invalid ID", async () => {
    const res = mockRes();
    await controller.deleteDeposant(mockReq({ params: { id: "x" } }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "ID invalide" });
  });

  it("returns 409 when the déposant has linked deposits", async () => {
    prisma.depot.findMany.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    const res = mockRes();
    await controller.deleteDeposant(mockReq({ params: { id: "5" } }), res);
    expect(prisma.depot.findMany).toHaveBeenCalledWith({ where: { deposantId: 5 } });
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      error: "Impossible de supprimer ce déposant car il a 2 dépôt(s) associé(s)",
    });
    expect(prisma.deposant.delete).not.toHaveBeenCalled();
  });

  it("deletes the déposant when no deposits are linked", async () => {
    prisma.depot.findMany.mockResolvedValue([]);
    prisma.deposant.delete.mockResolvedValue({});
    const res = mockRes();
    await controller.deleteDeposant(mockReq({ params: { id: "5" } }), res);
    expect(prisma.deposant.delete).toHaveBeenCalledWith({ where: { id: 5 } });
    expect(res.json).toHaveBeenCalledWith({ message: "Déposant supprimé avec succès" });
  });
});

describe("getAllAutorisations / getAutorisationById", () => {
  it("aggregates lieux, natures, spectacle and artiste counts", async () => {
    prisma.autorisationSpectacle.findMany.mockResolvedValue([
      {
        id: 1,
        numeroAutorisation: "A-1",
        dateCreation: "2026-05-01",
        statut: "EN_COURS_EXAMEN",
        nombreSpectacles: 2,
        organisateur: { nom: "Festival" },
        spectacles: [
          { lieuSpectacle: "Carthage", natureManif: "Concert", artistes: [{ id: 1 }, { id: 2 }] },
          { lieuSpectacle: "Carthage", typeSpectacle: "Théâtre", artistes: [{ id: 3 }] },
        ],
      },
      { id: 2, numeroAutorisation: null, statut: "AUTORISE", nombreSpectacles: 0, organisateur: null, spectacles: [] },
    ]);
    const res = mockRes();

    await controller.getAllAutorisations(mockReq(), res);

    expect(res.json).toHaveBeenCalledWith([
      {
        id: 1,
        numero: "A-1",
        createdAt: "2026-05-01",
        statut: "EN_COURS_EXAMEN",
        organisateur: { nom: "Festival" },
        lieu: "Carthage",
        nombreSpectacles: 2,
        nombreArtistes: 3,
        natureSpectacle: "Concert, Théâtre",
      },
      {
        id: 2,
        numero: null,
        createdAt: undefined,
        statut: "AUTORISE",
        organisateur: null,
        lieu: null,
        nombreSpectacles: 0,
        nombreArtistes: 0,
        natureSpectacle: null,
      },
    ]);
  });

  it("returns 400 for an invalid ID", async () => {
    const res = mockRes();
    await controller.getAutorisationById(mockReq({ params: { id: "x" } }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "ID invalide" });
  });

  it("returns 404 when the autorisation is not found", async () => {
    prisma.autorisationSpectacle.findUnique.mockResolvedValue(null);
    const res = mockRes();
    await controller.getAutorisationById(mockReq({ params: { id: "9" } }), res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Autorisation non trouvée" });
  });

  it("returns the autorisation with full details", async () => {
    const autorisation = { id: 9, organisateur: {}, spectacles: [{ artistes: [{ depenses: [] }] }] };
    prisma.autorisationSpectacle.findUnique.mockResolvedValue(autorisation);
    const res = mockRes();
    await controller.getAutorisationById(mockReq({ params: { id: "9" } }), res);
    expect(prisma.autorisationSpectacle.findUnique).toHaveBeenCalledWith({
      where: { id: 9 },
      include: {
        organisateur: true,
        spectacles: { include: { artistes: { include: { depenses: true } } } },
      },
    });
    expect(res.json).toHaveBeenCalledWith(autorisation);
  });
});

describe("prendreEnCharge", () => {
  it("returns 404 when the autorisation is not found", async () => {
    prisma.autorisationSpectacle.findUnique.mockResolvedValue(null);
    const res = mockRes();
    await controller.prendreEnCharge(mockReq({ params: { id: "9" } }), res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Autorisation non trouvée" });
  });

  it("returns 400 when the status is not EN_COURS_EXAMEN", async () => {
    prisma.autorisationSpectacle.findUnique.mockResolvedValue({ id: 9, statut: "AUTORISE" });
    const res = mockRes();
    await controller.prendreEnCharge(mockReq({ params: { id: "9" } }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Le dossier n'est plus en cours d'examen" });
    expect(prisma.autorisationSpectacle.update).not.toHaveBeenCalled();
  });

  it("moves the autorisation to EN_COURS_TRAITEMENT", async () => {
    prisma.autorisationSpectacle.findUnique.mockResolvedValue({ id: 9, statut: "EN_COURS_EXAMEN" });
    prisma.autorisationSpectacle.update.mockResolvedValue({ id: 9, statut: "EN_COURS_TRAITEMENT" });
    const res = mockRes();

    await controller.prendreEnCharge(mockReq({ params: { id: "9" } }), res);

    expect(prisma.autorisationSpectacle.update).toHaveBeenCalledWith({
      where: { id: 9 },
      data: { statut: "EN_COURS_TRAITEMENT", prisEnChargeAt: expect.any(Date) },
    });
    expect(res.json).toHaveBeenCalledWith({
      message: "Dossier pris en charge",
      autorisation: { id: 9, statut: "EN_COURS_TRAITEMENT" },
    });
  });
});

describe("delivrerAutorisation", () => {
  it("returns 400 when the status is incompatible", async () => {
    prisma.autorisationSpectacle.findUnique.mockResolvedValue({ id: 9, statut: "EN_COURS_EXAMEN" });
    const res = mockRes();
    await controller.delivrerAutorisation(mockReq({ params: { id: "9" } }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Le dossier n'est pas en attente de paiement" });
    expect(prisma.autorisationSpectacle.update).not.toHaveBeenCalled();
  });

  it.each(["EN_ATTENTE_PAIEMENT", "PAIEMENT_RECU"])("moves the autorisation from %s to AUTORISE", async (statut) => {
    prisma.autorisationSpectacle.findUnique.mockResolvedValue({ id: 9, statut });
    prisma.autorisationSpectacle.update.mockResolvedValue({ id: 9, statut: "AUTORISE" });
    const res = mockRes();

    await controller.delivrerAutorisation(mockReq({ params: { id: "9" } }), res);

    expect(prisma.autorisationSpectacle.update).toHaveBeenCalledWith({
      where: { id: 9 },
      data: { statut: "AUTORISE", authoriseAt: expect.any(Date) },
    });
    expect(res.json).toHaveBeenCalledWith({
      message: "Autorisation délivrée",
      autorisation: { id: 9, statut: "AUTORISE" },
    });
  });
});

// Only deposit rejection exists in the admin controller; there is no
// rejeterAutorisation and rejeterDepot has no status guard.
describe("rejeterDepot", () => {
  it("returns 400 when the motif is missing", async () => {
    const res = mockRes();
    await controller.rejeterDepot(mockReq({ params: { id: "4" }, body: { motifRejet: "  " } }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Le motif de rejet est obligatoire" });
    expect(prisma.depot.update).not.toHaveBeenCalled();
  });

  it("sets statut REJETE with the motif trimmed", async () => {
    prisma.depot.update.mockResolvedValue({ id: 4, statut: "REJETE" });
    const res = mockRes();

    await controller.rejeterDepot(
      mockReq({ params: { id: "4" }, body: { motifRejet: "  Dossier incomplet  " } }),
      res
    );

    expect(prisma.depot.update).toHaveBeenCalledWith({
      where: { id: 4 },
      data: { statut: "REJETE", motifRejet: "Dossier incomplet" },
    });
    expect(res.json).toHaveBeenCalledWith({ message: "Dépôt rejeté", depot: { id: 4, statut: "REJETE" } });
  });
});

describe("getAllUsers / updateUserPermissions", () => {
  it("returns the list of users with their permissions", async () => {
    const users = [{ id: 1, canDepot: true, canFCS: false }];
    prisma.user.findMany.mockResolvedValue(users);
    const res = mockRes();
    await controller.getAllUsers(mockReq(), res);
    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { createdAt: "desc" },
        select: expect.objectContaining({ canDepot: true, canFCS: true }),
      })
    );
    expect(res.json).toHaveBeenCalledWith(users);
  });

  it("returns 400 for an invalid ID", async () => {
    const res = mockRes();
    await controller.updateUserPermissions(mockReq({ params: { id: "x" } }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "ID invalide" });
  });

  it("coerces permission values to booleans", async () => {
    prisma.user.update.mockResolvedValue({ id: 2, canDepot: true, canFCS: false });
    const res = mockRes();

    await controller.updateUserPermissions(
      mockReq({ params: { id: "2" }, body: { canDepot: "yes", canFCS: 0 } }),
      res
    );

    expect(prisma.user.update.mock.calls[0][0]).toMatchObject({
      where: { id: 2 },
      data: { canDepot: true, canFCS: false },
    });
    expect(res.json).toHaveBeenCalledWith({
      message: "Permissions mises à jour",
      user: { id: 2, canDepot: true, canFCS: false },
    });
  });
});

describe("getYearlyReport", () => {
  afterEach(() => jest.useRealTimers());

  it("builds a 16×12 matrix where amount = number of deposits × 30", async () => {
    prisma.depot.findMany.mockResolvedValue([
      { dateDepot: "2025-03-15T12:00:00", oeuvre: { categorie: { code: 1 } } },
      { dateDepot: "2025-03-20T12:00:00", oeuvre: { categorie: { code: 1 } } },
      { dateDepot: "2025-11-10T12:00:00", oeuvre: { categorie: { code: 16 } } },
      { dateDepot: "2025-05-10T12:00:00", oeuvre: null },
    ]);
    const res = mockRes();

    await controller.getYearlyReport(mockReq({ query: { year: "2025" } }), res);

    const { year, months, report } = res.json.mock.calls[0][0];
    expect(year).toBe(2025);
    expect(months).toHaveLength(12);
    expect(report).toHaveLength(16);
    report.forEach((row) => {
      for (let m = 0; m < 12; m++) {
        expect(row[`amount_${m}`]).toBe(row[`count_${m}`] * 30);
      }
    });
    expect(report[0]).toMatchObject({ code: 1, count_2: 2, amount_2: 60 });
    expect(report[15]).toMatchObject({ code: 16, count_10: 1, amount_10: 30 });
    const total = report.reduce((sum, row) => sum + months.reduce((s, _, m) => s + row[`count_${m}`], 0), 0);
    expect(total).toBe(3);
  });

  it("defaults to the current year when none is provided", async () => {
    jest.useFakeTimers({ now: new Date("2026-09-30T12:00:00Z") });
    prisma.depot.findMany.mockResolvedValue([]);
    const res = mockRes();

    await controller.getYearlyReport(mockReq(), res);

    expect(prisma.depot.findMany.mock.calls[0][0].where).toEqual({
      dateDepot: { gte: new Date("2026-01-01"), lte: new Date("2026-12-31") },
    });
    expect(res.json.mock.calls[0][0].year).toBe(2026);
  });
});

describe("getYearlyRenouvellementsReport", () => {
  it("aggregates renewals by category and by month", async () => {
    prisma.depot.findMany.mockResolvedValue([
      { dateRenouvellement: "2026-01-10T12:00:00", oeuvre: { categorie: { code: 2 } } },
      { dateRenouvellement: "2026-01-25T12:00:00", oeuvre: { categorie: { code: 2 } } },
      { dateRenouvellement: "2026-06-05T12:00:00", oeuvre: { categorie: { code: 7 } } },
    ]);
    const res = mockRes();

    await controller.getYearlyRenouvellementsReport(mockReq({ query: { year: "2026" } }), res);

    expect(prisma.depot.findMany.mock.calls[0][0].where).toEqual({
      dateRenouvellement: { gte: new Date("2026-01-01"), lte: new Date("2026-12-31") },
    });
    const { report } = res.json.mock.calls[0][0];
    expect(report).toHaveLength(16);
    expect(report[1]).toMatchObject({ code: 2, count_0: 2, amount_0: 60 });
    expect(report[6]).toMatchObject({ code: 7, count_5: 1, amount_5: 30 });
    expect(report[0].count_0).toBe(0);
  });
});

describe("changePassword (admin)", () => {
  const req = (body) => mockReq({ body, adminId: 1 });

  it.each([
    [{ newPassword: "abcdef" }, "Mot de passe actuel est obligatoire"],
    [{ currentPassword: "old" }, "Nouveau mot de passe est obligatoire"],
  ])("returns 400 when a field is missing (%o)", async (body, error) => {
    const res = mockRes();
    await controller.changePassword(req(body), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error });
  });

  it("returns 400 when the new password is shorter than 6 characters", async () => {
    const res = mockRes();
    await controller.changePassword(req({ currentPassword: "old", newPassword: "12345" }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Le mot de passe doit contenir au moins 6 caractères" });
    expect(prisma.admin.findUnique).not.toHaveBeenCalled();
  });

  it("returns 404 when the admin is not found", async () => {
    prisma.admin.findUnique.mockResolvedValue(null);
    const res = mockRes();
    await controller.changePassword(req({ currentPassword: "old", newPassword: "newpass" }), res);
    expect(prisma.admin.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Admin non trouvé" });
  });

  it("returns 401 when the current password is incorrect", async () => {
    prisma.admin.findUnique.mockResolvedValue({ id: 1, password: "hashed" });
    bcrypt.compare.mockResolvedValue(false);
    const res = mockRes();
    await controller.changePassword(req({ currentPassword: "bad", newPassword: "newpass" }), res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Mot de passe actuel incorrect" });
    expect(prisma.admin.update).not.toHaveBeenCalled();
  });

  it("hashes and saves the new password with bcrypt", async () => {
    prisma.admin.findUnique.mockResolvedValue({ id: 1, password: "hashed" });
    bcrypt.compare.mockResolvedValue(true);
    bcrypt.hash.mockResolvedValue("new-hash");
    prisma.admin.update.mockResolvedValue({});
    const res = mockRes();

    await controller.changePassword(req({ currentPassword: "old", newPassword: "newpass" }), res);

    expect(bcrypt.compare).toHaveBeenCalledWith("old", "hashed");
    expect(bcrypt.hash).toHaveBeenCalledWith("newpass", 10);
    expect(prisma.admin.update).toHaveBeenCalledWith({ where: { id: 1 }, data: { password: "new-hash" } });
    expect(res.json).toHaveBeenCalledWith({ message: "Mot de passe modifié avec succès" });
  });
});
