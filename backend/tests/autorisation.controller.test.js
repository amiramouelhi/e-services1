jest.mock("../src/config/prisma", () => ({
  $transaction: jest.fn(),
  organisateur: { findMany: jest.fn(), create: jest.fn() },
  autorisationSpectacle: { findUnique: jest.fn(), update: jest.fn() },
}));
jest.mock("../src/utils/calculDA", () => ({ generateCalculDA: jest.fn() }));

const prisma = require("../src/config/prisma");
const { generateCalculDA } = require("../src/utils/calculDA");
const controller = require("../src/controller/autorisation.controller");
const { mockReq, mockRes } = require("./helpers");

const GENERIC_ERROR = { error: "Une erreur est survenue. Veuillez réessayer." };

beforeEach(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
});

describe("getAllOrganisateurs", () => {
  it("returns organisateurs sorted by name", async () => {
    const list = [{ id: 1, nom: "A" }, { id: 2, nom: "B" }];
    prisma.organisateur.findMany.mockResolvedValue(list);
    const res = mockRes();

    await controller.getAllOrganisateurs(mockReq(), res);

    expect(prisma.organisateur.findMany).toHaveBeenCalledWith({ orderBy: { nom: "asc" } });
    expect(res.json).toHaveBeenCalledWith(list);
  });

  it("returns 500 on Prisma error", async () => {
    prisma.organisateur.findMany.mockRejectedValue(new Error("db"));
    const res = mockRes();
    await controller.getAllOrganisateurs(mockReq(), res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(GENERIC_ERROR);
  });
});

describe("createOrganisateur", () => {
  it("creates an organisateur with trimmed fields and nulls for empty ones", async () => {
    prisma.organisateur.create.mockResolvedValue({ id: 3, nom: "Festival" });
    const res = mockRes();

    await controller.createOrganisateur(
      mockReq({ body: { nom: " Festival ", mf: " 123A ", email: "  " } }),
      res
    );

    expect(prisma.organisateur.create).toHaveBeenCalledWith({
      data: {
        nom: "Festival",
        mf: "123A",
        rne: null,
        adresse: null,
        telephone: null,
        fax: null,
        email: null,
        nomResponsable: null,
      },
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ id: 3, nom: "Festival" });
  });

  it("returns 400 when the name is missing", async () => {
    const res = mockRes();
    await controller.createOrganisateur(mockReq({ body: { nom: " " } }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Nom est obligatoire" });
    expect(prisma.organisateur.create).not.toHaveBeenCalled();
  });

  it("returns 500 on Prisma error", async () => {
    prisma.organisateur.create.mockRejectedValue(new Error("db"));
    const res = mockRes();
    await controller.createOrganisateur(mockReq({ body: { nom: "Festival" } }), res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("createAutorisationSpectacle", () => {
  let tx;
  let nextId;

  const spectacle = (overrides = {}) => ({
    categorieSpectacle: "MUSIQUE",
    titreSpectacle: "Concert",
    dateSpectacle: "2026-07-14",
    lieuSpectacle: " Carthage ",
    typeSpectacle: "PUBLIC",
    budget: "1500.5",
    artistes: [],
    ...overrides,
  });

  const buildReq = (spectacles, files = []) =>
    mockReq({
      body: {
        numeroAutorisation: " A-1 ",
        dateDemande: "2026-06-01",
        isOrganisateur: "true",
        organisateurId: "4",
        hasArtistesEtrangers: "false",
        nombreSpectacles: String(spectacles.length),
        spectacles: JSON.stringify(spectacles),
      },
      files,
    });

  beforeEach(() => {
    nextId = 100;
    const create = () => jest.fn(() => Promise.resolve({ id: nextId++ }));
    tx = {
      autorisationSpectacle: {
        create: create(),
        findUnique: jest.fn(({ where }) => Promise.resolve({ id: where.id, spectacles: [] })),
      },
      spectacle: { create: create() },
      artiste: { create: create() },
      depense: { create: create() },
    };
    prisma.$transaction.mockImplementation((cb) => cb(tx));
    generateCalculDA.mockResolvedValue(undefined);
  });

  it("creates autorisation, spectacle, artiste and dépenses in one transaction", async () => {
    const sp = spectacle({
      artistes: [{ nom: " Amel ", nationalite: "TN", depenses: [{ type: "CACHET", montant: "200" }] }],
    });
    const res = mockRes();

    await controller.createAutorisationSpectacle(buildReq([sp]), res);

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(tx.autorisationSpectacle.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        numeroAutorisation: "A-1",
        isOrganisateur: true,
        hasArtistesEtrangers: false,
        nombreSpectacles: 1,
        organisateurId: 4,
        pvCommission: null,
      }),
    });
    expect(tx.spectacle.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ lieuSpectacle: "Carthage", budget: 1500.5, autorisationId: 100 }),
    });
    expect(tx.artiste.create).toHaveBeenCalledWith({
      data: { nom: "Amel", nationalite: "TN", pays: null, identite: null, spectacleId: 101 },
    });
    expect(tx.depense.create).toHaveBeenCalledWith({
      data: { type: "CACHET", montant: 200, fichier: null, artisteId: 102 },
    });
    expect(tx.autorisationSpectacle.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 100 } })
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ id: 100, spectacles: [] });
  });

  it("triggers the DA calculation sheet generation without awaiting it", async () => {
    generateCalculDA.mockReturnValue(new Promise(() => {})); // never settles
    const res = mockRes();

    await controller.createAutorisationSpectacle(buildReq([spectacle()]), res);

    expect(generateCalculDA).toHaveBeenCalledWith(100);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("attaches the commission PV file", async () => {
    const res = mockRes();
    await controller.createAutorisationSpectacle(
      buildReq([spectacle()], [{ fieldname: "pvCommission", filename: "pv.pdf" }]),
      res
    );
    expect(tx.autorisationSpectacle.create.mock.calls[0][0].data.pvCommission).toBe("pv.pdf");
  });

  it("creates multiple spectacles", async () => {
    const res = mockRes();
    await controller.createAutorisationSpectacle(
      buildReq([spectacle(), spectacle({ titreSpectacle: "Théâtre" }), spectacle()]),
      res
    );
    expect(tx.spectacle.create).toHaveBeenCalledTimes(3);
    expect(tx.spectacle.create.mock.calls[1][0].data.titreSpectacle).toBe("Théâtre");
    expect(tx.autorisationSpectacle.create.mock.calls[0][0].data.nombreSpectacles).toBe(3);
  });

  it("creates multiple artistes, each with their own dépenses", async () => {
    const sp = spectacle({
      artistes: [
        { nom: "A1", nationalite: "TN", depenses: [{ type: "CACHET", montant: "100" }, { type: "TRANSPORT", montant: "50" }] },
        { nom: "A2", nationalite: "FR", pays: "France", depenses: [{ type: "HEBERGEMENT", montant: "300" }] },
      ],
    });
    const res = mockRes();

    await controller.createAutorisationSpectacle(buildReq([sp]), res);

    expect(tx.artiste.create).toHaveBeenCalledTimes(2);
    const [a1, a2] = tx.artiste.create.mock.results.map((r) => r.value);
    const a1Id = (await a1).id;
    const a2Id = (await a2).id;
    const depenses = tx.depense.create.mock.calls.map(([arg]) => arg.data);
    expect(depenses).toEqual([
      { type: "CACHET", montant: 100, fichier: null, artisteId: a1Id },
      { type: "TRANSPORT", montant: 50, fichier: null, artisteId: a1Id },
      { type: "HEBERGEMENT", montant: 300, fichier: null, artisteId: a2Id },
    ]);
  });

  it("attaches the identity file using the dynamic field name spectacle_0_artiste_0_identite", async () => {
    const sp = spectacle({ artistes: [{ nom: "A1", nationalite: "FR", depenses: [] }] });
    const files = [{ fieldname: "spectacle_0_artiste_0_identite", filename: "passport.jpg" }];
    const res = mockRes();

    await controller.createAutorisationSpectacle(buildReq([sp], files), res);

    expect(tx.artiste.create.mock.calls[0][0].data.identite).toBe("passport.jpg");
  });

  it("returns 500 when the Prisma transaction fails", async () => {
    prisma.$transaction.mockRejectedValue(new Error("tx failed"));
    const res = mockRes();

    await controller.createAutorisationSpectacle(buildReq([spectacle()]), res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(GENERIC_ERROR);
    expect(generateCalculDA).not.toHaveBeenCalled();
  });
});

describe("getAutorisationById", () => {
  it("returns the autorisation with nested relations", async () => {
    const autorisation = {
      id: 9,
      organisateur: { nom: "Festival" },
      spectacles: [{ id: 1, artistes: [{ id: 2, depenses: [{ id: 3 }] }] }],
    };
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

  it("returns 400 for an invalid ID", async () => {
    const res = mockRes();
    await controller.getAutorisationById(mockReq({ params: { id: "abc" } }), res);
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

  it("returns 500 on Prisma error", async () => {
    prisma.autorisationSpectacle.findUnique.mockRejectedValue(new Error("db"));
    const res = mockRes();
    await controller.getAutorisationById(mockReq({ params: { id: "9" } }), res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("payerAutorisation", () => {
  const files = [{ fieldname: "fichierFacture", filename: "facture.pdf" }];

  it("stores the invoice and moves the autorisation to PAIEMENT_RECU", async () => {
    prisma.autorisationSpectacle.update.mockResolvedValue({ id: 9, statut: "PAIEMENT_RECU" });
    const res = mockRes();

    await controller.payerAutorisation(
      mockReq({ params: { id: "9" }, files, body: { numeroFacture: " F-77 " } }),
      res
    );

    expect(prisma.autorisationSpectacle.update).toHaveBeenCalledWith({
      where: { id: 9 },
      data: {
        fichierFacture: "facture.pdf",
        numeroFacture: "F-77",
        paiementProofUrl: "facture.pdf",
        paiementRecuAt: expect.any(Date),
        statut: "PAIEMENT_RECU",
      },
    });
    expect(res.json).toHaveBeenCalledWith({
      message: "Paiement enregistré avec succès",
      autorisation: { id: 9, statut: "PAIEMENT_RECU" },
    });
  });

  it("accepts a missing invoice number (optional field)", async () => {
    prisma.autorisationSpectacle.update.mockResolvedValue({ id: 9 });
    const res = mockRes();

    await controller.payerAutorisation(mockReq({ params: { id: "9" }, files }), res);

    expect(prisma.autorisationSpectacle.update.mock.calls[0][0].data.numeroFacture).toBeNull();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("returns 400 for an invalid ID", async () => {
    const res = mockRes();
    await controller.payerAutorisation(mockReq({ params: { id: "x" }, files }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "ID invalide" });
  });

  it("returns 400 when the invoice file is missing", async () => {
    const res = mockRes();
    await controller.payerAutorisation(
      mockReq({ params: { id: "9" }, files: [{ fieldname: "autre", filename: "x.pdf" }] }),
      res
    );
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Le fichier facture est obligatoire" });
    expect(prisma.autorisationSpectacle.update).not.toHaveBeenCalled();
  });

  it("returns 500 on Prisma error", async () => {
    prisma.autorisationSpectacle.update.mockRejectedValue(new Error("db"));
    const res = mockRes();
    await controller.payerAutorisation(mockReq({ params: { id: "9" }, files }), res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(GENERIC_ERROR);
  });
});
