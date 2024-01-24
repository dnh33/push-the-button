const express = require('express');
const sqlite3 = require('sqlite3');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

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
            last_clicked DATETIME,
            prize_pool REAL DEFAULT 0
        )`);
    }
});

// Endpoint to get the current score for a user
app.get('/get-score/:userId', (req, res) => {
    const userId = req.params.userId;

    db.get(
        `SELECT score FROM scores WHERE userId = ?`,
        [userId],
        (err, row) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ score: row ? row.score : 0 });
        }
    );
});

// Updated endpoint to always allow clicks
app.post('/can-click', (req, res) => {
    res.json({ canClick: true });
});

// Endpoint to update user score and prize pool
app.post('/update-score', (req, res) => {
    const { userId } = req.body;
    const contributionSatoshis = 1000; // The amount each push contributes in satoshis
    const contributionBSV = contributionSatoshis / 100000000; // Convert to BSV
    const currentTime = new Date();

    const updateScoreQuery = `INSERT INTO scores(userId, score, last_clicked, prize_pool) VALUES(?, 1, ?, ?)
                              ON CONFLICT(userId) DO UPDATE SET 
                                score = score + 1, 
                                last_clicked = ?,
                                prize_pool = prize_pool + ?`;

    db.run(
        updateScoreQuery,
        [
            userId,
            currentTime.toISOString(),
            contributionBSV,
            currentTime.toISOString(),
            contributionBSV,
        ],
        function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({
                message: 'Score and prize pool updated successfully',
                userId,
                score: this.changes,
                prize_pool: contributionBSV,
            });
        }
    );
});

// Endpoint to get the current prize pot total
app.get('/prize-pot', (req, res) => {
    const getPrizePotQuery = `SELECT SUM(prize_pool) as total FROM scores`;

    db.get(getPrizePotQuery, [], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ totalPot: row.total || 0 });
    });
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
