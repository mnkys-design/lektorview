
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const DiffMatchPatch = require('diff-match-patch');

const app = express();
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
             console.log('Unauthorized attempt to generate key');
             return res.status(403).json({ error: "Invalid Admin Secret" });
        }

        console.log('Generating API Key...');
        const db = readDB();
        const newApiKey = crypto.randomBytes(16).toString('hex');
        
        if (!db.apiKeys) {
            db.apiKeys = [];
        }
        
        db.apiKeys.push(newApiKey);
        writeDB(db);
        console.log('API Key Generated:', newApiKey);
        res.json({ apiKey: newApiKey });
    } catch (error) {
        console.error("Error generating API key:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Create a new comparison with SERVER-SIDE index correction
app.post('/api/comparisons', apiKeyMiddleware, (req, res) => {
  try {
      const { originalText, correctedText, changeLog = [], pdfReferences } = req.body;

      if (!originalText || !correctedText) {
        return res.status(400).json({ error: 'Original and corrected text are required.' });
      }
      
      const dmp = new DiffMatchPatch();

      const correctedChangeLog = changeLog.map((change, index) => {
          const { originalSnippet, correctedSnippet } = change;
          let originalIndex = -1;
          let correctedIndex = -1;
          
          // Find the best match for the snippet in the respective texts
          // This is more robust than indexOf, especially for repeated words.
          if (originalSnippet) {
              originalIndex = dmp.match_main(originalText, originalSnippet, 0);
          }
          if (correctedSnippet) {
              correctedIndex = dmp.match_main(correctedText, correctedSnippet, 0);
          }

          // Fallback to simple indexOf if dmp fails, but log a warning.
          if(originalIndex === -1 && originalSnippet) {
              console.warn(`DMP failed for originalSnippet: "${originalSnippet}". Falling back to indexOf.`);
              originalIndex = originalText.indexOf(originalSnippet);
          }
          if(correctedIndex === -1 && correctedSnippet) {
              console.warn(`DMP failed for correctedSnippet: "${correctedSnippet}". Falling back to indexOf.`);
              correctedIndex = correctedText.indexOf(correctedSnippet);
          }

          return {
              ...change,
              id: change.id || `c${index + 1}`, // Ensure ID exists
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

      const db = readDB();
      const slug = crypto.randomBytes(8).toString('hex');
      const newComparison = {
        slug,
        originalText,
        correctedText,
        changeLog: correctedChangeLog,
        pdfReferences: pdfReferences || {},
        createdAt: new Date().toISOString(),
      };
      
      if (!db.comparisons) {
          db.comparisons = {};
      }

      db.comparisons[slug] = newComparison;
      writeDB(db);

      const shareUrl = `${req.protocol}://${req.get('host')}/view/${slug}`;
      res.status(201).json({ slug, shareUrl });
  } catch (error) {
      console.error("Error creating comparison:", error);
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
  console.log(`Admin Secret is set to: ${ADMIN_SECRET}`);
});
