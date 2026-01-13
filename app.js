// Configuration - These will be set via environment variables in Vercel
const SUPABASE_URL = window.ENV?.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = window.ENV?.SUPABASE_ANON_KEY || '';
const GEMINI_API_KEY = window.ENV?.GEMINI_API_KEY || '';

// Initialize Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Global State
let currentUser = null;
let uploadedImages = [];
let generatedImages = [];
let elements = [];
let currentModalIndex = 0;
let imageToSave = null;

// Initialize App
async function init() {
    showLoading(true);

    // Sign in anonymously
    const { data: { user }, error } = await supabase.auth.signInAnonymously();

    if (error) {
        console.error('Auth error:', error);
        alert('Failed to authenticate. Please refresh the page.');
        showLoading(false);
        return;
    }

    currentUser = user;
    console.log('Authenticated as:', user.id);

    // Load elements and generated images
    await loadElements();
    await loadGeneratedImages();

    // Setup event listeners
    setupEventListeners();

    showLoading(false);
}

// Setup Event Listeners
function setupEventListeners() {
    // Add images button
    document.getElementById('addImagesBtn').addEventListener('click', () => {
        document.getElementById('fileInput').click();
    });

    // File input change
    document.getElementById('fileInput').addEventListener('change', handleFileSelect);

    // Generate button
    document.getElementById('generateBtn').addEventListener('click', handleGenerate);

    // Refresh elements
    document.getElementById('refreshElements').addEventListener('click', loadElements);

    // Modal controls
    document.querySelector('.modal-close').addEventListener('click', closeModal);
    document.querySelector('.modal-nav-prev').addEventListener('click', () => navigateModal(-1));
    document.querySelector('.modal-nav-next').addEventListener('click', () => navigateModal(1));
    document.getElementById('modalDownload').addEventListener('click', downloadModalImage);
    document.getElementById('modalSaveElement').addEventListener('click', () => openSaveElementDialog(imageToSave));
    document.getElementById('modalReinsert').addEventListener('click', reinsertModalImage);

    // Save element dialog
    document.getElementById('confirmSaveElement').addEventListener('click', confirmSaveElement);
    document.getElementById('cancelSaveElement').addEventListener('click', closeSaveElementDialog);

    // Prompt input @ mention handling
    const promptDisplay = document.getElementById('promptDisplay');
    promptDisplay.addEventListener('input', handlePromptInput);
    promptDisplay.addEventListener('keydown', handlePromptKeydown);

    // Close modal on escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
            closeSaveElementDialog();
        }
    });
}

// Handle File Selection
async function handleFileSelect(e) {
    const files = Array.from(e.target.files);

    if (uploadedImages.length + files.length > 10) {
        alert('Maximum 10 images allowed');
        return;
    }

    for (const file of files) {
        if (!file.type.startsWith('image/')) continue;

        const imageData = {
            file,
            preview: URL.createObjectURL(file),
            id: Date.now() + Math.random()
        };

        uploadedImages.push(imageData);
    }

    renderUploadedImages();
    updatePhotoCount();

    // Clear file input
    e.target.value = '';
}

// Render Uploaded Images
function renderUploadedImages() {
    const container = document.getElementById('uploadedImages');
    container.innerHTML = '';

    uploadedImages.forEach((image, index) => {
        const card = document.createElement('div');
        card.className = 'image-card';
        card.innerHTML = `
            <img src="${image.preview}" alt="Uploaded ${index + 1}">
            <div class="image-card-actions">
                <button class="btn-save-element" data-index="${index}">Save Element</button>
                <button class="btn-remove" data-index="${index}">Remove</button>
            </div>
        `;

        // Click to view
        card.querySelector('img').addEventListener('click', () => {
            openModal(uploadedImages, index);
        });

        // Save as element
        card.querySelector('.btn-save-element').addEventListener('click', async (e) => {
            e.stopPropagation();
            await saveAsElement(image);
        });

        // Remove
        card.querySelector('.btn-remove').addEventListener('click', (e) => {
            e.stopPropagation();
            removeUploadedImage(index);
        });

        container.appendChild(card);
    });
}

