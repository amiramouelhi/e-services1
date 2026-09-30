jest.mock("../src/config/prisma", () => ({
  $transaction: jest.fn(),
  depot: { findUnique: jest.fn(), findMany: jest.fn(), update: jest.fn(), count: jest.fn() },
}));

const prisma = require("../src/config/prisma");
const controller = require("../src/controller/depot.controller");
const { mockReq, mockRes } = require("./helpers");

let tx;

beforeEach(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
  tx = {
    deposant: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
    oeuvre: { create: jest.fn() },
    auteur: { create: jest.fn() },
    depot: { create: jest.fn() },
  };
  prisma.$transaction.mockImplementation((cb) => cb(tx));
});

describe("createDepot", () => {
  const validBody = () => ({
    nomComplet: " Ali Ben Salah ",
    cin: " 12345678 ",
    rue: "Rue de Carthage",
    gouvernorat: "Tunis",
    ville: "Tunis",
    telephone: "71000000",
    titre: "Ma chanson",
    description: "Une description",
    categorieId: "3",
    auteurs: ["Ali Ben Salah"],
    dateDepot: "2026-03-15",
  });

  const setupHappyPath = () => {
    tx.deposant.findUnique.mockResolvedValue(null);
    tx.deposant.create.mockResolvedValue({ id: 10 });
    tx.oeuvre.create.mockResolvedValue({ id: 20 });
    tx.auteur.create.mockImplementation(({ data }) =>
      Promise.resolve({ id: 30 + tx.auteur.create.mock.calls.length, ...data })
    );
    tx.depot.create.mockResolvedValue({ id: 99, statut: "CERTIFIE" });
  };

  const expect400 = async (body, error) => {
    const res = mockRes();
    await controller.createDepot(mockReq({ body, userId: 1 }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error });
    expect(prisma.$transaction).not.toHaveBeenCalled();
  };

  it("creates the déposant, œuvre, auteurs and dépôt in one transaction", async () => {
    setupHappyPath();
    const files = { fichierCIN: [{ filename: "cin.jpg" }] };
    const res = mockRes();

    await controller.createDepot(mockReq({ body: validBody(), files, userId: 1 }), res);

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(tx.deposant.findUnique).toHaveBeenCalledWith({ where: { cin: "12345678" } });
    expect(tx.deposant.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        nomComplet_fr: "Ali Ben Salah",
        nomComplet_ar: null,
        cin: "12345678",
        telephone: "71000000",
        fichierCIN: "cin.jpg",
        fichierRNE: null,
      }),
    });
    expect(tx.oeuvre.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ titre_fr: "Ma chanson", titre_ar: null, categorieId: 3 }),
    });
    expect(tx.auteur.create).toHaveBeenCalledTimes(1);

    const depotArgs = tx.depot.create.mock.calls[0][0];
    expect(depotArgs.data).toMatchObject({
      dateDepot: new Date("2026-03-15"),
      montant: 30,
      statut: "CERTIFIE",
      numeroSequentiel: null,
      user: { connect: { id: 1 } },
      deposant: { connect: { id: 10 } },
      oeuvre: { connect: { id: 20 } },
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ id: 99, statut: "CERTIFIE" });
  });

  it("reuses and updates an existing déposant identified by CIN", async () => {
    setupHappyPath();
    tx.deposant.findUnique.mockResolvedValue({ id: 55, cin: "12345678" });
    tx.deposant.update.mockResolvedValue({ id: 55 });
    const res = mockRes();

    await controller.createDepot(mockReq({ body: validBody(), userId: 1 }), res);

    expect(tx.deposant.create).not.toHaveBeenCalled();
    expect(tx.deposant.update).toHaveBeenCalledWith({
      where: { id: 55 },
      data: expect.objectContaining({ cin: "12345678" }),
    });
    expect(tx.depot.create.mock.calls[0][0].data.deposant).toEqual({ connect: { id: 55 } });
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("creates one auteur per name and links them all to the dépôt", async () => {
    setupHappyPath();
    const body = { ...validBody(), auteurs: ["Ali Ben Salah", "علي", "Sami Trabelsi"] };
    const res = mockRes();

    await controller.createDepot(mockReq({ body, userId: 1 }), res);

    expect(tx.auteur.create).toHaveBeenCalledTimes(3);
    expect(tx.auteur.create).toHaveBeenNthCalledWith(2, {
      data: { nomComplet_fr: null, nomComplet_ar: "علي" },
    });
    const links = tx.depot.create.mock.calls[0][0].data.auteurs.create;
    expect(links).toHaveLength(3);
    expect(links[0]).toEqual({ auteur: { connect: { id: expect.any(Number) } } });
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("returns 400 when the déposant name is missing", () =>
    expect400({ ...validBody(), nomComplet: "" }, "Nom du déposant est obligatoire"));

  it("returns 400 when both CIN and raison sociale are missing", () =>
    expect400({ ...validBody(), cin: "  " }, "CIN ou raison sociale est obligatoire"));

  it("returns 400 when the street is missing", () =>
    expect400({ ...validBody(), rue: undefined }, "Rue est obligatoire"));

  it("returns 400 when the gouvernorat is missing", () =>
    expect400({ ...validBody(), gouvernorat: "" }, "Gouvernorat est obligatoire"));

  it("returns 400 when the city is missing", () =>
    expect400({ ...validBody(), ville: "" }, "Ville est obligatoire"));

  it("returns 400 when the phone is missing", () =>
    expect400({ ...validBody(), telephone: "" }, "Téléphone est obligatoire"));

  it("returns 400 when the work title is missing", () =>
    expect400({ ...validBody(), titre: " " }, "Titre de l'oeuvre est obligatoire"));

  it("returns 400 when the category is missing", () =>
    expect400({ ...validBody(), categorieId: undefined }, "Catégorie est obligatoire"));

  it("returns 400 when no author is provided", () =>
    expect400({ ...validBody(), auteurs: [] }, "Au moins un auteur est obligatoire"));

  it("returns 400 when the deposit date is missing", () =>
    expect400({ ...validBody(), dateDepot: undefined }, "Date de dépôt est obligatoire"));

  it("returns 500 when the Prisma transaction fails", async () => {
    prisma.$transaction.mockRejectedValue(new Error("tx failed"));
    const res = mockRes();

    await controller.createDepot(mockReq({ body: validBody(), userId: 1 }), res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Une erreur est survenue. Veuillez réessayer." });
  });
});

describe("searchDepots", () => {
  const search = async (query) => {
    const res = mockRes();
    await controller.searchDepots(mockReq({ query }), res);
    return res;
  };

  it("searches by CIN", async () => {
    prisma.depot.findMany.mockResolvedValue([{ id: 1 }]);
    const res = await search({ q: " 12345678 ", fields: "cin" });

    expect(prisma.depot.findMany).toHaveBeenCalledWith({
      where: { OR: [{ deposant: { cin: { contains: "12345678" } } }] },
      include: {
        deposant: true,
        oeuvre: { include: { categorie: true } },
        auteurs: { include: { auteur: true } },
      },
      orderBy: { dateCreation: "desc" },
    });
    expect(res.json).toHaveBeenCalledWith([{ id: 1 }]);
  });

  it("combines CIN, MF and RNE conditions with OR", async () => {
    prisma.depot.findMany.mockResolvedValue([]);
    await search({ q: "ABC", fields: "cin,mf,rne" });

    expect(prisma.depot.findMany.mock.calls[0][0].where).toEqual({
      OR: [
        { deposant: { cin: { contains: "ABC" } } },
        { deposant: { registreCommerce: { contains: "ABC", mode: "insensitive" } } },
        { deposant: { raisonSociale: { contains: "ABC", mode: "insensitive" } } },
      ],
    });
  });

  it("converts the query to an integer when searching by numéro", async () => {
    prisma.depot.findMany.mockResolvedValue([]);
    await search({ q: "42", fields: "numero" });
    expect(prisma.depot.findMany.mock.calls[0][0].where).toEqual({ OR: [{ numeroSequentiel: 42 }] });
  });

  it("returns 400 when the search parameter is missing", async () => {
    const res = await search({ q: "  ", fields: "cin" });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Paramètre de recherche requis" });
  });

  it("returns 400 when no field is selected", async () => {
    const res = await search({ q: "ABC" });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Aucun champ de recherche sélectionné" });
  });

  it("returns 400 when only invalid fields are given", async () => {
    const res = await search({ q: "ABC", fields: "foo,bar" });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Aucun champ de recherche sélectionné" });
    expect(prisma.depot.findMany).not.toHaveBeenCalled();
  });

  it("returns 500 on Prisma error", async () => {
    prisma.depot.findMany.mockRejectedValue(new Error("db"));
    const res = await search({ q: "ABC", fields: "cin" });
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Une erreur est survenue. Veuillez réessayer." });
  });
});

describe("renouvelerDepot", () => {
  const files = { fichierDemandeRenouvellement: [{ filename: "demande.pdf" }] };

  afterEach(() => jest.useRealTimers());

  it("records the renewal and extends the expiration by 1 year from the previous expiration", async () => {
    jest.useFakeTimers({ now: new Date("2026-09-30T10:00:00Z") });
    prisma.depot.findUnique.mockResolvedValue({ id: 5, dateExpiration: new Date("2026-10-15T00:00:00Z") });
    prisma.depot.update.mockResolvedValue({ id: 5, statut: "CERTIFIE" });
    const res = mockRes();

    await controller.renouvelerDepot(mockReq({ params: { id: "5" }, files }), res);

    expect(prisma.depot.update).toHaveBeenCalledWith({
      where: { id: 5 },
      data: {
        statut: "CERTIFIE",
        dateRenouvellement: new Date("2026-09-30T10:00:00Z"),
        dateExpiration: new Date("2027-10-15T00:00:00Z"),
        fichierDemandeRenouvellement: "demande.pdf",
      },
    });
    expect(res.json).toHaveBeenCalledWith({
      message: "Dépôt renouvelé avec succès",
      depot: { id: 5, statut: "CERTIFIE" },
    });
  });

  it("returns 400 for an invalid ID", async () => {
    const res = mockRes();
    await controller.renouvelerDepot(mockReq({ params: { id: "abc" }, files }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "ID invalide" });
  });

  it("returns 404 when the deposit is not found", async () => {
    prisma.depot.findUnique.mockResolvedValue(null);
    const res = mockRes();
    await controller.renouvelerDepot(mockReq({ params: { id: "5" }, files }), res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Dépôt non trouvé" });
    expect(prisma.depot.update).not.toHaveBeenCalled();
  });

  it("returns 500 on Prisma error", async () => {
    prisma.depot.findUnique.mockRejectedValue(new Error("db"));
    const res = mockRes();
    await controller.renouvelerDepot(mockReq({ params: { id: "5" }, files }), res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("payerDepot", () => {
  const files = { fichierFacture: [{ filename: "facture.pdf" }] };

  afterEach(() => jest.useRealTimers());

  it("records the initial payment, assigns numeroSequentiel and computes the expiration date", async () => {
    jest.useFakeTimers({ now: new Date("2026-09-30T10:00:00Z") });
    prisma.depot.findUnique.mockResolvedValue({ id: 7, oeuvre: { categorieId: 4 } });
    prisma.depot.count.mockResolvedValue(11);
    prisma.depot.update.mockResolvedValue({ id: 7, numeroSequentiel: 12 });
    const res = mockRes();

    await controller.payerDepot(
      mockReq({ params: { id: "7" }, files, body: { numeroRecuPaiement: " R-001 " } }),
      res
    );

    expect(prisma.depot.count).toHaveBeenCalledWith({
      where: { oeuvre: { categorieId: 4 }, numeroSequentiel: { not: null } },
    });
    expect(prisma.depot.update).toHaveBeenCalledWith({
      where: { id: 7 },
      data: {
        statut: "CERTIFIE",
        fichierFacture: "facture.pdf",
        numeroRecuPaiement: "R-001",
        numeroSequentiel: 12,
        dateExpiration: new Date("2027-09-30T10:00:00Z"),
      },
    });
    expect(res.json).toHaveBeenCalledWith({
      message: "Paiement enregistré avec succès",
      depot: { id: 7, numeroSequentiel: 12 },
    });
  });

  it("returns 400 for an invalid ID", async () => {
    const res = mockRes();
    await controller.payerDepot(mockReq({ params: { id: "x" }, files }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "ID invalide" });
  });

  it("returns 400 when the invoice file is missing", async () => {
    const res = mockRes();
    await controller.payerDepot(mockReq({ params: { id: "7" } }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Le fichier facture est obligatoire" });
    expect(prisma.depot.findUnique).not.toHaveBeenCalled();
  });

  it("returns 404 when the deposit is not found", async () => {
    prisma.depot.findUnique.mockResolvedValue(null);
    const res = mockRes();
    await controller.payerDepot(mockReq({ params: { id: "7" }, files }), res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Dépôt non trouvé" });
  });

  it("returns 500 on Prisma error", async () => {
    prisma.depot.findUnique.mockResolvedValue({ id: 7, oeuvre: { categorieId: 4 } });
    prisma.depot.count.mockRejectedValue(new Error("db"));
    const res = mockRes();
    await controller.payerDepot(mockReq({ params: { id: "7" }, files }), res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(prisma.depot.update).not.toHaveBeenCalled();
  });
});
