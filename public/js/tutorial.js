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
        const boxRect = tutorialBox.getBoundingClientRect();
        
        // Calculate viewport-relative positions
        const viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        const viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
        
        // Position to the right by default
        let left = Math.min(rect.right + 20, viewportWidth - boxRect.width - 20);
        let top = rect.top;
        
        // Special adjustments for specific steps
        if (step.highlight === '#firstBox .labels-container') {
            top = rect.top - 100;  // Move up by 80px for labels step
        } else if (step.highlight === '#addMore' || step.highlight === '#submitAll') {
            left = rect.right + 20;  // Position to the right of the button
            top = rect.top - 200;  // Move up significantly more
        }
        
        // If not enough space on right, position to left
        if (rect.right + boxRect.width + 40 > viewportWidth) {
            left = Math.max(20, rect.left - boxRect.width - 20);
        }
        
        tutorialBox.style.left = `${left}px`;
        tutorialBox.style.top = `${top}px`;
        tutorialBox.style.transform = 'none';
    } else {
        // Center the box for the final step
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

// Initialize tutorial
updateTutorial(); 