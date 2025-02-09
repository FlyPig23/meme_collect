CREATE TABLE IF NOT EXISTS demographic_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT UNIQUE,
    prolific_id TEXT UNIQUE,
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
    cultural_significance INTEGER,
    sentiment_label TEXT,
    emotion_labels TEXT,
    feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (prolific_id) REFERENCES demographic_data(prolific_id)
);

CREATE TABLE IF NOT EXISTS cross_cultural_validations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    meme_id TEXT,
    selected_interpretation TEXT,
    correct_interpretation TEXT,
    sentiment_label TEXT,
    emotion_labels TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES demographic_data(user_id)
); 