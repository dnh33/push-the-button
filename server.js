const express = require('express');
const sqlite3 = require('sqlite3');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(express.json());
app.use(cors()); // Enable CORS for all routes
app.use(express.static('public')); // Serve static files

// Initialize SQLite database
const db = new sqlite3.Database('./game.db', (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('Connected to the SQLite database.');
        db.run(`CREATE TABLE IF NOT EXISTS scores (
            userId TEXT PRIMARY KEY,
            score INTEGER DEFAULT 0,
            last_clicked DATETIME
        )`);
    }
});

// Endpoint to check if the user can click
app.post('/can-click', (req, res) => {
    const { userId } = req.body;
    const currentTime = new Date();

    db.get(
        `SELECT last_clicked FROM scores WHERE userId = ?`,
        [userId],
        (err, row) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }

            if (row && row.last_clicked) {
                const lastClickedTime = new Date(row.last_clicked);
                const diffHours =
                    (currentTime - lastClickedTime) / (1000 * 60 * 60);
                if (diffHours < 24) {
                    res.status(403).json({
                        message: 'Click allowed only once every 24 hours.',
                    });
                    return;
                }
            }

            res.json({ canClick: true });
        }
    );
});

// Endpoint to update user score
app.post('/update-score', (req, res) => {
    const { userId } = req.body;
    const currentTime = new Date();

    const query = `INSERT INTO scores(userId, score, last_clicked) VALUES(?, 1, ?)
                  ON CONFLICT(userId) DO UPDATE SET score = score + 1, last_clicked = ?`;
    db.run(
        query,
        [userId, currentTime.toISOString(), currentTime.toISOString()],
        function (updateErr) {
            if (updateErr) {
                res.status(500).json({ error: updateErr.message });
                return;
            }
            res.json({
                message: 'Score updated successfully',
                userId,
                score: this.changes,
            });
        }
    );
});

// Endpoint to get leaderboard
app.get('/leaderboard', (req, res) => {
    const query = `SELECT userId, score FROM scores ORDER BY score DESC`;
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
