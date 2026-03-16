const express = require('express');
const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

const app = express();
const PORT = process.env.PORT || 3001;
const DB_FILE = path.join(__dirname, 'db.json');

app.use(express.json());

function readDB() {
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch {
    return { phase: 'submission', stories: [], votes: [] };
  }
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// GET /api/state
app.get('/api/state', (req, res) => {
  res.json(readDB());
});

// POST /api/stories — submit a story
app.post('/api/stories', (req, res) => {
  const db = readDB();
  if (db.phase !== 'submission') {
    return res.status(400).json({ error: 'Not in submission phase' });
  }
  const { author, text, emojis } = req.body;
  if (!author || !text) {
    return res.status(400).json({ error: 'author and text are required' });
  }
  const story = { id: randomUUID(), author, text, emojis: emojis || [] };
  db.stories.push(story);
  writeDB(db);
  res.json({ stories: db.stories });
});

// POST /api/votes — cast a vote
app.post('/api/votes', (req, res) => {
  const db = readDB();
  if (db.phase !== 'voting') {
    return res.status(400).json({ error: 'Not in voting phase' });
  }
  const { voterId, storyId } = req.body;
  if (!voterId || !storyId) {
    return res.status(400).json({ error: 'voterId and storyId are required' });
  }
  const alreadyVoted = db.votes.some(v => v.voterId === voterId);
  if (alreadyVoted) {
    return res.status(409).json({ error: 'Already voted' });
  }
  db.votes.push({ voterId, storyId });
  writeDB(db);
  res.json({ votes: db.votes });
});

// POST /api/phase — change phase
app.post('/api/phase', (req, res) => {
  const { phase } = req.body;
  const valid = ['submission', 'voting', 'results'];
  if (!valid.includes(phase)) {
    return res.status(400).json({ error: 'Invalid phase' });
  }
  const db = readDB();
  db.phase = phase;
  writeDB(db);
  res.json({ phase: db.phase });
});

// POST /api/reset — reset game
app.post('/api/reset', (req, res) => {
  const fresh = { phase: 'submission', stories: [], votes: [] };
  writeDB(fresh);
  res.json(fresh);
});

// Serve Vite build in production
app.use(express.static(path.join(__dirname, '../dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
