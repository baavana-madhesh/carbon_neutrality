const mongoose = require("mongoose");

const SourceSchema = new mongoose.Schema({
  type: { type: String, required: true }, 
  title: String,               // for custom source
  quantity: Number,
  unit: String,
  emissionFactor: Number,
  co2: Number                  // calculated CO2
});

const CarbonEntrySchema = new mongoose.Schema({
  campusBlock: String,
  month: String,
  year: Number,

  sources: [SourceSchema],

  totalEmission: Number,
  totalAbsorption: Number,
  netCarbon: Number,

  remarks: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("CarbonEntry", CarbonEntrySchema);
