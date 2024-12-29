const tutorialSteps = [
    {
        highlight: '#firstBox',
        text: "Welcome! Let's learn how to upload memes. First, you can either drag and drop a meme image here or click to select from your files. You can also delete and re-upload if you're not satisfied."
    },
    {
        highlight: '#firstBox .text-entries-section',
        text: "After uploading a meme, provide both Cultural Context and Potential Misunderstandings. Remember the examples you just saw - explain the cultural background and how people from different cultures might misinterpret it."
    },
    {
        highlight: '#firstBox .labels-container',
        text: "Next, choose a sentiment label (positive, negative, or neutral) and select one or more emotion labels that best describe your meme (sarcastic, humorous, motivation, offensive)."
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
        
        // Position the tutorial box next to the highlighted element
        const rect = highlightedElement.getBoundingClientRect();
        const boxRect = tutorialBox.getBoundingClientRect();
        
        // Default position to the right of the element
        let left = rect.right + 20;
        let top = rect.top;
        
        // If there's not enough space on the right, position to the left
        if (left + boxRect.width > window.innerWidth) {
            left = rect.left - boxRect.width - 20;
        }
        
        // If the box would go below the viewport, adjust upward
        if (top + boxRect.height > window.innerHeight) {
            top = window.innerHeight - boxRect.height - 20;
        }
        
        tutorialBox.style.left = `${left}px`;
        tutorialBox.style.top = `${top}px`;
    } else {
        // Center the box for the final step
        tutorialBox.style.left = '50%';
        tutorialBox.style.top = '50%';
        tutorialBox.style.transform = 'translate(-50%, -50%)';
    }

    // Update text and button
    tutorialText.textContent = step.text;
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

// Initialize tutorial
updateTutorial(); 