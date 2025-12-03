
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
// NEW: Static Bearer Token for Agents (defaults to Admin Secret if not set)
const API_BEARER_TOKEN = process.env.API_BEARER_TOKEN || ADMIN_SECRET; 

// Ensure db.json exists
if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ comparisons: {}, apiKeys: [] }, null, 2), 'utf8');
}

// --- DEBUGGING MIDDLEWARE ---
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'X-Requested-With'],
    credentials: false
}));

app.use(express.json({ 
    limit: '50mb',
    verify: (req, res, buf) => {
        req.rawBody = buf;
    }
}));


// Helper functions...
const readDB = () => JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
const writeDB = (data) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');

// --- UNIFIED AUTH MIDDLEWARE ---
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const legacyApiKey = req.headers['x-api-key'];
  
  // 1. Check Bearer Token (Preferred for Agents)
  if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      // Debug log (masked)
      console.log(`[AUTH CHECK] Bearer Token: ${token ? (token.substring(0,4) + '***') : 'NONE'}`);
      
      if (token === API_BEARER_TOKEN) {
          return next();
      }
      console.warn(`[AUTH FAIL] Invalid Bearer Token.`);
  }
  
  // 2. Check Legacy API Key (For Frontend / db.json)
  else if (legacyApiKey) {
      console.log(`[AUTH CHECK] Legacy x-api-key: ${legacyApiKey.substring(0,4) + '***'}`);
      const db = readDB();
      if (db.apiKeys && db.apiKeys.includes(legacyApiKey)) {
          return next();
      }
      console.warn(`[AUTH FAIL] Invalid x-api-key.`);
  } 
  
  // 3. No valid auth found
  else {
      console.warn(`[AUTH FAIL] No Authorization header or x-api-key found.`);
  }

  return res.status(401).json({ error: 'Unauthorized: Invalid API Key or Bearer Token' });
};

// --- API Endpoints ---

// 1. Serve OpenAPI Spec for Agents
app.get('/openapi.json', (req, res) => {
    res.sendFile(path.join(__dirname, 'openapi.json'));
});

// 2. Legacy Auth Endpoint (Only for Frontend/Manual use now)
app.post('/api/auth', (req, res) => {
    const { adminSecret } = req.body;
    if (adminSecret !== ADMIN_SECRET) {
        return res.status(401).json({ error: "Invalid Admin Secret" });
    }
    const newApiKey = crypto.randomBytes(16).toString('hex');
    const db = readDB();
    if (!db.apiKeys) { db.apiKeys = []; }
    db.apiKeys.push(newApiKey);
    writeDB(db);
    console.log(`[AUTH SUCCESS] New Legacy API Key generated via /api/auth`);
    res.json({ apiKey: newApiKey });
});

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

// 3. Main Comparison Endpoint (Protected by Unified Auth)
app.post('/api/comparisons', authMiddleware, (req, res) => {
    if (req.rawBody) {
        console.log("[DEBUG] Raw Body Length:", req.rawBody.length);
    }

    const { originalText, correctedText, changeLog = [] } = req.body;

    if (!originalText || !correctedText) {
      console.error("[ERROR] Missing originalText or correctedText");
      return res.status(400).json({ error: 'Original and corrected text are required.' });
    }
    
    const correctedChangeLog = changeLog.map((change, index) => {
        const { originalSnippet, correctedSnippet } = change;
        const originalIndex = originalSnippet ? originalText.indexOf(originalSnippet) : -1;
        const correctedIndex = correctedSnippet ? correctedText.indexOf(correctedSnippet) : -1;

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
    console.log(`[SUCCESS] Comparison created. Slug: ${slug}`);
    console.log(`[OUTPUT] Share URL: ${shareUrl}`);
    
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
app.use((err, req, res, next) => {
    console.error('--- UNHANDLED ERROR ---');
    console.error(err);
    res.status(500).json({ error: 'An unexpected server error occurred.' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
  console.log(`API Bearer Token configured.`);
});
