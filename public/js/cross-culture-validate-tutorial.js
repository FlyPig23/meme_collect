const TUTORIAL_STEPS = [
    {
        highlight: '.meme-image',
        text: "In this stage, you'll see memes from <span class='highlight'>US culture</span>. Take a moment to look at each meme carefully. You will be asked a few questions about your understanding of the meme.",
        chinese: "在这个阶段，您将看到来自<span class='highlight'>美国文化</span>的网络表情包。请仔细观察每个表情包，之后您需要回答一些关于您对这个表情包的理解的问题。"
    },
    {
        highlight: '.multiple-choice',
        text: "You'll be presented with three possible interpretations of the meme. <span class='highlight'>One is the most appropriate intrepretation in US culture</span>. The other two are potential misinterpretations for people from other cultures.",
        chinese: "您将看到这个表情包的三种可能解释。<span class='highlight'>其中一个是在美国文化中最恰当的解释</span>。其他两个是来自其他文化背景的人可能产生的误解。"
    },
    {
        highlight: '.choice-options',
        text: "Select the interpretation that you think is the <span class='highlight'>most appropriate interpretation in US culture</span>.",
        chinese: "选择您认为是在美国文化中最恰当的解释。"
    },
    {
        highlight: '.validation-section:nth-of-type(2)',
        text: "Next, choose <span class='highlight'>one sentiment</span> that you think best describes the meme's overall tone: Positive, Neutral, or Negative.",
        chinese: "接下来，选择最能描述这个表情包的整体情感或语气：积极、中性还是消极？"
    },
    {
        highlight: '.validation-section:nth-of-type(3)',
        text: "Then, select <span class='highlight'>one or more emotions</span> that you thinkthe meme expresses. Multiple selections are allowed.",
        chinese: "然后，选择最能描述这个表情包的情绪标签。一个表情包可以同时表达多种情绪。"
    },
    {
        highlight: '.continue-button',
        text: "When you're done, click here to <span class='highlight'>submit and move to the next meme</span>.",
        chinese: "在完成所有选择后，点击\"提交并继续\"以进入下一个表情包。"
    },
    {
        highlight: null,
        text: "Great! You're now ready to start validating memes from different cultures. Click 'Start Validating' to begin!",
        chinese: "太好了！您现在已经准备好开始验证来自美国文化的表情包了。点击\"开始验证\"以开始！",
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
    tutorialText.innerHTML = `
        <div>${step.text}</div>
        <div class="chinese-text">${step.chinese}</div>
    `;
    nextButton.textContent = step.finalStep ? 'Start Validating' : 'Next';
    
    // Remove previous highlights
    document.querySelectorAll('.tutorial-highlight').forEach(el => {
        el.classList.remove('tutorial-highlight');
    });
    
    if (step.highlight) {
        const element = document.querySelector(step.highlight);
        if (element) {
            element.classList.add('tutorial-highlight');
            positionTutorialBox(element, tutorialBox);
        }
    } else {
        // Center the box for the final step
        tutorialBox.style.position = 'fixed';
        tutorialBox.style.left = '50%';
        tutorialBox.style.top = '50%';
        tutorialBox.style.transform = 'translate(-50%, -50%)';
    }
}

function positionTutorialBox(element, tutorialBox) {
    const rect = element.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const boxWidth = tutorialBox.offsetWidth;
    const boxHeight = tutorialBox.offsetHeight;

    let left = rect.right + 20;
    let top = rect.top + window.scrollY;

    // If not enough space on the right, try left side
    if (left + boxWidth > viewportWidth - 20) {
        left = rect.left - boxWidth - 20;
    }

    // If not enough space on left either, position above or below
    if (left < 20) {
        left = Math.max(20, rect.left);
        if (rect.top > boxHeight + 40) {
            top = rect.top - boxHeight - 20;
        } else {
            top = rect.bottom + 20;
        }
    }

    // Ensure the box stays within viewport bounds
    top = Math.max(20, Math.min(top, document.documentElement.scrollHeight - boxHeight - 20));

    tutorialBox.style.position = 'absolute';
    tutorialBox.style.left = `${left}px`;
    tutorialBox.style.top = `${top}px`;
    tutorialBox.style.transform = 'none';
}

document.getElementById('nextStep').addEventListener('click', async () => {
    if (currentStep === TUTORIAL_STEPS.length - 1) {
        try {
            const response = await fetch('/api/completeTutorial', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to complete tutorial');
            }
            
            window.location.href = '/cross-culture-validate';
        } catch (error) {
            console.error('Error completing tutorial:', error);
            alert('Error completing tutorial. Please try again.');
        }
        return;
    }
    currentStep++;
    updateTutorial();
});

// Add event listeners for scroll and resize
window.addEventListener('scroll', () => {
    if (TUTORIAL_STEPS[currentStep].highlight) {
        updateTutorial();
    }
});

window.addEventListener('resize', () => {
    updateOverlaySize();
    if (TUTORIAL_STEPS[currentStep].highlight) {
        updateTutorial();
    }
});

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
document.addEventListener('DOMContentLoaded', () => {
    updateOverlaySize();
    updateTutorial();
}); 