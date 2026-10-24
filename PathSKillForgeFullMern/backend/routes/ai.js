import express from 'express';
import Groq from 'groq-sdk';
import Document from '../models/Document.js';
import Flashcard from '../models/Flashcard.js';
import Quiz from '../models/Quiz.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Safe Groq Client Getter
function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not set in backend/.env file');
  }
  return new Groq({ apiKey });
}

// Use the fast, stable Groq model
const MODEL_NAME = 'openai/gpt-oss-120b';

// 1. Chat with Document (Q&A)
router.post('/chat', verifyToken, async (req, res) => {
  try {
    const { documentId, question } = req.body;
    const doc = await Document.findById(documentId);
    if (!doc) return res.status(404).json({ message: 'Document not found' });

    const contextText = doc.extractedText?.trim() 
      ? doc.extractedText.slice(0, 8000) 
      : 'No text extracted from this document.';

    const groq = getGroqClient();
    const completion = await groq.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        {
          role: 'system',
          content: 'You are an expert study assistant. Answer questions clearly based on the provided document context.'
        },
        {
          role: 'user',
          content: `Document Context:\n${contextText}\n\nQuestion: ${question}`
        }
      ],
      temperature: 0.3,
      max_tokens: 800
    });

    const answer = completion.choices[0]?.message?.content || 'No response generated.';
    res.json({ answer });
  } catch (err) {
    console.error('FULL GROQ CHAT ERROR:', err);
    res.status(500).json({ error: err.message || 'Groq API failed' });
  }
});

// 2. Document Summary
router.post('/summary', verifyToken, async (req, res) => {
  try {
    const { documentId } = req.body;
    const doc = await Document.findById(documentId);
    if (!doc) return res.status(404).json({ message: 'Document not found' });

    const groq = getGroqClient();
    const completion = await groq.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        {
          role: 'system',
          content: 'You are an academic summarizer. Write clear, structured summaries.'
        },
        {
          role: 'user',
          content: `Provide an executive summary and 5 key bullet points for the following text:\n\n${doc.extractedText.slice(0, 10000)}`
        }
      ],
      temperature: 0.3
    });

    const summaryText = completion.choices[0]?.message?.content || '';
    doc.summary = { executiveSummary: summaryText, keyTakeaways: [] };
    await doc.save();

    res.json({ summary: summaryText });
  } catch (err) {
    console.error('Groq Summary Error:', err);
    res.status(500).json({ error: err.message });
  }
});
// 3. Generate Flashcards (with custom count & difficulty)
router.post('/generate-flashcards', verifyToken, async (req, res) => {
  try {
    const { documentId, count = 5, difficulty = 'Medium' } = req.body;
    const doc = await Document.findById(documentId);
    if (!doc) return res.status(404).json({ message: 'Document not found' });

    const groq = getGroqClient();
    const completion = await groq.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        {
          role: 'system',
          content: 'You are an educational tutor. Output STRICTLY raw JSON array format without markdown ticks, fences, or extra text.'
        },
        {
          role: 'user',
          content: `Generate ${count} flashcards with difficulty level "${difficulty}" from the text.
Output format must be a raw JSON array of objects with keys "frontPrompt", "backSolution", and "difficulty_level" (set to "${difficulty}"):

${doc.extractedText.slice(0, 8000)}`
        }
      ],
      temperature: 0.2
    });

    const rawResponse = completion.choices[0]?.message?.content || '[]';
    const cleaned = rawResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
    const cardsData = JSON.parse(cleaned);

    const createdCards = await Flashcard.insertMany(
      cardsData.map((c) => ({
        userId: req.user.id,
        documentId: doc._id,
        frontPrompt: c.frontPrompt,
        backSolution: c.backSolution,
        difficultyLevel: c.difficulty_level || difficulty,
        isFavorite: false
      }))
    );

    res.json(createdCards);
  } catch (err) {
    console.error('Groq Flashcards Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 4. Generate Quiz (with custom count & difficulty)
router.post('/generate-quiz', verifyToken, async (req, res) => {
  try {
    const { documentId, count = 5, difficulty = 'Medium' } = req.body;
    const doc = await Document.findById(documentId);
    if (!doc) return res.status(404).json({ message: 'Document not found' });

    const groq = getGroqClient();
    const completion = await groq.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        {
          role: 'system',
          content: 'You are an academic test maker. Output STRICTLY raw JSON array format without markdown ticks or code fences.'
        },
        {
          role: 'user',
          content: `Create a ${count}-question multiple choice quiz with difficulty "${difficulty}" from this text.
The JSON must be an array of objects with these exact keys:
- "questionText": string
- "options": array of 4 strings
- "correctAnswerIndex": number from 0 to 3
- "explanation": string

Text:
${doc.extractedText.slice(0, 8000)}`
        }
      ],
      temperature: 0.2
    });

    const rawResponse = completion.choices[0]?.message?.content || '[]';
    const cleaned = rawResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
    const questions = JSON.parse(cleaned);

    const quiz = await Quiz.create({
      userId: req.user.id,
      documentId: doc._id,
      quizTitle: `${doc.fileName} (${difficulty})`,
      totalQuestions: questions.length,
      questions
    });

    res.json(quiz);
  } catch (err) {
    console.error('Groq Quiz Error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;