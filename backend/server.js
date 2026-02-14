const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/bot", require("./routes/botRoutes"));

app.use("/api/auth", require("./routes/authRoutes"));

const carbonRoutes = require("./routes/carbonRoutes");
app.use("/api/carbon", carbonRoutes);


app.get("/", (req, res) => res.send("Carbon Neutrality Tracker API running"));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
