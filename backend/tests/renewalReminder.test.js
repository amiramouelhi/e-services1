// The reminder logic lives inside the cron.schedule callback (the module exports
// nothing), so we mock node-cron, capture that callback and run it directly.
jest.mock("node-cron", () => ({ schedule: jest.fn() }));
jest.mock("../src/config/prisma", () => ({
  depot: { findMany: jest.fn(), update: jest.fn() },
}));
jest.mock("../src/config/mailer", () => ({ sendMail: jest.fn() }));

const cron = require("node-cron");
const prisma = require("../src/config/prisma");
const transporter = require("../src/config/mailer");

const NOW = new Date("2026-09-30T08:00:00Z");
const DAY = 24 * 60 * 60 * 1000;
let runReminderJob;
let schedule;

beforeAll(() => {
  require("../src/cron/renewalReminder");
  [schedule, runReminderJob] = cron.schedule.mock.calls[0];
});

beforeEach(() => {
  jest.useFakeTimers({ now: NOW });
  jest.spyOn(console, "log").mockImplementation(() => {});
  prisma.depot.update.mockResolvedValue({});
  transporter.sendMail.mockResolvedValue({});
});

afterEach(() => jest.useRealTimers());

const depotExpiringIn = (days, overrides = {}) => ({
  id: 1,
  statut: "CERTIFIE",
  dateExpiration: new Date(NOW.getTime() + days * DAY),
  deposant: { email: "deposant@mail.com", nomComplet_fr: "Ali" },
  oeuvre: { titre_fr: "Ma chanson" },
  user: { email: "user@mail.com" },
  ...overrides,
});

const runWith = async (...depots) => {
  prisma.depot.findMany.mockResolvedValue(depots);
  await runReminderJob();
};

describe("renewal reminder cron job", () => {
  it("is scheduled daily at 08:00 and only loads CERTIFIE / EN_ATTENTE_RENOUVELLEMENT deposits", async () => {
    expect(schedule).toBe("0 8 * * *");
    await runWith();
    expect(prisma.depot.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          statut: { in: ["CERTIFIE", "EN_ATTENTE_RENOUVELLEMENT"] },
          dateExpiration: { not: null },
        },
      })
    );
  });

  it("at J-30 sets statut EN_ATTENTE_RENOUVELLEMENT and sends the first reminder", async () => {
    await runWith(depotExpiringIn(30));

    expect(prisma.depot.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { statut: "EN_ATTENTE_RENOUVELLEMENT" },
    });
    expect(transporter.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "deposant@mail.com",
        subject: "Rappel: Renouvellement de dépôt dans 30 jours",
      })
    );
  });

  it.each([23, 16, 9])("at J-%i sends a reminder without changing the status", async (days) => {
    await runWith(depotExpiringIn(days));

    expect(transporter.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({ subject: `Rappel: Renouvellement de dépôt dans ${days} jours` })
    );
    expect(prisma.depot.update).not.toHaveBeenCalled();
  });

  it("at J-1 sends the final warning", async () => {
    await runWith(depotExpiringIn(1));

    expect(transporter.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({ subject: "⚠️ URGENT: Votre dépôt expire DEMAIN" })
    );
    expect(prisma.depot.update).not.toHaveBeenCalled();
  });

  it.each([0, -3])("at expiration (J%i) sets statut REJETE", async (days) => {
    await runWith(depotExpiringIn(days));

    expect(prisma.depot.update).toHaveBeenCalledWith({ where: { id: 1 }, data: { statut: "REJETE" } });
    expect(transporter.sendMail).not.toHaveBeenCalled();
  });

  it("ignores deposits already RENOUVELE", async () => {
    await runWith(depotExpiringIn(-2, { statut: "RENOUVELE" }));

    expect(prisma.depot.update).not.toHaveBeenCalled();
    expect(transporter.sendMail).not.toHaveBeenCalled();
  });

  it.each([45, 25, 10, 5, 2])("takes no action at J-%i", async (days) => {
    await runWith(depotExpiringIn(days));

    expect(prisma.depot.update).not.toHaveBeenCalled();
    expect(transporter.sendMail).not.toHaveBeenCalled();
  });

  it("falls back to the user's email when the déposant has none", async () => {
    await runWith(depotExpiringIn(23, { deposant: { email: null, nomComplet_fr: "Ali" } }));

    expect(transporter.sendMail).toHaveBeenCalledWith(expect.objectContaining({ to: "user@mail.com" }));
  });

  it("skips the deposit when no email is available", async () => {
    await runWith(depotExpiringIn(30, { deposant: { email: null }, user: null }));

    expect(prisma.depot.update).not.toHaveBeenCalled();
    expect(transporter.sendMail).not.toHaveBeenCalled();
  });

  it("propagates SMTP errors out of the scheduled task", async () => {
    transporter.sendMail.mockRejectedValue(new Error("SMTP unavailable"));
    prisma.depot.findMany.mockResolvedValue([depotExpiringIn(23), depotExpiringIn(30, { id: 2 })]);

    await expect(runReminderJob()).rejects.toThrow("SMTP unavailable");
    // Processing stops at the failing deposit.
    expect(prisma.depot.update).not.toHaveBeenCalled();
  });
});
