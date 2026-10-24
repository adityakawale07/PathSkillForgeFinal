// backend/routes/quizzes.js
import express from 'express';
import Quiz from '../models/Quiz.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/:id/submit', verifyToken, async (req, res) => {
  const { answers, timeSpentSec } = req.body; // answers: { [questionIndex]: selectedIndex }
  const quiz = await Quiz.findOne({ _id: req.params.id, userId: req.user.id });
  if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

  let correctCount = 0;
  quiz.questions.forEach((q, idx) => {
    const selected = answers[idx];
    q.selectedAnswerIndex = selected;
    q.isCorrect = selected === q.correctAnswerIndex;
    if (q.isCorrect) correctCount++;
  });

  quiz.score = correctCount;
  quiz.percentage = Math.round((correctCount / quiz.questions.length) * 100);
  quiz.timeSpentSec = timeSpentSec || 0;
  await quiz.save();

  res.json(quiz);
});

router.get('/stats', verifyToken, async (req, res) => {
  const quizzes = await Quiz.find({ userId: req.user.id });
  res.json(quizzes);
});

export default router;