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
        highlight: '.validation-section:nth-of-type(3) .likert-scale',
        text: "Rate whether this meme has <span class='highlight'>US cultural significance</span>, i.e. is it a meme that is popular in the US or related to US culture?"
    },
    {
        highlight: '.sentiment-section .likert-scale',
        text: "Choose <span class='highlight'>one sentiment</span> that best describes the meme's overall tone: <span class='highlight'>Positive</span>, <span class='highlight'>Neutral</span>, or <span class='highlight'>Negative</span>."
    },
    {
        highlight: '.emotion-section',
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
    
    // Remove previous highlights
    document.querySelectorAll('.tutorial-highlight').forEach(el => {
        el.classList.remove('tutorial-highlight');
    });
    
    if (step.highlight) {
        const element = document.querySelector(step.highlight);
        if (element) {
            element.classList.add('tutorial-highlight');
            
            // Get positions and dimensions (using viewport-relative positioning)
            const rect = element.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            let boxWidth = tutorialBox.offsetWidth;
            let boxHeight = tutorialBox.offsetHeight;

            // Reset box size to default first
            tutorialBox.style.width = '280px';
            tutorialBox.style.maxHeight = '80vh';

            // Recalculate box dimensions after reset
            boxWidth = tutorialBox.offsetWidth;
            boxHeight = tutorialBox.offsetHeight;

            // Calculate available space in each direction
            const spaceRight = viewportWidth - rect.right - 20;
            const spaceLeft = rect.left - 20;
            const spaceTop = rect.top - 20;
            const spaceBottom = viewportHeight - rect.bottom - 20;

            // Check if viewport is too narrow
            const isViewportNarrow = viewportWidth < 600;
            
            let position = {};

            if (isViewportNarrow) {
                // For narrow viewports, center horizontally and position near the element
                const narrowWidth = Math.min(viewportWidth * 0.9, 280);
                tutorialBox.style.width = `${narrowWidth}px`;
                boxWidth = narrowWidth;

                position = {
                    left: '50%',
                    transform: 'translateX(-50%)'
                };

                if (spaceBottom > boxHeight) {
                    position.top = rect.bottom + 10;
                } else if (spaceTop > boxHeight) {
                    position.top = rect.top - boxHeight - 10;
                } else {
                    position.top = '50%';
                    position.transform = 'translate(-50%, -50%)';
                }
            } else {
                // For wider viewports, try to keep the box close to the element
                if (spaceRight > boxWidth) {
                    // Position to the right, vertically aligned with element center
                    position = {
                        left: rect.right + 20,
                        top: rect.top + (rect.height - boxHeight) / 2,
                        transform: 'none'
                    };

                    // Ensure box stays within vertical viewport bounds
                    if (position.top < 10) {
                        position.top = 10;
                    } else if (position.top + boxHeight > viewportHeight - 10) {
                        position.top = viewportHeight - boxHeight - 10;
                    }
                } else if (spaceLeft > boxWidth) {
                    // Position to the left, vertically aligned with element center
                    position = {
                        left: rect.left - boxWidth - 20,
                        top: rect.top + (rect.height - boxHeight) / 2,
                        transform: 'none'
                    };

                    // Ensure box stays within vertical viewport bounds
                    if (position.top < 10) {
                        position.top = 10;
                    } else if (position.top + boxHeight > viewportHeight - 10) {
                        position.top = viewportHeight - boxHeight - 10;
                    }
                } else {
                    // If horizontal space is limited, position above or below
                    position = {
                        left: rect.left + (rect.width - boxWidth) / 2,
                        transform: 'none'
                    };

                    // Ensure horizontal position is within bounds
                    if (position.left < 20) {
                        position.left = 20;
                    } else if (position.left + boxWidth > viewportWidth - 20) {
                        position.left = viewportWidth - boxWidth - 20;
                    }

                    if (spaceBottom > boxHeight) {
                        position.top = rect.bottom + 10;
                    } else if (spaceTop > boxHeight) {
                        position.top = rect.top - boxHeight - 10;
                    } else {
                        // If no space above or below, center in viewport
                        position = {
                            left: '50%',
                            top: '50%',
                            transform: 'translate(-50%, -50%)'
                        };
                        tutorialBox.style.width = `${Math.min(viewportWidth * 0.9, 280)}px`;
                    }
                }
            }

            // Apply the calculated position
            tutorialBox.style.position = 'fixed';
            tutorialBox.style.left = typeof position.left === 'number' ? `${position.left}px` : position.left;
            tutorialBox.style.top = typeof position.top === 'number' ? `${position.top}px` : position.top;
            tutorialBox.style.transform = position.transform;

            // Ensure the highlighted element is in view
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    } else {
        // Center the box for the final step
        tutorialBox.style.position = 'fixed';
        tutorialBox.style.left = '50%';
        tutorialBox.style.top = '50%';
        tutorialBox.style.transform = 'translate(-50%, -50%)';
        tutorialBox.style.width = '280px';
        tutorialBox.style.maxHeight = '80vh';
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