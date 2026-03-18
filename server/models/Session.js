import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  score: {
    type: Number,
    required: true,
    default: 0
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  duration: {
    type: Number,
    required: true
  },
  hitsLanded: {
    type: Number,
    default: 0
  },
  dodgesFailed: {
    type: Number,
    default: 0
  },
  maxCombo: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

sessionSchema.index({ userId: 1, createdAt: -1 });
sessionSchema.index({ score: -1 });

export default mongoose.model('Session', sessionSchema);
