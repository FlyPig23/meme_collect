const EXPERIMENT_CONFIG = {
  STAGE: 3, // Updated to stage 3
  SUPPORTED_LANGUAGES: ['en', 'zh'],
  DEFAULT_LANGUAGE: 'en',
  MEMES_PER_USER: 20, // Number of memes each user needs to validate
  API_ENDPOINTS: {
    STAGE1: {
      TRANSLATE: '/api/translate',
      GET_MEMES: '/api/getMemes?stage=1',
      SUBMIT_VALIDATION: '/api/submitValidation?stage=1'
    },
    STAGE2: {
      TRANSLATE: '/api/translate',
      GET_MEMES: '/api/getMemes?stage=2',
      SUBMIT_VALIDATION: '/api/submitValidation?stage=2'
    },
    STAGE3: {
      TRANSLATE: '/api/translate',
      GET_MEMES: '/api/getMemes?stage=3',
      SUBMIT_VALIDATION: '/api/submitValidation?stage=3'
    }
  }
};

// Export for Node.js environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { EXPERIMENT_CONFIG };
} 