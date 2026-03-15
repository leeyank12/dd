const express = require('express');
const router = express.Router();
const Diary = require('../models/Diary');
const protect = require('../middleware/auth');

// GET /api/diary — fetch all entries for logged in user
router.get('/', protect, async (req, res, next) => {
  try {
    const { mood, startDate, endDate, search, page = 1, limit = 20 } = req.query;
    const filter = { user: req.user._id };

    if (mood) filter.mood = mood;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [entries, total] = await Promise.all([
      Diary.find(filter).sort({ date: -1 }).skip(skip).limit(Number(limit)),
      Diary.countDocuments(filter),
    ]);

    res.json({
      entries,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/diary/:id — fetch single entry
router.get('/:id', protect, async (req, res, next) => {
  try {
    const entry = await Diary.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!entry) return res.status(404).json({ error: 'Entry not found' });
    res.json(entry);
  } catch (err) {
    next(err);
  }
});

// POST /api/diary — create new entry
router.post('/', protect, async (req, res, next) => {
  try {
    const { title, description, date, mood } = req.body;
    const entry = await Diary.create({
      title,
      description,
      date,
      mood,
      user: req.user._id,
    });
    res.status(201).json(entry);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation failed',
        details: Object.values(err.errors).map((e) => e.message),
      });
    }
    next(err);
  }
});

// PUT /api/diary/:id — update entry
router.put('/:id', protect, async (req, res, next) => {
  try {
    const { title, description, date, mood } = req.body;
    const entry = await Diary.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { title, description, date, mood },
      { new: true, runValidators: true }
    );
    if (!entry) return res.status(404).json({ error: 'Entry not found' });
    res.json(entry);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation failed',
        details: Object.values(err.errors).map((e) => e.message),
      });
    }
    next(err);
  }
});

// DELETE /api/diary/:id — delete entry
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const entry = await Diary.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!entry) return res.status(404).json({ error: 'Entry not found' });
    res.json({ message: 'Entry deleted successfully', id: req.params.id });
  } catch (err) {
    next(err);
  }
});

module.exports = router;