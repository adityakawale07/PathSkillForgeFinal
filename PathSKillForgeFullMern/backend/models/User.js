import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, default: 'learner' },
  preferences: {
    theme: { type: String, default: 'light' },
    defaultQuizCount: { type: Number, default: 5 }
  }
}, { timestamps: true });

export default mongoose.model('User', userSchema);