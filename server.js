const express = require('express');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const csv = require('csv-parser');
const validationTracker = require('./validationTracker');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const { EXPERIMENT_CONFIG } = require('./public/js/config.js');
const validationDb = new sqlite3.Database('db/validation.db');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Update session middleware with SQLite store
app.use(session({
    store: new SQLiteStore({
        db: 'sessions.db',
        dir: './'
    }),
    secret: process.env.SESSION_SECRET || 'dreamlabmeme',
    resave: false,
    saveUninitialized: true,
    cookie: { 
        secure: false,
        maxAge: 24 * 60 * 60 * 1000 
    }
}));

// Add user ID middleware
// app.use((req, res, next) => {
//     if (!req.session.userId) {
//         req.session.userId = Date.now();  // Using timestamp as user ID for simplicity
//     }
//     next();
// });

// Add at the top with other session middleware
app.use((req, res, next) => {
    if (!req.session.memesValidated) {
        req.session.memesValidated = 0;
    }
    next();
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Serve translation files
app.use('/translations', express.static(path.join(__dirname, 'public', 'translations')));

// Set up view engine
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', path.join(__dirname, 'views'));

// Multer storage configuration
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        // Get the current file index from multer's internal counter
        const fileCount = req.files ? req.files.length : 0;
        const prolificId = req.session.demographicData.prolific_id;
        // Create filename in format: ProlificID_number.extension
        const ext = path.extname(file.originalname);
        cb(null, `${prolificId}_${fileCount}${ext}`);
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
const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath, async (err) => {
    if (err) {
        console.error(err);
        return;
    }
    
    // Create table if it doesn't exist
    await new Promise((resolve, reject) => {
        db.run(`CREATE TABLE IF NOT EXISTS memes (
            id INTEGER PRIMARY KEY, 
            prolific_id TEXT,
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

// Add new function to get meme data from CSV
async function getMemeDataFromCSV(nationality) {
    const csvFile = 'translated_data.csv';
    
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(csvFile)
            .pipe(csv())
            .on('data', (data) => {
                results.push({
                    imageId: data['Image_ID'],
                    culturalContext: data['Rewritten_Explanation'],
                    potentialMisunderstandings: data['Rewritten_Misunderstanding'],
                    timesLabeled: 0  // Initialize count for each meme
                });
            })
            .on('end', () => resolve(results))
            .on('error', reject);
    });
}

// Add new function to find image file with any extension
function findImageFile(uploadsDir, baseFileName) {
    const extensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
    for (const ext of extensions) {
        const fullPath = path.join(uploadsDir, baseFileName + ext);
        if (fs.existsSync(fullPath)) {
            return fullPath;
        }
    }
    return null;
}

// Wrap server initialization in an async function
async function initializeServer() {
    try {
        await validationTracker.loadCounts();
        
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to initialize server:', error);
        process.exit(1);
    }
}

// Call the initialization function
initializeServer();

// Routes
app.get('/', (req, res) => res.render('consent.html'));
app.get('/demographics', (req, res) => res.render('demographics.html'));
app.get('/tutorial', (req, res) => res.render('tutorial.html'));
app.get('/validate', (req, res) => res.render('validate.html'));

// Single demographics route
app.post('/demographics', async (req, res) => {
    try {
        // Reset validation counter for new user
        req.session.memesValidated = 0;
        
        // Store Prolific ID in session
        req.session.prolificId = req.body.prolific_id;
        
        // Store demographics in validation database
        await new Promise((resolve, reject) => {
            validationDb.run(`
                INSERT INTO demographic_data (
                    prolific_id, age, gender, education, 
                    nationality, meme_familiarity, meme_usage
                ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    req.body.prolific_id,
                    req.body.age,
                    req.body.gender,
                    req.body.education,
                    req.body.nationality,
                    req.body.meme_familiarity,
                    req.body.meme_usage
                ],
                function(err) {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });

        // Store in session for other uses
        req.session.demographicData = req.body;
        
        if (EXPERIMENT_CONFIG.STAGE === 1) {
            res.redirect('/instructions');
        } else {
            res.redirect('/validate-tutorial');
        }
    } catch (error) {
        console.error('Error storing demographics:', error);
        res.status(500).send('Error storing demographic data');
    }
});

// Add instructions route for Stage 1
app.get('/instructions', (req, res) => {
    if (EXPERIMENT_CONFIG.STAGE === 1) {
        res.render('instructions.html');
    } else {
        res.redirect('/validate-tutorial');
    }
});

// Add route for handling instructions submission (Stage 1)
app.post('/instructions', (req, res) => {
    if (EXPERIMENT_CONFIG.STAGE === 1) {
        res.redirect('/tutorial');
    } else {
        res.redirect('/validate-tutorial');
    }
});

app.get('/upload', (req, res) => res.render('upload.html'));
app.post('/upload', upload.array('meme'), async (req, res) => {
    if (!req.session?.demographicData?.prolific_id) {
        return res.status(400).send('Session expired or missing Prolific ID. Please start over.');
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
                        prolific_id, imagePath, cultural_context, potential_misunderstandings,
                        sentiment_label, emotion_labels, age, gender, education, 
                        nationality, meme_familiarity, meme_usage
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        demographicData.prolific_id,
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

// Add Count column to CSV if it doesn't exist
async function initializeCountColumn() {
    const results = [];
    fs.createReadStream('translated_data.csv')
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
            if (!results[0].hasOwnProperty('Count')) {
                const csvWriter = createCsvWriter({
                    path: 'translated_data.csv',
                    header: [...Object.keys(results[0]), 'Count'].map(id => ({id, title: id})),
                    append: false
                });
                
                const newData = results.map(row => ({...row, Count: '0'}));
                csvWriter.writeRecords(newData);
            }
        });
}

// Store meme data in memory
let memeData = [];

// Load meme data when server starts
function loadMemeData() {
    memeData = [];
    fs.createReadStream('translated_data.csv')
        .pipe(csv())
        .on('data', (row) => {
            const meme = {
                ...row,
                Image_ID: row['Image ID'] || row.Image_ID, // Handle both column name formats
                Count: row.Count || '0'
            };
            memeData.push(meme);
        })
        .on('end', () => {
            console.log('Meme data loaded successfully');
            console.log(`Total memes in CSV: ${memeData.length}`);
        });
}

// Function to check if image exists
function imageExists(imagePath) {
    try {
        return fs.existsSync(imagePath);
    } catch (err) {
        console.error('Error checking image existence:', err);
        return false;
    }
}

// Function to get a random meme with retry logic
function getRandomMeme(maxRetries = 5) {
    let attempts = 0;
    
    while (attempts < maxRetries) {
        // Filter memes with count < 3
        const availableMemes = memeData.filter(meme => parseInt(meme.Count || 0) < 3);
        
        if (availableMemes.length === 0) {
            console.log('No more available memes');
            return null;
        }
        
        // Randomly select a meme
        const selectedMeme = availableMemes[Math.floor(Math.random() * availableMemes.length)];
        const imagePath = path.join(__dirname, 'us_meme_uploads', selectedMeme.Image_ID);
        
        // Check if image exists
        if (imageExists(imagePath)) {
            console.log(`Found valid meme after ${attempts + 1} attempts`);
            return selectedMeme;
        }
        
        console.log(`Image not found for meme ${selectedMeme.Image_ID}, trying another...`);
        attempts++;
    }
    
    console.log(`Failed to find valid meme after ${maxRetries} attempts`);
    return null;
}

// Modify the next-meme endpoint
app.get('/api/next-meme', (req, res) => {
    if (req.session.memesValidated >= EXPERIMENT_CONFIG.MEMES_PER_USER) {
        res.json({ meme: null, message: 'Validation complete' });
        return;
    }

    const selectedMeme = getRandomMeme();
    
    if (!selectedMeme) {
        res.json({ meme: null, message: 'No available memes found' });
        return;
    }
    
    // Verify image exists
    const imagePath = path.join(__dirname, 'us_meme_uploads', selectedMeme.Image_ID);
    if (!imageExists(imagePath)) {
        console.error('Image verification failed:', selectedMeme.Image_ID);
        res.status(404).json({ error: 'Image not found' });
        return;
    }
    
    res.json({ 
        meme: selectedMeme,
        memesValidated: req.session.memesValidated || 0,
        totalRequired: EXPERIMENT_CONFIG.MEMES_PER_USER
    });
});

// Initialize validation database tables for Stage 2
validationDb.serialize(() => {
    validationDb.run(`DROP TABLE IF EXISTS demographic_data`);
    validationDb.run(`DROP TABLE IF EXISTS meme_validations`);
    
    validationDb.run(`CREATE TABLE IF NOT EXISTS demographic_data (
        prolific_id TEXT PRIMARY KEY,
        age TEXT,
        gender TEXT,
        education TEXT,
        nationality TEXT,
        meme_familiarity TEXT,
        meme_usage TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    validationDb.run(`CREATE TABLE IF NOT EXISTS meme_validations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        prolific_id TEXT,
        meme_id TEXT,
        explanation_rating INTEGER,
        misunderstanding_rating INTEGER,
        sentiment_label TEXT,
        emotion_labels TEXT,
        feedback TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (prolific_id) REFERENCES demographic_data(prolific_id)
    )`);
});

// Update the endpoint to match the client's fetch URL
app.post('/api/submitValidation', async (req, res) => {
    const prolificId = req.session.prolificId;
    if (!prolificId) {
        console.error('No prolific ID in session');
        return res.status(400).json({ error: 'No prolific ID found' });
    }

    const { 
        memeId, 
        explanationRating, 
        misunderstandingRating,
        sentimentLabel,
        emotionLabels,
        feedback 
    } = req.body;

    console.log('Received validation data:', {
        prolificId,
        memeId,
        explanationRating,
        misunderstandingRating,
        sentimentLabel,
        emotionLabels,
        feedback
    });
    
    try {
        // Insert validation into the database
        await new Promise((resolve, reject) => {
            validationDb.run(`
                INSERT INTO meme_validations (
                    prolific_id, meme_id,
                    explanation_rating, misunderstanding_rating,
                    sentiment_label, emotion_labels, feedback
                ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    prolificId,
                    memeId,
                    explanationRating,
                    misunderstandingRating,
                    sentimentLabel,
                    JSON.stringify(emotionLabels),
                    feedback || ''
                ],
                function(err) {
                    if (err) {
                        console.error('Database error:', err);
                        reject(err);
                    } else {
                        console.log('Successfully inserted validation with ID:', this.lastID);
                        resolve();
                    }
                }
            );
        });

        // Update the in-memory memeData by incrementing the Count for the validated meme.
        memeData = memeData.map(row => {
            // Assumes that the CSV row has an "Image_ID" property (set in loadMemeData)
            if (row.Image_ID === memeId) {
                // Make sure to parse the current count (or default to 0) and convert back to string if needed
                const newCount = (parseInt(row.Count, 10) || 0) + 1;
                return { ...row, Count: newCount.toString() };
            }
            return row;
        });

        // Use csv-writer to write the updated memeData back to the CSV file.
        const csvWriter = createCsvWriter({
            path: 'translated_data.csv',
            header: Object.keys(memeData[0]).map(key => ({ id: key, title: key }))
        });

        await csvWriter.writeRecords(memeData);

        // Increment the session counter for validations completed by user
        req.session.memesValidated = (req.session.memesValidated || 0) + 1;
        
        res.json({ 
            success: true, 
            memesValidated: req.session.memesValidated,
            totalRequired: EXPERIMENT_CONFIG.MEMES_PER_USER
        });
    } catch (error) {
        console.error('Error submitting validation:', error);
        res.status(500).json({ error: 'Failed to submit validation' });
    }
});

// Load initial data
loadMemeData();

// Add this logging middleware for static files
app.use('/us_meme_uploads', (req, res, next) => {
    console.log('Attempting to load image:', req.url);
    console.log('Full path:', path.join(__dirname, 'us_meme_uploads', req.url));
    next();
}, express.static('us_meme_uploads'));

// Add this to check if the directory exists when server starts
const uploadsDir = path.join(__dirname, 'us_meme_uploads');
if (!fs.existsSync(uploadsDir)) {
    console.error('WARNING: us_meme_uploads directory does not exist at:', uploadsDir);
} else {
    console.log('us_meme_uploads directory found at:', uploadsDir);
    // List files in directory
    const files = fs.readdirSync(uploadsDir);
    console.log('Files in uploads directory:', files.length);
}

// Add this route
app.get('/validate-tutorial', (req, res) => {
    res.render('validate-tutorial');
});
