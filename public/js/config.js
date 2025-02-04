const EXPERIMENT_CONFIG = {
  STAGE: 2, // Change between 1 and 2 to switch experiment stages
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
    }
  }
};

// Export for Node.js environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { EXPERIMENT_CONFIG };
} 