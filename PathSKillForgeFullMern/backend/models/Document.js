import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileName: { type: String, required: true },
  fileSizeBytes: { type: Number, required: true },
  storagePath: { type: String, required: true },
  extractedText: { type: String, default: '' },
  totalPages: { type: Number, default: 1 },
  isFavorite: { type: Boolean, default: false },
  summary: {
    executiveSummary: String,
    keyTakeaways: [String]
  }
}, { timestamps: true });

export default mongoose.model('Document', documentSchema);