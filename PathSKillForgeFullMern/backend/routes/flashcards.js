// backend/routes/flashcards.js
import express from 'express';
import Flashcard from '../models/Flashcard.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', verifyToken, async (req, res) => {
  const cards = await Flashcard.find({ userId: req.user.id });
  res.json(cards);
});

router.patch('/:id/toggle-favorite', verifyToken, async (req, res) => {
  const card = await Flashcard.findOne({ _id: req.params.id, userId: req.user.id });
  if (card) {
    card.isFavorite = !card.isFavorite;
    await card.save();
  }
  res.json(card);
});

export default router;