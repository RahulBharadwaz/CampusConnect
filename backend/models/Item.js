const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  dateLost: { type: Date, default: Date.now },
  status: { type: String, default: 'Lost' }, 
  contactInfo: { type: String, required: true }
});

module.exports = mongoose.model('Item', itemSchema);