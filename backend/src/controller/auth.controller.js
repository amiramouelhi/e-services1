const prisma = require("../config/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const transporter = require("../config/mailer");

const VERIFICATION_CODE_TTL_MS = 15 * 60 * 1000; // 15 minutes
const PASSWORD_RESET_CODE_TTL_MS = 15 * 60 * 1000; // 15 minutes

const generateVerificationCode = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const buildPasswordResetEmail = (fullName, code) => ({
  subject: "Réinitialisation du mot de passe OTDAV / إعادة تعيين كلمة المرور",
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #1a3c6e; padding: 20px; text-align: center;">
        <h2 style="color: white; margin: 0;">OTDAV Connect</h2>
        <p style="color: #ccc; margin: 5px 0;">Organisme Tunisien des Droits d'Auteur et des Droits Voisins</p>
      </div>
      <div style="padding: 30px; background: #f9f9f9;">
        <p>Bonjour <strong>${fullName}</strong>,</p>
        <p>Vous avez demandé à réinitialiser votre mot de passe. Utilisez le code ci-dessous pour continuer :</p>
        <div style="text-align: center; margin: 24px 0;">
          <span style="display: inline-block; font-size: 28px; letter-spacing: 8px; font-weight: bold; color: #1a3c6e; background: #fff; padding: 14px 24px; border: 2px dashed #1a3c6e; border-radius: 8px;">${code}</span>
        </div>
        <p>Ce code est valable 15 minutes. Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet e-mail.</p>
        <br/>
        <p style="direction: rtl; text-align: right;">مرحباً <strong>${fullName}</strong>،</p>
        <p style="direction: rtl; text-align: right;">لقد طلبت إعادة تعيين كلمة المرور الخاصة بك. استخدم الرمز أدناه للمتابعة:</p>
        <div style="text-align: center; margin: 24px 0;">
          <span style="display: inline-block; font-size: 28px; letter-spacing: 8px; font-weight: bold; color: #1a3c6e; background: #fff; padding: 14px 24px; border: 2px dashed #1a3c6e; border-radius: 8px;">${code}</span>
        </div>
        <p style="direction: rtl; text-align: right;">هذا الرمز صالح لمدة 15 دقيقة. إذا لم تكن أنت من طلب ذلك، يرجى تجاهل هذا البريد.</p>
        <br/>
        <p>Cordialement / مع التحية،</p>
        <p><strong>L'équipe OTDAV / فريق OTDAV</strong></p>
      </div>
    </div>
  `,
});

const buildVerificationEmail = (fullName, code) => ({
  subject: "Code de vérification OTDAV Connect / رمز التحقق",
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #1a3c6e; padding: 20px; text-align: center;">
        <h2 style="color: white; margin: 0;">OTDAV Connect</h2>
        <p style="color: #ccc; margin: 5px 0;">Organisme Tunisien des Droits d'Auteur et des Droits Voisins</p>
      </div>
      <div style="padding: 30px; background: #f9f9f9;">
        <p>Bonjour <strong>${fullName}</strong>,</p>
        <p>Merci pour votre inscription. Veuillez utiliser le code suivant pour vérifier votre adresse e-mail :</p>
        <div style="text-align: center; margin: 24px 0;">
          <span style="display: inline-block; font-size: 28px; letter-spacing: 8px; font-weight: bold; color: #1a3c6e; background: #fff; padding: 14px 24px; border: 2px dashed #1a3c6e; border-radius: 8px;">${code}</span>
        </div>
        <p>Ce code est valable 15 minutes.</p>
        <br/>
        <p style="direction: rtl; text-align: right;">مرحباً <strong>${fullName}</strong>،</p>
        <p style="direction: rtl; text-align: right;">شكراً لتسجيلك. يرجى استخدام الرمز التالي للتحقق من بريدك الإلكتروني:</p>
        <div style="text-align: center; margin: 24px 0;">
          <span style="display: inline-block; font-size: 28px; letter-spacing: 8px; font-weight: bold; color: #1a3c6e; background: #fff; padding: 14px 24px; border: 2px dashed #1a3c6e; border-radius: 8px;">${code}</span>
        </div>
        <p style="direction: rtl; text-align: right;">هذا الرمز صالح لمدة 15 دقيقة.</p>
        <br/>
        <p>Cordialement / مع التحية،</p>
        <p><strong>L'équipe OTDAV / فريق OTDAV</strong></p>
      </div>
    </div>
  `,
});

// REGISTER
exports.register = async (req, res) => {
  try {
    const { fullName, email, password } = req.body

    if (!fullName?.trim()) return res.status(400).json({ error: "Nom complet est obligatoire" })
    if (!email?.trim()) return res.status(400).json({ error: "Email est obligatoire" })
    if (!password?.trim()) return res.status(400).json({ error: "Mot de passe est obligatoire" })

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ error: "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial" })
    }

    const normalizedEmail = email.trim().toLowerCase()
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } })
    if (existing) return res.status(409).json({ error: "Cet email est déjà utilisé" })

    const hashedPassword = await bcrypt.hash(password, 10)
    const code = generateVerificationCode()
    const expiresAt = new Date(Date.now() + VERIFICATION_CODE_TTL_MS)

    try {
      const tpl = buildVerificationEmail(fullName.trim(), code)
      await transporter.sendMail({
        from: `"OTDAV" <${process.env.EMAIL_USER}>`,
        to: normalizedEmail,
        subject: tpl.subject,
        html: tpl.html,
      })
    } catch (emailError) {
      console.error('Verification email failed:', emailError)
      return res.status(500).json({ error: "Échec de l'envoi de l'email de vérification. Veuillez réessayer." })
    }

    await prisma.user.create({
      data: {
        fullName: fullName.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        emailVerified: false,
        verificationCode: code,
        verificationCodeExpiresAt: expiresAt,
      }
    })

    res.status(201).json({
      message: "Un code de vérification a été envoyé à votre adresse e-mail",
      email: normalizedEmail,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Une erreur est survenue. Veuillez réessayer.' });
  }
}

