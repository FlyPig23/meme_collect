const fs = require('fs');
const csv = require('csv-parser');

class ValidationTracker {
    constructor() {
        this.validationCounts = new Map();
        this.MAX_VALIDATIONS = 3;
    }

    async loadCounts() {
        try {
            const data = await fs.promises.readFile('validation_counts.json', 'utf8');
            this.validationCounts = new Map(JSON.parse(data));
        } catch (error) {
            // If file doesn't exist, start with empty counts
            this.validationCounts = new Map();
        }
    }

    async saveCounts() {
        const data = JSON.stringify(Array.from(this.validationCounts.entries()));
        await fs.promises.writeFile('validation_counts.json', data);
    }

    incrementCount(imageId) {
        const currentCount = this.validationCounts.get(imageId) || 0;
        this.validationCounts.set(imageId, currentCount + 1);
        return this.saveCounts();
    }

    getCount(imageId) {
        return this.validationCounts.get(imageId) || 0;
    }

    canValidate(imageId) {
        const count = this.getCount(imageId);
        return count < this.MAX_VALIDATIONS;
    }
}

module.exports = new ValidationTracker(); 