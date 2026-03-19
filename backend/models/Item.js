const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    itemName: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    dateLost: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["Lost", "Found"],
      default: "Lost",
    },
    contactInfo: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Item", itemSchema);
