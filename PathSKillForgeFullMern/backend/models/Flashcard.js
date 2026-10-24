import mongoose from 'mongoose';

const flashcardSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
  frontPrompt: { type: String, required: true },
  backSolution: { type: String, required: true },
  isFavorite: { type: Boolean, default: false },
  isMastered: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Flashcard', flashcardSchema);