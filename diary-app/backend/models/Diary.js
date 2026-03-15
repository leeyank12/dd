const mongoose = require('mongoose');

const MOODS = ['Happy', 'Sad', 'Excited', 'Stressed', 'Neutral'];

const diarySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    mood: {
      type: String,
      required: [true, 'Mood is required'],
      enum: {
        values: MOODS,
        message: `Mood must be one of: ${MOODS.join(', ')}`,
      },
    },
  },
  
  {
    timestamps: true,
  }
  
);

// Index for efficient date-based queries
diarySchema.index({ date: -1 });
diarySchema.index({ mood: 1, date: -1 });

module.exports = mongoose.model('Diary', diarySchema);
