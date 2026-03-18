import express from 'express';
import Session from '../models/Session.js';
import User from '../models/User.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { difficulty = 'all', limit = 10 } = req.query;
    
    const query = difficulty !== 'all' ? { difficulty } : {};
    
    const topSessions = await Session.find(query)
      .sort({ score: -1 })
      .limit(parseInt(limit))
      .populate('userId', 'username');
    
    const leaderboard = topSessions.map((session, index) => ({
      rank: index + 1,
      username: session.userId.username,
      score: session.score,
      difficulty: session.difficulty,
      date: session.createdAt
    }));
    
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
