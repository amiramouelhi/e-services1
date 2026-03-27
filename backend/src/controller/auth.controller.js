const prisma = require("../config/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const transporter = require("../config/mailer");

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

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return res.status(409).json({ error: "Cet email est déjà utilisé" })

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
      }
    })

    try {
      await transporter.sendMail({
        from: `"OTDAV" <${process.env.EMAIL_USER}>`,
        to: email.trim().toLowerCase(),
        subject: 'Bienvenue sur OTDAV Connect / مرحباً بك في OTDAV Connect',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #1a3c6e; padding: 20px; text-align: center;">
              <h2 style="color: white; margin: 0;">OTDAV Connect</h2>
              <p style="color: #ccc; margin: 5px 0;">Organisme Tunisien des Droits d'Auteur et des Droits Voisins</p>
            </div>
            <div style="padding: 30px; background: #f9f9f9;">
              <p>Bonjour <strong>${fullName}</strong>,</p>
              <p>Bienvenue sur <strong>OTDAV Connect</strong> — la plateforme de gestion des dépôts d'œuvres.</p>
              <p>Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter et commencer à utiliser la plateforme.</p>
              <br/>
              <p style="direction: rtl; text-align: right;">مرحباً <strong>${fullName}</strong>،</p>
              <p style="direction: rtl; text-align: right;">أهلاً بك في <strong>OTDAV Connect</strong> — منصة إدارة إيداع المصنفات.</p>
              <p style="direction: rtl; text-align: right;">تم إنشاء حسابك بنجاح. يمكنك الآن تسجيل الدخول والبدء في استخدام المنصة.</p>
              <br/>
              <p>Cordialement / مع التحية،</p>
              <p><strong>L'équipe OTDAV / فريق OTDAV</strong></p>
            </div>
            <div style="background: #1a3c6e; padding: 10px; text-align: center;">
              <p style="color: #ccc; font-size: 12px; margin: 0;">
                المؤسسة التونسية لحقوق المؤلف والحقوق المجاورة
              </p>
            </div>
          </div>
        `
      })
    } catch (emailError) {
      console.error('Welcome email failed:', emailError)
    }

    res.status(201).json({ message: "Compte créé avec succès", userId: user.id })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Une erreur est survenue. Veuillez réessayer.' })
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