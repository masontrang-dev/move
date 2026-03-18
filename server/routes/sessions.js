import express from 'express';
import Session from '../models/Session.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { score, difficulty, duration, hitsLanded, dodgesFailed, maxCombo } = req.body;

    const session = new Session({
      userId: req.userId,
      score,
      difficulty,
      duration,
      hitsLanded,
      dodgesFailed,
      maxCombo
    });

    await session.save();
    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/history', authMiddleware, async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.userId });
    
    const stats = {
      totalSessions: sessions.length,
      totalScore: sessions.reduce((sum, s) => sum + s.score, 0),
      averageScore: sessions.length > 0 
        ? sessions.reduce((sum, s) => sum + s.score, 0) / sessions.length 
        : 0,
      bestScore: sessions.length > 0 
        ? Math.max(...sessions.map(s => s.score)) 
        : 0,
      totalHits: sessions.reduce((sum, s) => sum + s.hitsLanded, 0),
      bestCombo: sessions.length > 0 
        ? Math.max(...sessions.map(s => s.maxCombo)) 
        : 0
    };
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
