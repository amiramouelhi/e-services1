jest.mock("../src/config/prisma", () => ({
  user: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
}));
jest.mock("../src/config/mailer", () => ({ sendMail: jest.fn() }));
jest.mock("bcrypt", () => ({ hash: jest.fn(), compare: jest.fn() }));
jest.mock("jsonwebtoken", () => ({ sign: jest.fn() }));

const prisma = require("../src/config/prisma");
const transporter = require("../src/config/mailer");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const controller = require("../src/controller/auth.controller");
const { mockReq, mockRes } = require("./helpers");

const VALID_PASSWORD = "Passw0rd!";
const future = () => new Date(Date.now() + 10 * 60 * 1000);
const past = () => new Date(Date.now() - 60 * 1000);

beforeEach(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
});

describe("register", () => {
  const body = { fullName: "  Ali Ben Salah ", email: " Ali@Mail.com ", password: VALID_PASSWORD };

  it("registers the user and sends a verification code", async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue("hashed");
    transporter.sendMail.mockResolvedValue({});
    prisma.user.create.mockResolvedValue({ id: 1 });
    const res = mockRes();

    await controller.register(mockReq({ body }), res);

    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: "ali@mail.com" } });
    expect(bcrypt.hash).toHaveBeenCalledWith(VALID_PASSWORD, 10);
    expect(transporter.sendMail).toHaveBeenCalledWith(expect.objectContaining({ to: "ali@mail.com" }));
    const { data } = prisma.user.create.mock.calls[0][0];
    expect(data).toMatchObject({
      fullName: "Ali Ben Salah",
      email: "ali@mail.com",
      password: "hashed",
      emailVerified: false,
    });
    expect(data.verificationCode).toMatch(/^\d{6}$/);
    expect(data.verificationCodeExpiresAt).toBeInstanceOf(Date);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "Un code de vérification a été envoyé à votre adresse e-mail",
      email: "ali@mail.com",
    });
  });

  it("returns 400 when full name is missing", async () => {
    const res = mockRes();
    await controller.register(mockReq({ body: { ...body, fullName: "  " } }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Nom complet est obligatoire" });
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it("returns 400 when email is missing", async () => {
    const res = mockRes();
    await controller.register(mockReq({ body: { ...body, email: undefined } }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Email est obligatoire" });
  });

  it("returns 400 when password fails complexity rules", async () => {
    const res = mockRes();
    await controller.register(mockReq({ body: { ...body, password: "password1" } }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json.mock.calls[0][0].error).toMatch(/au moins 8 caractères/);
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it("returns 409 when email is already used", async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 7 });
    const res = mockRes();
    await controller.register(mockReq({ body }), res);
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ error: "Cet email est déjà utilisé" });
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it("returns 500 and does not persist the user when the verification email fails", async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue("hashed");
    transporter.sendMail.mockRejectedValue(new Error("SMTP down"));
    const res = mockRes();

    await controller.register(mockReq({ body }), res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Échec de l'envoi de l'email de vérification. Veuillez réessayer.",
    });
    expect(prisma.user.create).not.toHaveBeenCalled();
  });
});

describe("verifyEmail", () => {
  const user = {
    id: 3,
    emailVerified: false,
    verificationCode: "123456",
    verificationCodeExpiresAt: null,
  };

  it("verifies the email and clears the code", async () => {
    prisma.user.findUnique.mockResolvedValue({ ...user, verificationCodeExpiresAt: future() });
    prisma.user.update.mockResolvedValue({});
    const res = mockRes();

    await controller.verifyEmail(mockReq({ body: { email: " User@Mail.com ", code: " 123456 " } }), res);

    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: "user@mail.com" } });
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 3 },
      data: { emailVerified: true, verificationCode: null, verificationCodeExpiresAt: null },
    });
    expect(res.json).toHaveBeenCalledWith({ message: "Email vérifié avec succès" });
  });

  it("returns 400 when email is missing", async () => {
    const res = mockRes();
    await controller.verifyEmail(mockReq({ body: { code: "123456" } }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Email est obligatoire" });
  });

  it("returns 400 when code is missing", async () => {
    const res = mockRes();
    await controller.verifyEmail(mockReq({ body: { email: "user@mail.com" } }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Code de vérification est obligatoire" });
  });

  it("returns 404 when user is not found", async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    const res = mockRes();
    await controller.verifyEmail(mockReq({ body: { email: "x@mail.com", code: "123456" } }), res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Utilisateur introuvable" });
  });

  it("returns 200 without updating when the email is already verified", async () => {
    prisma.user.findUnique.mockResolvedValue({ ...user, emailVerified: true });
    const res = mockRes();
    await controller.verifyEmail(mockReq({ body: { email: "user@mail.com", code: "123456" } }), res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Email déjà vérifié" });
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it("returns 400 when the code has expired", async () => {
    prisma.user.findUnique.mockResolvedValue({ ...user, verificationCodeExpiresAt: past() });
    const res = mockRes();
    await controller.verifyEmail(mockReq({ body: { email: "user@mail.com", code: "123456" } }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Le code a expiré. Veuillez en demander un nouveau." });
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it("returns 400 when the code is incorrect", async () => {
    prisma.user.findUnique.mockResolvedValue({ ...user, verificationCodeExpiresAt: future() });
    const res = mockRes();
    await controller.verifyEmail(mockReq({ body: { email: "user@mail.com", code: "654321" } }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Code de vérification incorrect" });
    expect(prisma.user.update).not.toHaveBeenCalled();
  });
});

describe("resendVerificationCode", () => {
  const user = { id: 4, fullName: "Ali", emailVerified: false };

  it("stores a new code and resends it", async () => {
    prisma.user.findUnique.mockResolvedValue(user);
    prisma.user.update.mockResolvedValue({});
    transporter.sendMail.mockResolvedValue({});
    const res = mockRes();

    await controller.resendVerificationCode(mockReq({ body: { email: "Ali@Mail.com" } }), res);

    const { where, data } = prisma.user.update.mock.calls[0][0];
    expect(where).toEqual({ id: 4 });
    expect(data.verificationCode).toMatch(/^\d{6}$/);
    expect(data.verificationCodeExpiresAt).toBeInstanceOf(Date);
    expect(transporter.sendMail).toHaveBeenCalledWith(expect.objectContaining({ to: "ali@mail.com" }));
    expect(res.json).toHaveBeenCalledWith({ message: "Un nouveau code de vérification a été envoyé" });
  });

  it("returns 400 when email is missing", async () => {
    const res = mockRes();
    await controller.resendVerificationCode(mockReq({ body: {} }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Email est obligatoire" });
  });

  it("returns 404 when user is not found", async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    const res = mockRes();
    await controller.resendVerificationCode(mockReq({ body: { email: "x@mail.com" } }), res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Utilisateur introuvable" });
  });

  it("returns 400 when the email is already verified", async () => {
    prisma.user.findUnique.mockResolvedValue({ ...user, emailVerified: true });
    const res = mockRes();
    await controller.resendVerificationCode(mockReq({ body: { email: "ali@mail.com" } }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Cet email est déjà vérifié" });
    expect(transporter.sendMail).not.toHaveBeenCalled();
  });

  it("returns 500 when the email cannot be sent", async () => {
    prisma.user.findUnique.mockResolvedValue(user);
    prisma.user.update.mockResolvedValue({});
    transporter.sendMail.mockRejectedValue(new Error("SMTP down"));
    const res = mockRes();
    await controller.resendVerificationCode(mockReq({ body: { email: "ali@mail.com" } }), res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Échec de l'envoi de l'email. Veuillez réessayer." });
  });
});

describe("login", () => {
  const user = {
    id: 5,
    email: "ali@mail.com",
    fullName: "Ali",
    password: "hashed",
    emailVerified: true,
    canDepot: true,
    canFCS: false,
  };

  beforeEach(() => {
    process.env.JWT_SECRET = "test-secret";
  });

  it("logs in and returns a JWT with the user profile", async () => {
    prisma.user.findUnique.mockResolvedValue(user);
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue("jwt-token");
    const res = mockRes();

    await controller.login(mockReq({ body: { email: " Ali@Mail.com ", password: "secret" } }), res);

    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: "ali@mail.com" } });
    expect(bcrypt.compare).toHaveBeenCalledWith("secret", "hashed");
    expect(jwt.sign).toHaveBeenCalledWith(
      { userId: 5, email: "ali@mail.com", canDepot: true, canFCS: false },
      "test-secret",
      { expiresIn: "7d" }
    );
    expect(res.json).toHaveBeenCalledWith({
      message: "Connexion réussie",
      token: "jwt-token",
      user: { id: 5, email: "ali@mail.com", fullName: "Ali", canDepot: true, canFCS: false },
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
    await controller.login(mockReq({ body: { email: "ali@mail.com" } }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Mot de passe est obligatoire" });
  });

  it("returns 401 when the user is not found", async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    const res = mockRes();
    await controller.login(mockReq({ body: { email: "x@mail.com", password: "secret" } }), res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Email ou mot de passe incorrect" });
    expect(jwt.sign).not.toHaveBeenCalled();
  });

  it("returns 401 when the password is incorrect", async () => {
    prisma.user.findUnique.mockResolvedValue(user);
    bcrypt.compare.mockResolvedValue(false);
    const res = mockRes();
    await controller.login(mockReq({ body: { email: "ali@mail.com", password: "wrong" } }), res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Email ou mot de passe incorrect" });
    expect(jwt.sign).not.toHaveBeenCalled();
  });

  it("returns 403 when the email is not verified", async () => {
    prisma.user.findUnique.mockResolvedValue({ ...user, emailVerified: false });
    bcrypt.compare.mockResolvedValue(true);
    const res = mockRes();
    await controller.login(mockReq({ body: { email: "ali@mail.com", password: "secret" } }), res);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: "Veuillez vérifier votre adresse e-mail avant de vous connecter",
      code: "EMAIL_NOT_VERIFIED",
      email: "ali@mail.com",
    });
    expect(jwt.sign).not.toHaveBeenCalled();
  });
});

describe("forgotPassword", () => {
  const user = { id: 6, fullName: "Ali" };

  it("sends a reset code and stores it", async () => {
    prisma.user.findUnique.mockResolvedValue(user);
    transporter.sendMail.mockResolvedValue({});
    prisma.user.update.mockResolvedValue({});
    const res = mockRes();

    await controller.forgotPassword(mockReq({ body: { email: " Ali@Mail.com " } }), res);

    expect(transporter.sendMail).toHaveBeenCalledWith(expect.objectContaining({ to: "ali@mail.com" }));
    const { where, data } = prisma.user.update.mock.calls[0][0];
    expect(where).toEqual({ id: 6 });
    expect(data.passwordResetCode).toMatch(/^\d{6}$/);
    expect(data.passwordResetCodeExpiresAt).toBeInstanceOf(Date);
    expect(res.json).toHaveBeenCalledWith({
      message: "Un code de réinitialisation a été envoyé à votre adresse e-mail",
    });
  });

  it("returns 400 when email is missing", async () => {
    const res = mockRes();
    await controller.forgotPassword(mockReq({ body: {} }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Email est obligatoire" });
  });

  it("returns a generic success message when the user does not exist (no enumeration)", async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    const res = mockRes();
    await controller.forgotPassword(mockReq({ body: { email: "ghost@mail.com" } }), res);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      message: "Si cet email existe, un code de réinitialisation a été envoyé",
    });
    expect(transporter.sendMail).not.toHaveBeenCalled();
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it("returns 500 and does not store the code when the email cannot be sent", async () => {
    prisma.user.findUnique.mockResolvedValue(user);
    transporter.sendMail.mockRejectedValue(new Error("SMTP down"));
    const res = mockRes();
    await controller.forgotPassword(mockReq({ body: { email: "ali@mail.com" } }), res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Échec de l'envoi de l'email. Veuillez réessayer." });
    expect(prisma.user.update).not.toHaveBeenCalled();
  });
});

describe("resetPassword", () => {
  const body = { email: "ali@mail.com", code: "111222", newPassword: VALID_PASSWORD };
  const user = { id: 8, passwordResetCode: "111222" };

  it("resets the password and clears the reset code", async () => {
    prisma.user.findUnique.mockResolvedValue({ ...user, passwordResetCodeExpiresAt: future() });
    bcrypt.hash.mockResolvedValue("new-hash");
    prisma.user.update.mockResolvedValue({});
    const res = mockRes();

    await controller.resetPassword(mockReq({ body }), res);

    expect(bcrypt.hash).toHaveBeenCalledWith(VALID_PASSWORD, 10);
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 8 },
      data: { password: "new-hash", passwordResetCode: null, passwordResetCodeExpiresAt: null },
    });
    expect(res.json).toHaveBeenCalledWith({ message: "Mot de passe réinitialisé avec succès" });
  });

  it("returns 400 when email is missing", async () => {
    const res = mockRes();
    await controller.resetPassword(mockReq({ body: { ...body, email: "" } }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Email est obligatoire" });
  });

  it("returns 400 when code is missing", async () => {
    const res = mockRes();
    await controller.resetPassword(mockReq({ body: { ...body, code: undefined } }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Code de réinitialisation est obligatoire" });
  });

  it("returns 400 when the new password is weak", async () => {
    const res = mockRes();
    await controller.resetPassword(mockReq({ body: { ...body, newPassword: "weakpass" } }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json.mock.calls[0][0].error).toMatch(/au moins 8 caractères/);
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it("returns 400 with a generic error when the user is not found", async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    const res = mockRes();
    await controller.resetPassword(mockReq({ body }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Code de réinitialisation invalide" });
  });

  it("returns 400 when the code has expired", async () => {
    prisma.user.findUnique.mockResolvedValue({ ...user, passwordResetCodeExpiresAt: past() });
    const res = mockRes();
    await controller.resetPassword(mockReq({ body }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Le code a expiré. Veuillez en demander un nouveau." });
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it("returns 400 when the code is incorrect", async () => {
    prisma.user.findUnique.mockResolvedValue({ ...user, passwordResetCodeExpiresAt: future() });
    const res = mockRes();
    await controller.resetPassword(mockReq({ body: { ...body, code: "999999" } }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Code de réinitialisation incorrect" });
    expect(prisma.user.update).not.toHaveBeenCalled();
  });
});
