
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const DB_PATH = path.join(__dirname, 'db.json');

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Helper function to read from DB
const readDB = () => {
  const db = fs.readFileSync(DB_PATH, 'utf8');
  return JSON.parse(db);
};

// Helper function to write to DB
const writeDB = (data) => {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
};

// API Key Middleware
const apiKeyMiddleware = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  const db = readDB();
  if (!apiKey || !db.apiKeys.includes(apiKey)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// --- API Endpoints ---

// Generate API Key
app.post('/api/generate-key', (req, res) => {
    const db = readDB();
    const newApiKey = crypto.randomBytes(16).toString('hex');
    db.apiKeys.push(newApiKey);
    writeDB(db);
    res.json({ apiKey: newApiKey });
});

// Upload and Create a new comparison
app.post('/api/comparisons', apiKeyMiddleware, (req, res) => {
  const { originalText, correctedText, changeLog, pdfReferences } = req.body;

  if (!originalText || !correctedText) {
    return res.status(400).json({ error: 'Original and corrected text are required.' });
  }

  const db = readDB();
  const slug = crypto.randomBytes(8).toString('hex');
  const newComparison = {
    slug,
    originalText,
    correctedText,
    changeLog: changeLog || [],
    pdfReferences: pdfReferences || {},
    createdAt: new Date().toISOString(),
  };

  db.comparisons[slug] = newComparison;
  writeDB(db);

  const shareUrl = `${req.protocol}://${req.get('host')}/view/${slug}`;
  res.status(201).json({ slug, shareUrl });
});

// Get a comparison by slug
app.get('/api/public/comparisons/:slug', (req, res) => {
  const { slug } = req.params;
  const db = readDB();
  const comparison = db.comparisons[slug];

  if (!comparison) {
    return res.status(404).json({ error: 'Comparison not found.' });
  }

  res.json(comparison);
});

// --- Server ---
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

