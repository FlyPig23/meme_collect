let currentMeme = null;

async function loadNextMeme() {
    try {
        const response = await fetch('/api/getMemes?stage=3');
        const data = await response.json();
        
        if (!data.meme) {
            showCompletionMessage();
            return;
        }
        
        currentMeme = data.meme;
        
        if (!currentMeme.Image_ID) {
            console.error('Image ID is undefined:', currentMeme);
            loadNextMeme();
            return;
        }
        
        // Load meme image
        document.getElementById('memeImage').src = `/images/${currentMeme.Image_ID}`;
        
        // Prepare MCQ choices
        const choices = [
            { 
                text: currentMeme.Translated_Explanation, 
                chinese: currentMeme.Chinese_Explanation, 
                type: 'correct' 
            },
            { 
                text: currentMeme.Translated_MCQ1, 
                chinese: currentMeme.Chinese_MCQ1, 
                type: 'mcq1' 
            },
            { 
                text: currentMeme.Translated_MCQ2, 
                chinese: currentMeme.Chinese_MCQ2, 
                type: 'mcq2' 
            }
        ];
        
        // Shuffle choices
        const shuffledChoices = shuffleArray(choices);
        
        // Update MCQ choices in the DOM
        shuffledChoices.forEach((choice, index) => {
            const choiceElement = document.getElementById(`choice${index + 1}`);
            const choiceChineseElement = document.getElementById(`choice${index + 1}_cn`);
            choiceElement.textContent = choice.text;
            choiceChineseElement.textContent = choice.chinese;
            choiceElement.parentElement.querySelector('input').dataset.choiceType = choice.type;
        });
        
        // Update progress counter with server data
        const progressCount = document.getElementById('progressCount');
        if (progressCount) {
            const current = (data.memesValidated || 0) + 1;  // Add 1 to show current meme number
            progressCount.textContent = `${current}/20`;
        }
        
        // Reset all form elements
        document.querySelectorAll('input[type="radio"]').forEach(radio => radio.checked = false);
        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => checkbox.checked = false);
        
        // Scroll to top
        window.scrollTo(0, 0);
        
    } catch (error) {
        console.error('Error loading meme:', error);
        setTimeout(loadNextMeme, 1000);
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

async function submitValidation() {
    const selectedChoice = document.querySelector('input[name="interpretation_choice"]:checked');
    const sentimentLabel = document.querySelector('input[name="sentiment"]:checked')?.value;
    const emotionLabels = Array.from(document.querySelectorAll('input[name="emotions"]:checked'))
        .map(cb => cb.value);
    
    if (!selectedChoice || !sentimentLabel || emotionLabels.length === 0) {
        alert('请选择一个解释、一个情感标签和至少一个情绪标签。\nPlease select an interpretation, a sentiment label, and at least one emotion label.');
        return;
    }

    const payload = {
        memeId: currentMeme.Image_ID,
        selectedInterpretation: selectedChoice.dataset.choiceType,
        sentimentLabel,
        emotionLabels
    };

    try {
        const response = await fetch('/api/submitCrossCulturalValidation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Network response was not ok');
        }
        
        const data = await response.json();
        
        if (data.completed) {
            showCompletionMessage();
        } else {
            loadNextMeme();
        }
    } catch (error) {
        console.error('Error submitting validation:', error);
        alert('Failed to submit. Please try again.');
    }
}

function showCompletionMessage() {
    const container = document.querySelector('.container');
    container.innerHTML = `
        <div class="completion-message">
            <h2>感谢您的参与！Thank You!</h2>
            <p>您已完成所有表情包验证。<br>You have completed all meme validations.</p>
            <p>您现在可以关闭此窗口。<br>You may now close this window.</p>
        </div>
    `;
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', loadNextMeme); 