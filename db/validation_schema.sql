CREATE TABLE IF NOT EXISTS demographic_data (
    prolific_id TEXT PRIMARY KEY,
    age TEXT,
    gender TEXT,
    education TEXT,
    nationality TEXT,
    meme_familiarity TEXT,
    meme_usage TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS meme_validations (
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
); 