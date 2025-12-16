// ================================
// Element References
// ================================
const audioInput = document.getElementById('audioInput');
const previewPlaceholder = document.getElementById('previewPlaceholder');
const analyzeBtn = document.getElementById('analyzeAudioBtn');
const fileNameDisplay = document.getElementById('fileNameDisplay');
const resultsBox = document.getElementById('resultsSection');
const loadingSpinner = document.getElementById('loadingSpinner');

// ================================
// State
// ================================
let currentAudioFile = null;

// ================================
// File Selection Handler
// ================================
audioInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    currentAudioFile = file;

    // Update preview UI
    previewPlaceholder.style.display = 'none';
    fileNameDisplay.textContent = file.name;
    fileNameDisplay.style.display = 'block';

    // Enable analyze button
    analyzeBtn.disabled = false;

    // Reset previous results
    resultsBox.style.display = 'none';
});

// ================================
// Analyze / Generate Button
// ================================
analyzeBtn.addEventListener('click', async () => {
    if (!currentAudioFile) return;

    analyzeBtn.disabled = true;
    loadingSpinner.style.display = 'flex';

    try {
        // ----------------------------
        // MOCK AI PROCESSING (Demo)
        // Replace with real backend later
        // ----------------------------
        await new Promise(resolve => setTimeout(resolve, 2500));

        // Populate demo results
        document.getElementById('pieceTitle').innerText =
            currentAudioFile.name.replace(/\.[^/.]+$/, "");

        document.getElementById('instrumentDetected').innerText =
            "Vocal / Melody + Chord Accompaniment";

        document.getElementById('keyTempo').innerText =
            "D Major / 120 BPM";

        document.getElementById('accuracyEstimate').innerText =
            "94%";

        resultsBox.style.display = 'block';
        resultsBox.scrollIntoView({ behavior: 'smooth' });

    } catch (err) {
        console.error(err);
        alert('An error occurred while processing the audio.');
    } finally {
        loadingSpinner.style.display = 'none';
        analyzeBtn.disabled = false;
    }
});