// Remove Uploaded Image
function removeUploadedImage(index) {
    URL.revokeObjectURL(uploadedImages[index].preview);
    uploadedImages.splice(index, 1);
    renderUploadedImages();
    updatePhotoCount();
}

// Update Photo Count
function updatePhotoCount() {
    const count = uploadedImages.length;
    const countEl = document.getElementById('photoCount');
    const statusEl = document.getElementById('photoCountStatus');

    countEl.textContent = count;

    if (count >= 1 && count <= 4) {
        statusEl.textContent = 'Few Photos';
        statusEl.className = 'status-badge warning';
    } else if (count >= 5 && count <= 7) {
        statusEl.textContent = 'Compliant';
        statusEl.className = 'status-badge compliant';
    } else if (count >= 8 && count <= 10) {
        statusEl.textContent = 'Optimal';
        statusEl.className = 'status-badge optimal';
    } else {
        statusEl.textContent = '';
        statusEl.className = 'status-badge';
    }
}

// Load Elements
async function loadElements() {
    try {
        const { data, error } = await supabase
            .from('elements')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        elements = data || [];
        renderElements();
    } catch (error) {
        console.error('Error loading elements:', error);
    }
}

// Render Elements
function renderElements() {
    const container = document.getElementById('elementsList');

    if (elements.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); margin: 0;">No saved elements yet</p>';
        return;
    }

    container.innerHTML = '';

    elements.forEach((element) => {
        const item = document.createElement('div');
        item.className = 'element-item';
        item.innerHTML = `
            <img src="${element.image_url}" alt="${element.name}">
            <span class="element-name">@${element.name}</span>
            <div class="element-delete" data-id="${element.id}">&times;</div>
        `;

        // Click to insert into prompt
        item.addEventListener('click', (e) => {
            if (!e.target.classList.contains('element-delete')) {
                insertElementMention(element.name);
            }
        });

        // Delete element
        item.querySelector('.element-delete').addEventListener('click', async (e) => {
            e.stopPropagation();
            await deleteElement(element.id);
        });

        container.appendChild(item);
    });
}

// Insert Element Mention
function insertElementMention(name) {
    const promptDisplay = document.getElementById('promptDisplay');
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);

    const mention = document.createElement('span');
    mention.className = 'element-mention';
    mention.contentEditable = 'false';
    mention.textContent = `@${name}`;
    mention.dataset.element = name;

    range.insertNode(mention);
    range.setStartAfter(mention);
    range.setEndAfter(mention);
    selection.removeAllRanges();
    selection.addRange(range);

    // Add space after
    const space = document.createTextNode(' ');
    range.insertNode(space);
    range.setStartAfter(space);
    range.setEndAfter(space);
    selection.removeAllRanges();
    selection.addRange(range);

    promptDisplay.focus();
}

// Handle Prompt Input (for @ mentions)
function handlePromptInput(e) {
    // This could be enhanced to show autocomplete on @ typing
}

// Handle Prompt Keydown
function handlePromptKeydown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleGenerate();
    }
}

// Save as Element
async function saveAsElement(imageData) {
    const name = prompt('Enter element name (e.g., jewelry_anchor):');

    if (!name) return;

    // Validate name
    const cleanName = name.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');

    if (!cleanName) {
        alert('Invalid element name');
        return;
    }

    showLoading(true);

    try {
        // Upload image to Supabase Storage
        const fileName = `${currentUser.id}/${cleanName}_${Date.now()}.jpg`;
        const file = imageData.file || await urlToFile(imageData.url, `${cleanName}.jpg`);

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('elements')
            .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('elements')
            .getPublicUrl(fileName);

        // Save to database
        const { error: dbError } = await supabase
            .from('elements')
            .insert({
                user_id: currentUser.id,
                name: cleanName,
                image_url: publicUrl
            });

        if (dbError) throw dbError;

        await loadElements();
        alert(`Element "@${cleanName}" saved successfully!`);
    } catch (error) {
        console.error('Error saving element:', error);
        alert('Failed to save element');
    } finally {
        showLoading(false);
    }
}

