const express = require("express");
const cors = require("cors");
const prisma = require("./config/prisma");
const categorieRoutes=require("./routes/categorie.routes");
const deposantRoutes=require("./routes/deposant.routes");
const auteurRoutes = require("./routes/auteur.route");
const oeuvreRoutes = require("./routes/oeuvre.route");
const authRoutes = require("./routes/auth.routes");
const depotRoutes = require("./routes/depot.routes");
const adminRoutes = require("./routes/admin.routes");
const autorisationRoutes = require('./routes/autorisation.routes');

const app = express();
const path = require("path");
app.use(cors());
app.use(express.json());


app.get("/", (req, res) => {
  res.json({ message: "server is running" });
});


app.use("/admin", adminRoutes);
app.use("/categories",categorieRoutes);
app.use("/deposants",deposantRoutes);
app.use("/auteurs", auteurRoutes);
app.use("/oeuvres", oeuvreRoutes);
app.use("/auth", authRoutes);
app.use("/depots", depotRoutes);
app.use('/autorisations', autorisationRoutes);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get('/test-email', async (req, res) => {
  const transporter = require('./config/mailer')
  try {
    await transporter.sendMail({
      from: `"OTDAV" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // sends to yourself
      subject: 'Test OTDAV Email',
      html: '<h1>Email works! ✅</h1><p>OTDAV renewal system is configured correctly.</p>'
    })
    res.json({ message: 'Email sent successfully ✅' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})
module.exports = app;