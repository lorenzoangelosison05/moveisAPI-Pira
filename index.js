require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const movieRoutes = require("./routes/movies");

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.get("/", (req, res) => {
  return res.status(200).json({ message: "S84 Movie Catalog API is running." });
});

app.use("/auth", authRoutes);
app.use("/movies", movieRoutes);

app.use((req, res) => {
  return res.status(404).json({ error: "Route not found." });
});

app.use((err, req, res, next) => {
  console.error(err);
  return res.status(500).json({ error: "Server error." });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
