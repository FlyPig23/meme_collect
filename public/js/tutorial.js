const tutorialSteps = [
    {
        highlight: '#firstBox',
        text: "Welcome! Let's learn how to upload memes. First, you can <span class='highlight'>either drag and drop a meme image here or click to select from your files</span>. You can also delete and re-upload if you're not satisfied."
    },
    {
        highlight: '#firstBox .text-entries-section',
        text: "After uploading a meme, provide both <span class='highlight'>Cultural Context</span> and <span class='highlight'>Potential Misunderstandings</span>. Remember the examples you just saw - explain the cultural background and how people from different cultures might misinterpret it."
    },
    {
        highlight: '#firstBox .labels-container',
        text: "Next, <span class='highlight'>choose one sentiment label</span> (positive, negative, or neutral) and <span class='highlight'>select one or more emotion labels</span> that best describe your meme. For emotion labels, you can select multiple options (sarcastic, humorous, motivation, offensive). <br><br><i>Note: Positive means the meme conveys positive sentiments, negative means it conveys negative sentiments, and neutral means it doesn't convey strong sentiments or you're unsure.</i>"
    },
    {
        highlight: '#addMore',
        text: "Want to contribute more memes? Click 'Upload More' to add additional upload boxes. You can upload as many memes as you'd like!"
    },
    {
        highlight: '#submitAll',
        text: "Once you've uploaded all your memes and provided all the required information, click 'Submit All' to contribute them to our research database."
    },
    {
        highlight: null,
        text: "Great! You're now ready to start uploading memes. Click 'Start Uploading' to begin!",
        finalStep: true
    }
];

let currentStep = 0;

function updateTutorial() {
    updateOverlaySize();
    const step = tutorialSteps[currentStep];
    const tutorialText = document.getElementById('tutorialText');
    const nextButton = document.getElementById('nextStep');
    const tutorialBox = document.getElementById('tutorialBox');
    
    // Remove previous highlight
    document.querySelectorAll('.tutorial-highlight').forEach(el => {
        el.classList.remove('tutorial-highlight');
    });

    // Add new highlight and position tutorial box
    if (step.highlight) {
        const highlightedElement = document.querySelector(step.highlight);
        highlightedElement.classList.add('tutorial-highlight');
        
        const rect = highlightedElement.getBoundingClientRect();
        const scrollY = window.scrollY;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Fixed width for tutorial box
        const boxWidth = 280;
        const tutorialBoxHeight = tutorialBox.offsetHeight;

        // Calculate available spaces
        const spaceRight = viewportWidth - rect.right - 20;
        const spaceLeft = rect.left - 20;

        // Default position (right side)
        let left = rect.right + 20;
        let top = rect.top + scrollY;

        // Special positioning for both buttons (Upload More and Submit All)
        if (step.highlight === '#submitAll' || step.highlight === '#addMore') {
            // Position both boxes slightly above and to the right of their buttons
            top = rect.top + scrollY - tutorialBoxHeight / 2;
            left = rect.right + 20;
            
            // If not enough space on right, position above
            if (spaceRight < boxWidth) {
                top = rect.top + scrollY - tutorialBoxHeight - 8;
                left = rect.left + (rect.width - boxWidth) / 2;
            }

            // Check if box would be partially hidden below viewport
            const bottomOverflow = (rect.top + tutorialBoxHeight) - viewportHeight;
            if (bottomOverflow > 0) {
                top -= bottomOverflow;
            }
        }

        // Apply final positions with absolute positioning
        tutorialBox.style.position = 'absolute';
        tutorialBox.style.left = `${left}px`;
        tutorialBox.style.top = `${top}px`;
        tutorialBox.style.transform = 'none';
    } else {
        // Center the box for the final step
        tutorialBox.style.position = 'fixed';
        tutorialBox.style.left = '50%';
        tutorialBox.style.top = '50%';
        tutorialBox.style.transform = 'translate(-50%, -50%)';
    }

    // Update text and button
    tutorialText.innerHTML = step.text;
    nextButton.textContent = step.finalStep ? 'Start Uploading' : 'Next Step';
}

document.getElementById('nextStep').addEventListener('click', () => {
    if (currentStep === tutorialSteps.length - 1) {
        // Redirect to the actual upload page
        window.location.href = '/upload';
        return;
    }
    
    currentStep++;
    updateTutorial();
});

// Add scroll event listener to update position when scrolling
window.addEventListener('scroll', () => {
    if (tutorialSteps[currentStep].highlight) {
        updateTutorial();
    }
});

// Add resize event listener to handle window resizing
window.addEventListener('resize', () => {
    updateOverlaySize();
    if (tutorialSteps[currentStep].highlight) {
        updateTutorial();
    }
});

// Add new function to update overlay size
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

// Initialize tutorial
updateTutorial(); 
updateTutorial(); 