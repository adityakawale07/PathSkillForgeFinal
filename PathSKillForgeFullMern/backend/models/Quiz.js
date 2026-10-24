import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
  quizTitle: { type: String, default: 'Knowledge Assessment' },
  totalQuestions: Number,
  score: { type: Number, default: 0 },
  percentage: { type: Number, default: 0 },
  timeSpentSec: { type: Number, default: 0 },
  questions: [{
    questionText: String,
    options: [String],
    correctAnswerIndex: Number,
    selectedAnswerIndex: Number,
    isCorrect: Boolean,
    explanation: String
  }]
}, { timestamps: true });

export default mongoose.model('Quiz', quizSchema);