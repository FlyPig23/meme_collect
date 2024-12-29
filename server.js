const express = require('express');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const session = require('express-session');

const app = express();
const PORT = 3000;

// Add session middleware
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // set to true if using https
}));

// Add user ID middleware
app.use((req, res, next) => {
    if (!req.session.userId) {
        req.session.userId = Date.now();  // Using timestamp as user ID for simplicity
    }
    next();
});

// Serve static files
app.use(express.static('public'));

// Parse form data
app.use(express.urlencoded({ extended: true }));

// Set up view engine
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', path.join(__dirname, 'views'));

// Multer storage configuration
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        // Create a unique filename while preserving original extension
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        const ext = path.extname(file.originalname);
        cb(null, `${uniqueSuffix}${ext}`);
    }
});

// Update multer configuration to handle larger files
const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
        files: 20 // Allow up to 20 files
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

// SQLite database setup
const db = new sqlite3.Database('./database.db', async (err) => {
    if (err) {
        console.error(err);
        return;
    }
    
    // Create table if it doesn't exist
    await new Promise((resolve, reject) => {
        db.run(`CREATE TABLE IF NOT EXISTS memes (
            id INTEGER PRIMARY KEY, 
            user_id TEXT,
            imagePath TEXT, 
            cultural_context TEXT,
            potential_misunderstandings TEXT,
            sentiment_label TEXT,
            emotion_labels TEXT,
            age TEXT,
            gender TEXT, 
            education TEXT,
            nationality TEXT,
            meme_familiarity TEXT,
            meme_usage TEXT
        )`, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });

    // Check if columns exist and add them if they don't
    const columns = ['nationality', 'meme_familiarity', 'meme_usage'];
    for (const column of columns) {
        await new Promise((resolve, reject) => {
            db.all(`PRAGMA table_info(memes)`, (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                
                const columnExists = rows.some(row => row.name === column);
                if (!columnExists) {
                    db.run(`ALTER TABLE memes ADD COLUMN ${column} TEXT`, (err) => {
                        if (err) reject(err);
                        else resolve();
                    });
                } else {
                    resolve();
                }
            });
        });
    }
});

// Routes
app.get('/', (req, res) => res.render('consent.html'));
app.get('/instructions', (req, res) => res.render('instructions.html'));
app.get('/tutorial', (req, res) => res.render('tutorial.html'));
app.get('/demographics', (req, res) => res.render('demographics.html'));
app.post('/demographics', (req, res) => {
    req.session.demographicData = req.body;
    res.redirect('/tutorial');
});
app.get('/upload', (req, res) => res.render('upload.html'));
app.post('/upload', upload.array('meme'), async (req, res) => {
    if (!req.session.userId) {
        return res.status(400).send('Session expired. Please start over.');
    }

    const demographicData = req.session?.demographicData || {
        age: 'unknown',
        gender: 'unknown',
        education: 'unknown',
        nationality: 'unknown',
        meme_familiarity: 'unknown',
        meme_usage: 'unknown'
    };
    
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).send('No files were uploaded.');
        }

        const dbRun = (sql, params) => {
            return new Promise((resolve, reject) => {
                db.run(sql, params, function(err) {
                    if (err) reject(err);
                    else resolve(this);
                });
            });
        };

        for (let i = 0; i < req.files.length; i++) {
            const file = req.files[i];
            const fileIndex = i + 1;
            
            const culturalContext = req.body[`culturalContext${fileIndex}`] || '';
            const potentialMisunderstandings = req.body[`potentialMisunderstandings${fileIndex}`] || '';
            const sentimentLabel = req.body[`sentimentLabel${fileIndex}`] || '';
            const emotionLabels = req.body[`emotionLabels${fileIndex}`] || '[]';
            
            try {
                await dbRun(
                    `INSERT INTO memes (
                        user_id, imagePath, cultural_context, potential_misunderstandings,
                        sentiment_label, emotion_labels, age, gender, education, 
                        nationality, meme_familiarity, meme_usage
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        req.session.userId,
                        file.path,
                        culturalContext,
                        potentialMisunderstandings,
                        sentimentLabel,
                        emotionLabels,
                        demographicData.age,
                        demographicData.gender,
                        demographicData.education,
                        demographicData.nationality,
                        demographicData.meme_familiarity,
                        demographicData.meme_usage
                    ]
                );
            } catch (err) {
                console.error(`Error saving file ${fileIndex}:`, err);
                throw err;
            }
        }

        res.send('Thank you for your contributions!');
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).send('An error occurred while processing your upload.');
    }
});

// Start server
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
