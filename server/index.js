
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
// Simple Admin Secret for demonstration. In production, use process.env.ADMIN_SECRET
const ADMIN_SECRET = process.env.ADMIN_SECRET || "lektor-admin-123";

// Ensure db.json exists
if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ comparisons: {}, apiKeys: [] }, null, 2), 'utf8');
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Helper function to read from DB
const readDB = () => {
  try {
      const db = fs.readFileSync(DB_PATH, 'utf8');
      return JSON.parse(db);
  } catch (err) {
      console.error("Error reading DB:", err);
      return { comparisons: {}, apiKeys: [] };
  }
};

// Helper function to write to DB
const writeDB = (data) => {
    try {
        fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
        console.error("Error writing DB:", err);
    }
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

// Generate API Key (SECURED)
app.post('/api/generate-key', (req, res) => {
    try {
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
    } catch (error) {
        console.error("Error generating API key:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Create a new comparison with robust index correction
app.post('/api/comparisons', apiKeyMiddleware, (req, res) => {
  try {
      console.log("Received new comparison request...");
      const { originalText, correctedText, changeLog = [] } = req.body;

      if (!originalText || !correctedText) {
        return res.status(400).json({ error: 'Original and corrected text are required.' });
      }
      
      const correctedChangeLog = changeLog.map((change, index) => {
          const { originalSnippet, correctedSnippet } = change;
          
          // Use simple, fast, and reliable indexOf search.
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
              originalRange: originalIndex !== -1 ? {
                  start: originalIndex,
                  end: originalIndex + originalSnippet.length
              } : { start: 0, end: 0 },
              correctedRange: correctedIndex !== -1 ? {
                  start: correctedIndex,
                  end: correctedIndex + correctedSnippet.length
              } : { start: 0, end: 0 }
          };
      });

      console.log("Successfully processed changeLog.");

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

  } catch (error) {
      console.error("FATAL Error creating comparison:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get a comparison by slug
app.get('/api/public/comparisons/:slug', (req, res) => {
  try {
      const { slug } = req.params;
      const db = readDB();
      const comparison = db.comparisons ? db.comparisons[slug] : null;

      if (!comparison) {
        return res.status(404).json({ error: 'Comparison not found.' });
      }

      res.json(comparison);
  } catch (error) {
      console.error("Error fetching comparison:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
});

// --- SERVE FRONTEND (STATIC FILES) ---
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
    console.log(`Serving static files from ${distPath}`);
    app.use(express.static(distPath));
    app.get(/.*/, (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
    });
} else {
    console.log("No dist folder found. API only mode.");
}

// --- Server ---
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
});
