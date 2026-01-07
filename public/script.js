const analyzeBtn = document.getElementById('analyzeAudioBtn');
const audioInput = document.getElementById('audioInput');
const resultsBox = document.getElementById('resultsSection');

analyzeBtn.addEventListener('click', async () => {
    if (!audioInput.files[0]) {
        alert("Please select an audio file first!");
        return;
    }

    const formData = new FormData();
    formData.append('audio', audioInput.files[0]);

    // UI Feedback: Disable button and show loading state
    analyzeBtn.disabled = true;
    analyzeBtn.innerText = "Processing AI (this may take a minute)...";

    try {
        // Use relative path for deployment
        const response = await fetch('/api/generate', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Server error occurred");
        }

        const data = await response.json();

        // Populate results
        document.getElementById('pieceTitle').innerText = data.title || "Unknown Title";
        document.getElementById('instrumentDetected').innerText = data.instrument || "Piano";
        document.getElementById('keyTempo').innerText = data.keyTempo || "Detecting...";
        document.getElementById('accuracyEstimate').innerText = data.accuracy || "High";

        // Show the results section
        resultsBox.style.display = 'block';
        resultsBox.scrollIntoView({ behavior: 'smooth' });

    } catch (error) {
        console.error("Frontend Error:", error);
        alert("Error: " + error.message + ". Check the server logs for details.");
    } finally {
        // Re-enable button
        analyzeBtn.disabled = false;
        analyzeBtn.innerText = "Generate Notation";
    }
});