const mongoose = require("mongoose");

const SourceSchema = new mongoose.Schema({
  type: { type: String, required: true },
  title: String,
  quantity: Number,
  unit: String,
  emissionFactor: Number,
  co2: Number
});

const CarbonEntrySchema = new mongoose.Schema({
  campusBlock: String,
  month: String,
  year: Number,

  // ✅ ADD THIS (this was missing)
  date: { type: Date, required: true },

  sources: [SourceSchema],

  totalEmission: Number,
  totalAbsorption: Number,
  netCarbon: Number,

  remarks: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }

}, { timestamps: true }); // keeps createdAt

module.exports = mongoose.model("CarbonEntry", CarbonEntrySchema);
