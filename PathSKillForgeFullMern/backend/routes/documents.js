import express from 'express';
import multer from 'multer';
import fs from 'fs';
import pdfParse from 'pdf-parse';
import Document from '../models/Document.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/upload', verifyToken, upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const dataBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(dataBuffer);

    const doc = await Document.create({
      userId: req.user.id,
      fileName: req.file.originalname,
      fileSizeBytes: req.file.size,
      storagePath: req.file.path,
      extractedText: pdfData.text || '',
      totalPages: pdfData.numpages || 1
    });

    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', verifyToken, async (req, res) => {
  try {
    const docs = await Document.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;