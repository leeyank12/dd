const express = require('express');
const router = express.Router();
const Diary = require('../models/Diary');

// GET /api/analytics/dashboard — full dashboard data
router.get('/dashboard', async (req, res, next) => {
  try {
    const [totalEntries, moodDistribution, weeklyTrend, mostCommon] =
      await Promise.all([
        // Total count
        Diary.countDocuments(),

        // Mood distribution (all time)
        Diary.aggregate([
          { $group: { _id: '$mood', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),

        // Weekly mood trend (last 7 days, grouped by day)
        Diary.aggregate([
          {
            $match: {
              date: {
                $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              },
            },
          },
          {
            $group: {
              _id: {
                date: {
                  $dateToString: { format: '%Y-%m-%d', date: '$date' },
                },
                mood: '$mood',
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { '_id.date': 1 } },
        ]),

        // Most common mood
        Diary.aggregate([
          { $group: { _id: '$mood', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 1 },
        ]),
      ]);

    // Mood trend: last 30 days grouped by week
    const monthlyTrend = await Diary.aggregate([
      {
        $match: {
          date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: {
            week: { $week: '$date' },
            mood: '$mood',
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.week': 1 } },
    ]);

    res.json({
      totalEntries,
      moodDistribution: moodDistribution.map((m) => ({
        mood: m._id,
        count: m.count,
        percentage: totalEntries
          ? Math.round((m.count / totalEntries) * 100)
          : 0,
      })),
      weeklyTrend,
      monthlyTrend,
      mostCommonMood: mostCommon[0]?._id || null,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/analytics/mood-trend — mood over time (customizable range)
router.get('/mood-trend', async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    const since = new Date(Date.now() - Number(days) * 24 * 60 * 60 * 1000);

    const trend = await Diary.aggregate([
      { $match: { date: { $gte: since } } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
            mood: '$mood',
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.date': 1 } },
    ]);

    res.json(trend);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