// VERIFY EMAIL
exports.verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body

    if (!email?.trim()) return res.status(400).json({ error: "Email est obligatoire" })
    if (!code?.trim()) return res.status(400).json({ error: "Code de vérification est obligatoire" })

    const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } })
    if (!user) return res.status(404).json({ error: "Utilisateur introuvable" })

    if (user.emailVerified) {
      return res.status(200).json({ message: "Email déjà vérifié" })
    }

    if (!user.verificationCode || !user.verificationCodeExpiresAt) {
      return res.status(400).json({ error: "Aucun code de vérification actif. Veuillez en demander un nouveau." })
    }

    if (user.verificationCodeExpiresAt < new Date()) {
      return res.status(400).json({ error: "Le code a expiré. Veuillez en demander un nouveau." })
    }

    if (user.verificationCode !== code.trim()) {
      return res.status(400).json({ error: "Code de vérification incorrect" })
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationCode: null,
        verificationCodeExpiresAt: null,
      },
    })

    res.json({ message: "Email vérifié avec succès" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Une erreur est survenue. Veuillez réessayer.' });
  }
}

// RESEND VERIFICATION CODE
exports.resendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body

    if (!email?.trim()) return res.status(400).json({ error: "Email est obligatoire" })

    const normalizedEmail = email.trim().toLowerCase()
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } })
    if (!user) return res.status(404).json({ error: "Utilisateur introuvable" })

    if (user.emailVerified) {
      return res.status(400).json({ error: "Cet email est déjà vérifié" })
    }

    const code = generateVerificationCode()
    const expiresAt = new Date(Date.now() + VERIFICATION_CODE_TTL_MS)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationCode: code,
        verificationCodeExpiresAt: expiresAt,
      },
    })

    try {
      const tpl = buildVerificationEmail(user.fullName, code)
      await transporter.sendMail({
        from: `"OTDAV" <${process.env.EMAIL_USER}>`,
        to: normalizedEmail,
        subject: tpl.subject,
        html: tpl.html,
      })
    } catch (emailError) {
      console.error('Resend verification email failed:', emailError)
      return res.status(500).json({ error: "Échec de l'envoi de l'email. Veuillez réessayer." })
    }

    res.json({ message: "Un nouveau code de vérification a été envoyé" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Une erreur est survenue. Veuillez réessayer.' });
  }
}

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim()) return res.status(400).json({ error: "Email est obligatoire" });
    if (!password?.trim()) return res.status(400).json({ error: "Mot de passe est obligatoire" });

    // Find user
    const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (!user) return res.status(401).json({ error: "Email ou mot de passe incorrect" });

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Email ou mot de passe incorrect" });

    if (!user.emailVerified) {
      return res.status(403).json({
        error: "Veuillez vérifier votre adresse e-mail avant de vous connecter",
        code: "EMAIL_NOT_VERIFIED",
        email: user.email,
      });
    }

    // Generate JWT token
