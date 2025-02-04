let currentMeme = null;

async function loadNextMeme() {
    try {
        const response = await fetch('/api/next-meme');
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
        
        // Load meme image and text content
        document.getElementById('memeImage').src = `/us_meme_uploads/${currentMeme.Image_ID}`;
        document.getElementById('culturalContext').textContent = currentMeme.Rewritten_Explanation;
        document.getElementById('potentialMisunderstandings').textContent = currentMeme.Rewritten_Misunderstanding;
        
        // Update progress counter with server data
        const progressCount = document.getElementById('progressCount');
        if (progressCount) {
            const current = (data.memesValidated || 0) + 1;  // Add 1 to show current meme number
            progressCount.textContent = `${current}/20`;
        }
        
        // Reset all form elements
        document.querySelectorAll('input[type="radio"]').forEach(radio => radio.checked = false);
        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => checkbox.checked = false);
        document.getElementById('feedback').value = '';
        
        // Scroll to top of the page
        window.scrollTo(0, 0);
        
    } catch (error) {
        console.error('Error loading meme:', error);
        setTimeout(loadNextMeme, 1000);
    }
}

function updateProgressCounter(response) {
    const progressCount = document.getElementById('progressCount');
    if (progressCount) {
        const current = response.memesValidated || 0;
        progressCount.textContent = `${current}/20`;
    }
}

async function submitValidation() {
    if (!currentMeme || !currentMeme.Image_ID) {
        console.error('No current meme data:', currentMeme);
        alert('Error: No meme data found. Please refresh the page.');
        return;
    }

    const explanationRating = document.querySelector('input[name="explanation_rating"]:checked')?.value;
    const misunderstandingRating = document.querySelector('input[name="misunderstanding_rating"]:checked')?.value;
    const culturalSignificance = document.querySelector('input[name="cultural_significance"]:checked')?.value;
    const sentimentLabel = document.querySelector('input[name="sentiment_label"]:checked')?.value;
    const emotionLabels = Array.from(document.querySelectorAll('input[name="emotion_labels"]:checked'))
        .map(cb => cb.value);
    
    if (!explanationRating || !misunderstandingRating || !culturalSignificance || !sentimentLabel || emotionLabels.length === 0) {
        alert('Please rate both explanations, indicate whether the meme has US cultural significance, select a sentiment label, and at least one emotion label.');
        return;
    }

    const payload = {
        memeId: currentMeme.Image_ID,
        explanationRating: parseInt(explanationRating),
        misunderstandingRating: parseInt(misunderstandingRating),
        culturalSignificance: parseInt(culturalSignificance),
        sentimentLabel,
        emotionLabels,
        feedback: document.getElementById('feedback').value || ''
    };

    console.log('Current meme:', currentMeme);
    console.log('Submitting validation payload:', payload);
    
    try {
        const response = await fetch('/api/submitValidation', {
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
        console.log('Server response:', data);
        
        updateProgressCounter(data);
        loadNextMeme();
    } catch (error) {
        console.error('Error submitting validation:', error);
        alert('Failed to submit. Please try again. Error: ' + error.message);
    }
}

function showCompletionMessage() {
    const container = document.querySelector('.container');
    container.innerHTML = `
        <div class="completion-message">
            <h2>Thank You!</h2>
            <p>You have completed all meme validations.</p>
            <p>You will be redirected to Prolific in 5 seconds...</p>
            <button onclick="window.location.href='https://app.prolific.com/submissions/complete?cc=C1205BTX'">
                Return to Prolific Now
            </button>
        </div>
    `;
    
    setTimeout(() => {
        window.location.href = 'https://app.prolific.com/submissions/complete?cc=C1205BTX';
    }, 5000);
}

// Load first meme when page loads
document.addEventListener('DOMContentLoaded', loadNextMeme); 