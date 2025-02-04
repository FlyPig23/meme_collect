const TUTORIAL_STEPS = [
    {
        highlight: '.meme-image',
        text: "Each meme will be displayed here. Since these memes are from <span class='highlight'>US culture</span>, take a moment to understand what the meme means from a <span class='highlight'>US cultural perspective</span>."
    },
    {
        highlight: '#culturalContext',
        text: "Here you'll find the <span class='highlight'>cultural context explanation</span>. This explains the cultural background and meaning of the meme."
    },
    {
        highlight: '.validation-section:first-of-type .likert-scale',
        text: "Rate how well you think this explanation <span class='highlight'>captures the cultural context</span>. Is it accurate and complete?"
    },
    {
        highlight: '#potentialMisunderstandings',
        text: "This section describes how people from <span class='highlight'>different cultures might misunderstand</span> this meme."
    },
    {
        highlight: '.validation-section:nth-of-type(2) .likert-scale',
        text: "Rate how well this describes <span class='highlight'>potential misunderstandings</span>. Is it accurate and helpful?"
    },
    {
        highlight: '.validation-section:nth-of-type(3)',
        text: "Choose <span class='highlight'>one sentiment</span> that best describes the meme's overall tone: <span class='highlight'>Positive</span>, <span class='highlight'>Neutral</span>, or <span class='highlight'>Negative</span>."
    },
    {
        highlight: '.validation-section:nth-of-type(4)',
        text: "Select <span class='highlight'>one or more emotions</span> that the meme expresses. Multiple selections are allowed."
    },
    {
        highlight: '.feedback-section',
        text: "Optionally, provide any <span class='highlight'>additional thoughts or feedback</span> about the meme's interpretation."
    },
    {
        highlight: '.continue-button',
        text: "When you're done, click here to <span class='highlight'>submit and move to the next meme</span>."
    },
    {
        highlight: null,
        text: "Great! You're now ready to start validating memes. Click 'Start Validating' to begin!",
        finalStep: true
    }
];

let currentStep = 0;

function updateTutorial() {
    const step = TUTORIAL_STEPS[currentStep];
    const tutorialText = document.getElementById('tutorialText');
    const nextButton = document.getElementById('nextStep');
    const tutorialBox = document.getElementById('tutorialBox');
    
    // Update text and button
    tutorialText.innerHTML = step.text;
    nextButton.textContent = step.finalStep ? 'Start Validating' : 'Next';
    
    // Handle highlighting
    document.querySelectorAll('.tutorial-highlight').forEach(el => {
        el.classList.remove('tutorial-highlight');
    });
    
    if (step.highlight) {
        const element = document.querySelector(step.highlight);
        if (element) {
            element.classList.add('tutorial-highlight');
            
            const rect = element.getBoundingClientRect();
            const scrollY = window.scrollY;
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            
            const boxWidth = 280;
            const tutorialBoxHeight = tutorialBox.offsetHeight;
            
            const spaceRight = viewportWidth - rect.right - 20;
            
            // Special positioning for continue button
            if (step.highlight === '.continue-button') {
                let left = rect.right + 20;
                let top = rect.top + scrollY - tutorialBoxHeight - 20; // Position above the button
                
                if (spaceRight < boxWidth) {
                    left = rect.left - boxWidth - 20;
                    top = rect.top + scrollY - tutorialBoxHeight - 20;
                }
                
                tutorialBox.style.position = 'absolute';
                tutorialBox.style.left = `${left}px`;
                tutorialBox.style.top = `${top}px`;
                tutorialBox.style.transform = 'none';
            } else {
                // Default positioning for other elements (existing code)
                let left = rect.right + 20;
                let top = rect.top + scrollY;
                
                if (spaceRight < boxWidth) {
                    left = rect.left - boxWidth - 20;
                }
                
                tutorialBox.style.position = 'absolute';
                tutorialBox.style.left = `${left}px`;
                tutorialBox.style.top = `${top}px`;
                tutorialBox.style.transform = 'none';
            }
            
            // Ensure the highlighted element is in view
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    } else {
        // Center the box for the final step
        tutorialBox.style.position = 'fixed';
        tutorialBox.style.left = '50%';
        tutorialBox.style.top = '50%';
        tutorialBox.style.transform = 'translate(-50%, -50%)';
    }
}

function updateOverlaySize() {
    const overlay = document.getElementById('tutorialOverlay');
    const docHeight = Math.max(
        document.body.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.clientHeight,
        document.documentElement.scrollHeight,
        document.documentElement.offsetHeight
    );
    overlay.style.height = `${docHeight}px`;
}

document.getElementById('nextStep').addEventListener('click', () => {
    if (currentStep === TUTORIAL_STEPS.length - 1) {
        window.location.href = '/validate';
        return;
    }
    currentStep++;
    updateTutorial();
});

// Add scroll event listener to update position when scrolling
window.addEventListener('scroll', () => {
    if (TUTORIAL_STEPS[currentStep].highlight) {
        updateTutorial();
    }
});

// Add resize event listener to handle window resizing
window.addEventListener('resize', () => {
    updateOverlaySize();
    if (TUTORIAL_STEPS[currentStep].highlight) {
        updateTutorial();
    }
});

// Initialize tutorial and overlay
document.addEventListener('DOMContentLoaded', () => {
    updateOverlaySize();
    updateTutorial();
}); 