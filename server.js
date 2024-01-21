const express = require('express');
const sqlite3 = require('sqlite3');
const cors = require('cors');
const app = express();
const port = 3000;

// Middleware to parse JSON requests
app.use(express.json());
app.use(cors()); // Enable CORS for all routes

// Serve static files from 'public' directory (or whichever directory your frontend files are in)
app.use(express.static('public'));

// Initialize SQLite database
const db = new sqlite3.Database('./scores.db', (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('Connected to the SQLite database.');
        db.run(`CREATE TABLE IF NOT EXISTS scores (
      userId TEXT PRIMARY KEY,
      score INTEGER DEFAULT 0
    )`);
    }
});

// Endpoint to update user score
app.post('/update-score', (req, res) => {
    const { userId, score } = req.body;
    const query = `INSERT INTO scores(userId, score) VALUES(?, ?)
                 ON CONFLICT(userId) DO UPDATE SET score = score + ?`;

    db.run(query, [userId, score, score], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({
            message: 'Score updated successfully',
            userId,
            score,
            id: this.lastID,
        });
    });
});

// Endpoint to get leaderboard
app.get('/leaderboard', (req, res) => {
    const query = `SELECT userId, score FROM scores ORDER BY score DESC LIMIT 10`;
    db.all(query, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Leaderboard retrieved successfully', data: rows });
    });
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
