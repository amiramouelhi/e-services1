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
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
module.exports = app;