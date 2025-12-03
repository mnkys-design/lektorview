
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const app = express();
// FIX for Coolify/Reverse Proxy: Trust the X-Forwarded-* headers
app.set("trust proxy", 1);

const PORT = process.env.PORT || 3001;
const DB_PATH = path.join(__dirname, 'db.json');
const ADMIN_SECRET = process.env.ADMIN_SECRET || "lektor-admin-123";

// Ensure db.json exists
if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ comparisons: {}, apiKeys: [] }, null, 2), 'utf8');
}

// Middleware
app.use(cors());
// IMPORTANT: Use a raw body parser to log the incoming request for debugging
app.use(express.json({ 
    limit: '50mb',
    verify: (req, res, buf) => {
        // Save the raw buffer to the request object
        req.rawBody = buf;
    }
}));


// Helper functions...
const readDB = () => JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
const writeDB = (data) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');

// API Key Middleware
const apiKeyMiddleware = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  const db = readDB();
  if (!apiKey || !db.apiKeys.includes(apiKey)) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or missing API Key' });
  }
  next();
};

// --- API Endpoints ---

// 1. Serve OpenAPI Spec for Agents
app.get('/openapi.json', (req, res) => {
    res.sendFile(path.join(__dirname, 'openapi.json'));
});

// 2. Auth Endpoint for Agents to get their own key
app.post('/api/auth', (req, res) => {
    const { adminSecret } = req.body;
    
    // Check against the Environment Variable
    if (adminSecret !== ADMIN_SECRET) {
        return res.status(401).json({ error: "Invalid Admin Secret" });
    }

    // Generate a new Session API Key
    const newApiKey = crypto.randomBytes(16).toString('hex');
    const db = readDB();
    if (!db.apiKeys) { db.apiKeys = []; }
    db.apiKeys.push(newApiKey);
    writeDB(db);

    console.log(`New API Key generated via Agent Auth: ${newApiKey}`);
    res.json({ apiKey: newApiKey });
});

// Legacy manual generation (kept for backward compatibility or manual use)
app.post('/api/generate-key', (req, res) => {
    const { adminSecret } = req.body;
    if (adminSecret !== ADMIN_SECRET) {
        return res.status(403).json({ error: "Invalid Admin Secret" });
    }
    const db = readDB();
    const newApiKey = crypto.randomBytes(16).toString('hex');
    if (!db.apiKeys) { db.apiKeys = []; }
    db.apiKeys.push(newApiKey);
    writeDB(db);
    res.json({ apiKey: newApiKey });
});

app.post('/api/comparisons', apiKeyMiddleware, (req, res) => {
    // Log the raw request body from GPT for debugging
    console.log("Raw request body received:", req.rawBody.toString('utf8'));

    const { originalText, correctedText, changeLog = [] } = req.body;

    if (!originalText || !correctedText) {
      return res.status(400).json({ error: 'Original and corrected text are required.' });
    }
    
    const correctedChangeLog = changeLog.map((change, index) => {
        const { originalSnippet, correctedSnippet } = change;
        const originalIndex = originalSnippet ? originalText.indexOf(originalSnippet) : -1;
        const correctedIndex = correctedSnippet ? correctedText.indexOf(correctedSnippet) : -1;

        if (originalIndex === -1 && originalSnippet) {
            console.warn(`Snippet not found in originalText: "${originalSnippet}"`);
        }
        if (correctedIndex === -1 && correctedSnippet) {
            console.warn(`Snippet not found in correctedText: "${correctedSnippet}"`);
        }

        return {
            ...change,
            id: change.id || `c${index + 1}`,
            originalRange: originalIndex !== -1 ? { start: originalIndex, end: originalIndex + originalSnippet.length } : { start: 0, end: 0 },
            correctedRange: correctedIndex !== -1 ? { start: correctedIndex, end: correctedIndex + correctedSnippet.length } : { start: 0, end: 0 }
        };
    });

    const db = readDB();
    const slug = crypto.randomBytes(8).toString('hex');
    const newComparison = {
      slug,
      originalText,
      correctedText,
      changeLog: correctedChangeLog,
      createdAt: new Date().toISOString(),
    };
    
    if (!db.comparisons) { db.comparisons = {}; }
    db.comparisons[slug] = newComparison;
    writeDB(db);

    const shareUrl = `https://lektorview.chrustek.studio/view/${slug}`;
    console.log(`Successfully created comparison. Slug: ${slug}`);
    res.status(200).json({ slug, shareUrl });
});

app.get('/api/public/comparisons/:slug', (req, res) => {
    const { slug } = req.params;
    const db = readDB();
    const comparison = db.comparisons ? db.comparisons[slug] : null;
    if (!comparison) {
      return res.status(404).json({ error: 'Comparison not found.' });
    }
    res.json(comparison);
});

// --- SERVE FRONTEND ---
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get(/.*/, (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
    });
}

// --- GLOBAL ERROR HANDLER ---
// This is the last line of defense. If any route above throws an unhandled error,
// this middleware will catch it and send a clean JSON error response.
app.use((err, req, res, next) => {
    console.error('--- UNHANDLED ERROR ---');
    console.error(err);
    res.status(500).json({ error: 'An unexpected server error occurred.' });
});


app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
});