const token = jwt.sign(
  { userId: user.id, email: user.email, canDepot: user.canDepot, canFCS: user.canFCS },
  process.env.JWT_SECRET,
  { expiresIn: "7d" }
)

    res.json({
      message: "Connexion réussie",
      token,
        user: {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    canDepot: user.canDepot,
    canFCS: user.canFCS
  }
    });
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Une erreur est survenue. Veuillez réessayer.' });
  }
};

// FORGOT PASSWORD — send reset code by email
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body

    if (!email?.trim()) return res.status(400).json({ error: "Email est obligatoire" })

    const normalizedEmail = email.trim().toLowerCase()
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } })

    // Do not reveal whether the email exists — always return success
    if (!user) {
      return res.json({ message: "Si cet email existe, un code de réinitialisation a été envoyé" })
    }

    const code = generateVerificationCode()
    const expiresAt = new Date(Date.now() + PASSWORD_RESET_CODE_TTL_MS)

    try {
      const tpl = buildPasswordResetEmail(user.fullName, code)
      await transporter.sendMail({
        from: `"OTDAV" <${process.env.EMAIL_USER}>`,
        to: normalizedEmail,
        subject: tpl.subject,
        html: tpl.html,
      })
    } catch (emailError) {
      console.error('Password reset email failed:', emailError)
      return res.status(500).json({ error: "Échec de l'envoi de l'email. Veuillez réessayer." })
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetCode: code,
        passwordResetCodeExpiresAt: expiresAt,
      },
    })

    res.json({ message: "Un code de réinitialisation a été envoyé à votre adresse e-mail" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Une erreur est survenue. Veuillez réessayer.' });
  }
};

// RESET PASSWORD — verify code and set new password
exports.resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body

    if (!email?.trim()) return res.status(400).json({ error: "Email est obligatoire" })
    if (!code?.trim()) return res.status(400).json({ error: "Code de réinitialisation est obligatoire" })
    if (!newPassword?.trim()) return res.status(400).json({ error: "Nouveau mot de passe est obligatoire" })

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({ error: "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial" })
    }

    const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } })
    if (!user) return res.status(400).json({ error: "Code de réinitialisation invalide" })

    if (!user.passwordResetCode || !user.passwordResetCodeExpiresAt) {
      return res.status(400).json({ error: "Aucune demande de réinitialisation active. Veuillez en demander une nouvelle." })
    }

    if (user.passwordResetCodeExpiresAt < new Date()) {
      return res.status(400).json({ error: "Le code a expiré. Veuillez en demander un nouveau." })
    }

    if (user.passwordResetCode !== code.trim()) {
      return res.status(400).json({ error: "Code de réinitialisation incorrect" })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetCode: null,
        passwordResetCodeExpiresAt: null,
      },
    })

    res.json({ message: "Mot de passe réinitialisé avec succès" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Une erreur est survenue. Veuillez réessayer.' });
  }
};