// Delete Element
async function deleteElement(id) {
    if (!confirm('Delete this element?')) return;

    showLoading(true);

    try {
        const { error } = await supabase
            .from('elements')
            .delete()
            .eq('id', id);

        if (error) throw error;

        await loadElements();
    } catch (error) {
        console.error('Error deleting element:', error);
        alert('Failed to delete element');
    } finally {
        showLoading(false);
    }
}

// Handle Generate
async function handleGenerate() {
    const promptDisplay = document.getElementById('promptDisplay');
    const promptText = extractPromptText(promptDisplay);
    const referencedElements = extractReferencedElements(promptDisplay);

    if (!promptText.trim()) {
        alert('Please enter a prompt');
        return;
    }

    if (uploadedImages.length === 0) {
        alert('Please upload at least one image');
        return;
    }

    showLoading(true);

    try {
        // Prepare images for API
        const imageParts = [];

        // Add uploaded images
        for (const image of uploadedImages) {
            const base64 = await fileToBase64(image.file);
            imageParts.push({
                inlineData: {
                    mimeType: image.file.type,
                    data: base64
                }
            });
        }

        // Add referenced element images
        for (const elementName of referencedElements) {
            const element = elements.find(e => e.name === elementName);
            if (element) {
                const base64 = await urlToBase64(element.image_url);
                imageParts.push({
                    inlineData: {
                        mimeType: 'image/jpeg',
                        data: base64
                    }
                });
            }
        }

        // Call Gemini API
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { text: promptText },
                            ...imageParts
                        ]
                    }],
                    generationConfig: {
                        temperature: 0.4,
                        topK: 32,
                        topP: 1,
                        maxOutputTokens: 4096
                    }
                })
            }
        );

        if (!response.ok) {
            throw new Error('API request failed');
        }

        const result = await response.json();
        console.log('Gemini response:', result);

        // NOTE: For v0, since Gemini returns text analysis not images,
        // we'll save the uploaded images as "optimized" versions
        // In production, you'd use a proper image generation API

        for (const image of uploadedImages) {
            await saveGeneratedImage(image, promptText);
        }

        await loadGeneratedImages();
        alert('Images processed! In v0, uploaded images are saved as optimized versions.');

    } catch (error) {
        console.error('Error generating:', error);
        alert('Failed to generate images. Check console for details.');
    } finally {
        showLoading(false);
    }
}

// Save Generated Image
async function saveGeneratedImage(imageData, prompt) {
    try {
        const fileName = `${currentUser.id}/generated_${Date.now()}_${Math.random()}.jpg`;
        const file = imageData.file;

        // Upload to storage
        const { error: uploadError } = await supabase.storage
            .from('generated')
            .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('generated')
            .getPublicUrl(fileName);

        // Save to database
        const { error: dbError } = await supabase
            .from('generated_images')
            .insert({
                user_id: currentUser.id,
                prompt: prompt,
                image_url: publicUrl
            });

        if (dbError) throw dbError;

    } catch (error) {
        console.error('Error saving generated image:', error);
        throw error;
    }
}

// Load Generated Images
async function loadGeneratedImages() {
    try {
        const { data, error } = await supabase
            .from('generated_images')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        generatedImages = data || [];
        renderGeneratedImages();
    } catch (error) {
        console.error('Error loading generated images:', error);
    }
}

