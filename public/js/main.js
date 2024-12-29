let uploadCount = 10;
let currentRow = 1;

function createUploadBox(index) {
    const uploadBox = document.createElement('div');
    uploadBox.className = 'upload-box';
    uploadBox.innerHTML = `
        <button type="button" class="delete-button" title="Delete image">×</button>
        <div class="upload-section">
            <div class="drop-zone" data-index="${index}">
                <img id="preview${index}" style="display: none;">
                <p><strong>Drag & drop or click to upload</strong><br>
                <small>Supported formats: PNG, GIF, JPEG, WebP, etc.</small></p>
                <input type="file" name="meme${index}" id="meme${index}" 
                    accept="image/png,image/gif,image/jpeg,image/webp,image/jpg,image/bmp" hidden>
            </div>
            <div class="progress-bar" id="progress${index}">
                <div class="progress-bar-fill"></div>
            </div>
            <div class="upload-status" id="status${index}"></div>
        </div>
        
        <hr class="section-divider">
        
        <div class="text-entries-section">
            <div class="textarea-group">
                <label for="culturalContext${index}"><strong>Cultural Context:</strong></label>
                <textarea name="culturalContext${index}" id="culturalContext${index}" rows="3" 
                    placeholder="Enter Cultural Context explanation here" required></textarea>
            </div>
            
            <div class="textarea-group">
                <label for="potentialMisunderstandings${index}"><strong>Potential Misunderstandings:</strong></label>
                <textarea name="potentialMisunderstandings${index}" id="potentialMisunderstandings${index}" rows="3" 
                    placeholder="Enter Potential Misunderstandings here" required></textarea>
            </div>
        </div>
        
        <hr class="section-divider">
        
        <div class="labels-container">
            <div class="sentiment-labels">
                <label>Sentiment Label:</label>
                <select name="sentimentLabel${index}" id="sentimentLabel${index}" required>
                    <option value="">Select sentiment</option>
                    <option value="positive">Positive</option>
                    <option value="negative">Negative</option>
                    <option value="neutral">Neutral</option>
                </select>
            </div>
            
            <div class="emotion-labels">
                <label>Emotion Labels:</label>
                <small class="label-hint">(You can select multiple)</small>
                <div class="checkbox-group">
                    <label><input type="checkbox" name="emotionLabel${index}[]" value="sarcastic"> Sarcastic</label>
                    <label><input type="checkbox" name="emotionLabel${index}[]" value="humorous"> Humorous</label>
                    <label><input type="checkbox" name="emotionLabel${index}[]" value="motivation"> Motivation</label>
                    <label><input type="checkbox" name="emotionLabel${index}[]" value="offensive"> Offensive</label>
                </div>
            </div>
        </div>
    `;

    setupDropZone(uploadBox, index);
    setupDeleteButton(uploadBox, index);
    return uploadBox;
}

function setupDropZone(uploadBox, index) {
    const dropZone = uploadBox.querySelector('.drop-zone');
    const input = uploadBox.querySelector(`#meme${index}`);
    const preview = uploadBox.querySelector(`#preview${index}`);
    const progressBar = uploadBox.querySelector(`#progress${index}`);
    const progressFill = progressBar.querySelector('.progress-bar-fill');
    const status = uploadBox.querySelector(`#status${index}`);

    // Handle drag & drop events
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => dropZone.classList.add('dragover'));
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => dropZone.classList.remove('dragover'));
    });

    dropZone.addEventListener('drop', (e) => {
        const file = e.dataTransfer.files[0];
        handleFile(file, preview, progressBar, progressFill, status);
    });

    dropZone.addEventListener('click', () => input.click());
    
    input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        handleFile(file, preview, progressBar, progressFill, status);
    });
}

function setupDeleteButton(uploadBox, index) {
    const deleteButton = uploadBox.querySelector('.delete-button');
    const input = uploadBox.querySelector(`#meme${index}`);
    const preview = uploadBox.querySelector(`#preview${index}`);
    const status = uploadBox.querySelector(`#status${index}`);
    const progressBar = uploadBox.querySelector(`#progress${index}`);

    deleteButton.addEventListener('click', (e) => {
        e.preventDefault();
        // Clear the file input
        input.value = '';
        // Hide the preview
        preview.style.display = 'none';
        preview.src = '';
        // Reset the status
        status.textContent = '';
        // Hide the progress bar
        progressBar.style.display = 'none';
        // Reset progress
        progressBar.querySelector('.progress-bar-fill').style.width = '0%';
        // Remove the has-image class
        uploadBox.classList.remove('has-image');
        // Show the drop text
        uploadBox.querySelector('.drop-zone p').style.display = 'block';
    });
}

