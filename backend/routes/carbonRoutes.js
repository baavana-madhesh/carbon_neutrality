const express = require("express");
const router = express.Router();
const CarbonEntry = require("../models/CarbonEntry");
const auth = require("../middleware/authMiddleware");

// ADD CARBON ENTRY
router.post("/add", auth, async (req, res) => {
  try {
    const {
      campusBlock,
      month,
      year,
      date,      // ✅ get date from frontend
      sources,
      remarks
    } = req.body;

    let totalEmission = 0;
    let totalAbsorption = 0;

    sources.forEach(src => {
      if (src.type === "green") {
        totalAbsorption += src.co2;
      } else {
        totalEmission += src.co2;
      }
    });

    const netCarbon = totalEmission - totalAbsorption;

    const entry = new CarbonEntry({
      campusBlock,
      month,
      year,
      date,        // ✅ save date
      sources,
      totalEmission,
      totalAbsorption,
      netCarbon,
      remarks,
      createdBy: req.user.id
    });

    await entry.save();

    res.json({
      message: "Carbon data added successfully",
      entry
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

// GET HISTORY
router.get("/history", auth, async (req, res) => {
  try {
    const entries = await CarbonEntry.find({
      createdBy: req.user.id
    }).sort({
      date: -1   // sort by selected date
    });

    res.json({ entries });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

module.exports = router;
