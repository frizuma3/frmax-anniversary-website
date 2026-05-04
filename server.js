require('dotenv').config();
const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'change-this-password';

const db = new sqlite3.Database('./messages.db');
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    location TEXT,
    email TEXT,
    message TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS rsvps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    attendance TEXT NOT NULL,
    guest_count INTEGER,
    location TEXT,
    note TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);
});

app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: '50kb' }));
app.use(express.static(path.join(__dirname, 'public')));

const submitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 12,
  message: { error: 'Too many submissions. Please try again later.' }
});

function clean(value, max = 1000) {
  return String(value || '').trim().slice(0, max);
}

function checkPassword(req, res) {
  const password = clean(req.body.password, 200);
  if (password !== ADMIN_PASSWORD) {
    res.status(401).json({ error: 'Incorrect admin password.' });
    return false;
  }
  return true;
}

app.post('/api/messages', submitLimiter, (req, res) => {
  const name = clean(req.body.name, 100);
  const location = clean(req.body.location, 120);
  const email = clean(req.body.email, 160);
  const message = clean(req.body.message, 2000);

  if (!name || !message) {
    return res.status(400).json({ error: 'Name and message are required.' });
  }

  db.run(
    'INSERT INTO messages (name, location, email, message) VALUES (?, ?, ?, ?)',
    [name, location, email, message],
    function (err) {
      if (err) return res.status(500).json({ error: 'Could not save message.' });
      res.json({ success: true, id: this.lastID });
    }
  );
});

app.post('/api/rsvps', submitLimiter, (req, res) => {
  const name = clean(req.body.name, 100);
  const email = clean(req.body.email, 160);
  const phone = clean(req.body.phone, 60);
  const attendance = clean(req.body.attendance, 80);
  const guestCountRaw = clean(req.body.guest_count, 4);
  const guest_count = guestCountRaw === '' ? null : Math.max(0, Math.min(20, Number.parseInt(guestCountRaw, 10) || 0));
  const location = clean(req.body.location, 120);
  const note = clean(req.body.note, 1000);

  if (!name || !attendance) {
    return res.status(400).json({ error: 'Name and attendance response are required.' });
  }

  db.run(
    'INSERT INTO rsvps (name, email, phone, attendance, guest_count, location, note) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [name, email, phone, attendance, guest_count, location, note],
    function (err) {
      if (err) return res.status(500).json({ error: 'Could not save RSVP.' });
      res.json({ success: true, id: this.lastID });
    }
  );
});

app.post('/api/admin/messages', (req, res) => {
  if (!checkPassword(req, res)) return;
  db.all('SELECT * FROM messages ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Could not fetch messages.' });
    res.json({ messages: rows });
  });
});

app.post('/api/admin/rsvps', (req, res) => {
  if (!checkPassword(req, res)) return;
  db.all('SELECT * FROM rsvps ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Could not fetch RSVP responses.' });
    res.json({ rsvps: rows });
  });
});

app.delete('/api/admin/messages/:id', (req, res) => {
  if (!checkPassword(req, res)) return;
  db.run('DELETE FROM messages WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: 'Could not delete message.' });
    res.json({ success: true });
  });
});

app.delete('/api/admin/rsvps/:id', (req, res) => {
  if (!checkPassword(req, res)) return;
  db.run('DELETE FROM rsvps WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: 'Could not delete RSVP.' });
    res.json({ success: true });
  });
});

app.listen(PORT, () => {
  console.log(`Anniversary website running at http://localhost:${PORT}`);
});
