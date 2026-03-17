const express = require('express');
const router = express.Router();
const Item = require('../models/Item');

// Add a new item
router.post('/add', async (req, res) => {
  try {
    const newItem = new Item(req.body);
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all items
router.get('/', async (req, res) => {
  try {
    const items = await Item.find().sort({ dateLost: -1 });
    res.status(200).json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;