function handleFile(file, preview, progressBar, progressFill, status) {
    if (!file || !file.type.startsWith('image/')) {
        status.textContent = 'Please upload an image file';
        return;
    }

    const uploadBox = preview.closest('.upload-box');
    progressBar.style.display = 'block';
    
    let progress = 0;
    const interval = setInterval(() => {
        progress += 10;
        progressFill.style.width = `${progress}%`;
        status.textContent = `Uploading: ${progress}%`;
        
        if (progress >= 100) {
            clearInterval(interval);
            status.textContent = 'Upload complete!';
            
            const reader = new FileReader();
            reader.onload = (e) => {
                preview.src = e.target.result;
                preview.style.display = 'block';
                uploadBox.classList.add('has-image');
                // Store the file in a data attribute
                preview.dataset.file = JSON.stringify({
                    name: file.name,
                    type: file.type,
                    size: file.size
                });
                // Keep the original file in the input
                const input = uploadBox.querySelector('input[type="file"]');
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                input.files = dataTransfer.files;
                uploadBox.querySelector('.drop-zone p').style.display = 'none';
            };
            reader.readAsDataURL(file);
        }
    }, 200);
}

function initializeUploadBoxes() {
    const container = document.querySelector('.upload-container');
    
    // First row (boxes 1-5)
    const row1 = document.createElement('div');
    row1.className = 'upload-row';
    for (let i = 1; i <= 5; i++) {
        row1.appendChild(createUploadBox(i));
    }
    container.appendChild(row1);
    
    // Second row (boxes 6-10)
    const row2 = document.createElement('div');
    row2.className = 'upload-row';
    for (let i = 6; i <= 10; i++) {
        row2.appendChild(createUploadBox(i));
    }
    container.appendChild(row2);
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

document.getElementById('addMore')?.addEventListener('click', () => {
    const container = document.querySelector('.upload-container');
    uploadCount++;
    
    // Find the last row or create a new one
    let lastRow = container.lastElementChild;
    if (lastRow.children.length >= 5) {
        // Create new row if the last one is full
        lastRow = document.createElement('div');
        lastRow.className = 'upload-row';
        container.appendChild(lastRow);
    }
    
    // Add single new upload box
    lastRow.appendChild(createUploadBox(uploadCount));
});

// Add this new function for form validation
function validateForm(form) {
    let validUploads = 0;
    const boxes = form.querySelectorAll('.upload-box');
    
    for (let box of boxes) {
        const input = box.querySelector('input[type="file"]');
        const preview = box.querySelector('img');
        const description = box.querySelector('textarea');
        
        if (preview.style.display === 'block' && description.value.trim()) {
            validUploads++;
        }
    }
    
    if (validUploads === 0) {
        alert('Please upload at least one meme with a description.');
        return false;
    }
    
    return true;
}

// Add form submission handling
window.onload = () => {
    initializeUploadBoxes();
    
    const form = document.getElementById('memeForm');
    form.onsubmit = function(e) {
        e.preventDefault();
        
        if (validateForm(this)) {
            const formData = new FormData();
            const boxes = form.querySelectorAll('.upload-box');
            let fileCount = 0;
            
            boxes.forEach((box, index) => {
                const fileInput = box.querySelector('input[type="file"]');
                const culturalContext = box.querySelector(`#culturalContext${index + 1}`);
                const potentialMisunderstandings = box.querySelector(`#potentialMisunderstandings${index + 1}`);
                const sentimentLabel = box.querySelector(`#sentimentLabel${index + 1}`);
                const emotionLabels = Array.from(box.querySelectorAll(`input[name="emotionLabel${index + 1}[]"]:checked`))
                    .map(cb => cb.value);
                
                if (fileInput.files && fileInput.files[0]) {
                    const file = fileInput.files[0];
                    formData.append(`meme`, file);
                    formData.append(`culturalContext${fileCount + 1}`, culturalContext.value);
                    formData.append(`potentialMisunderstandings${fileCount + 1}`, potentialMisunderstandings.value);
                    formData.append(`sentimentLabel${fileCount + 1}`, sentimentLabel.value);
                    formData.append(`emotionLabels${fileCount + 1}`, JSON.stringify(emotionLabels));
                    fileCount++;
                }
            });
            
            if (fileCount > 0) {
                submitForm(formData);
            }
        }
    };
};

// Add this new function to handle the actual form submission
function submitForm(formData) {
    // Log the contents of formData for debugging
    for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
    }

    fetch('/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => {
                throw new Error(text || 'Upload failed');
            });
        }
        return response.text();
    })
    .then(result => {
        const container = document.querySelector('.container');
        container.innerHTML = `
            <div class="thank-you-message">
                <h1>Thank You!</h1>
                <p>Your contribution is greatly appreciated.</p>
                <p>You may now close this window.</p>
            </div>
        `;
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while uploading the files: ' + error.message);
    });
}
