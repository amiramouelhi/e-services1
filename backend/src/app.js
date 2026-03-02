const express = require("express");
const cors = require("cors");
const prisma = require("./config/prisma");
const categorieRoutes=require("./routes/categorie.routes");
const deposantRoutes=require("./routes/deposant.routes");
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "server is running" });
});

// app.get("/test-prisma", async (req, res) => {
//   try {
//     const categories = await prisma.categorie.findMany();
//     res.json(categories);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

app.use("/categories",categorieRoutes);
app.use("/deposants",deposantRoutes);


module.exports = app;