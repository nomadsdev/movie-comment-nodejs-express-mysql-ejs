const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'movie_db'
});

db.connect((err) => {
    if (err) {
        console.error('Error connection to database');
    } else{
        console.log('Connected to database');
    }
});

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    const sqlClips = `SELECT * FROM video_clips`;
    const sqlCommects = `SELECT * FROM video_comments WHERE video_id = ?`;
    db.query(sqlClips, (error, results) => {
        if (error) throw error;
        const videoClipsWithComments = results.map(videoClip => {
            return new Promise((resolve, reject) => {
                db.query(sqlCommects, [videoClip.id], (error, comments) => {
                    if (error) reject(error);
                    videoClip.comments = comments;
                    resolve(videoClip);
                });
            });
        });
        Promise.all(videoClipsWithComments)
            .then(videoClips => {
                res.render('index', { videoClips });
            })
            .catch(error => {
                throw error;
            });
    });
});

app.post('/add', (req, res) => {
    const { video_url, description } = req.body;
    const sql = `INSERT INTO video_clips (video_url, description) VALUES (?, ?)`;
    db.query(sql, [video_url, description], (error, results) => {
        if (error) throw error;
        res.redirect('/');
    });
});

app.post('/delete/:id', (req, res) => {
    const id = req.params.id;
    const sql = `DELETE FROM video_clips WHERE id = ?`;
    db.query(sql, id, (error, results) => {
        if (error) throw error;
        res.redirect('/');
    });
});

app.post('/comment/:id', (req, res) => {
    const videoId = req.params.id;
    const { username, comment } = req.body;
    const sql = `INSERT INTO video_comments (username, comment, video_id) VALUES (?, ?, ?)`;
    db.query(sql, [username, comment, videoId], (error, results) => {
        if (error) throw error;
        res.redirect('/');
    });
});

app.listen(PORT, () => {
    console.log(`Server is running ${PORT}`);
});