// Render Generated Images
function renderGeneratedImages() {
    const container = document.getElementById('generatedImages');

    if (generatedImages.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary);">No generated images yet</p>';
        return;
    }

    container.innerHTML = '';

    generatedImages.forEach((image, index) => {
        const card = document.createElement('div');
        card.className = 'image-card';
        card.innerHTML = `
            <img src="${image.image_url}" alt="Generated ${index + 1}">
            <div class="image-card-actions">
                <button class="btn-save-element" data-index="${index}">Save Element</button>
            </div>
        `;

        // Click to view
        card.querySelector('img').addEventListener('click', () => {
            openModal(generatedImages, index, true);
        });

        // Save as element
        card.querySelector('.btn-save-element').addEventListener('click', async (e) => {
            e.stopPropagation();
            await saveAsElement({ url: image.image_url });
        });

        container.appendChild(card);
    });
}

// Extract Prompt Text
function extractPromptText(element) {
    const nodes = Array.from(element.childNodes);
    return nodes.map(node => {
        if (node.nodeType === Node.TEXT_NODE) {
            return node.textContent;
        } else if (node.classList?.contains('element-mention')) {
            return node.textContent;
        }
        return '';
    }).join('');
}

// Extract Referenced Elements
function extractReferencedElements(element) {
    const mentions = element.querySelectorAll('.element-mention');
    return Array.from(mentions).map(m => m.dataset.element);
}

// Open Modal
function openModal(imageArray, index, isGenerated = false) {
    currentModalIndex = index;
    imageToSave = imageArray[index];

    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');

    modalImage.src = isGenerated ? imageArray[index].image_url : imageArray[index].preview;
    modal.classList.add('active');

    // Update navigation buttons
    document.querySelector('.modal-nav-prev').style.display = index > 0 ? 'block' : 'none';
    document.querySelector('.modal-nav-next').style.display = index < imageArray.length - 1 ? 'block' : 'none';
}

// Close Modal
function closeModal() {
    document.getElementById('imageModal').classList.remove('active');
}

// Navigate Modal
function navigateModal(direction) {
    const totalImages = generatedImages.length || uploadedImages.length;
    currentModalIndex = (currentModalIndex + direction + totalImages) % totalImages;

    const isGenerated = generatedImages.length > 0;
    const imageArray = isGenerated ? generatedImages : uploadedImages;

    openModal(imageArray, currentModalIndex, isGenerated);
}

// Download Modal Image
function downloadModalImage() {
    const modalImage = document.getElementById('modalImage');
    const link = document.createElement('a');
    link.href = modalImage.src;
    link.download = `etsy-optimized-${Date.now()}.jpg`;
    link.click();
}

// Reinsert Modal Image
function reinsertModalImage() {
    // This would add the image back to uploaded images
    alert('Feature coming soon: Re-insert image to prompt');
    closeModal();
}

// Open Save Element Dialog
function openSaveElementDialog(image) {
    document.getElementById('saveElementDialog').classList.add('active');
}

// Close Save Element Dialog
function closeSaveElementDialog() {
    document.getElementById('saveElementDialog').classList.remove('active');
    document.getElementById('elementNameInput').value = '';
}

// Confirm Save Element
async function confirmSaveElement() {
    const name = document.getElementById('elementNameInput').value.trim();

    if (!name) {
        alert('Please enter a name');
        return;
    }

    const cleanName = name.toLowerCase().replace(/[^a-z0-9_]/g, '_');

    closeSaveElementDialog();
    closeModal();

    await saveAsElement(imageToSave);
}

// Utility: File to Base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Utility: URL to Base64
async function urlToBase64(url) {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

// Utility: URL to File
async function urlToFile(url, filename) {
    const response = await fetch(url);
    const blob = await response.blob();
    return new File([blob], filename, { type: blob.type });
}

// Show/Hide Loading
function showLoading(show) {
    const indicator = document.getElementById('loadingIndicator');
    if (show) {
        indicator.classList.add('active');
    } else {
        indicator.classList.remove('active');
    }
}

// Initialize on page load
init();
