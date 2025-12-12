const analyzeBtn = document.getElementById('analyzeAudioBtn');
const audioInput = document.getElementById('audioInput');
const resultsBox = document.getElementById('resultsSection');

analyzeBtn.addEventListener('click', async () => {
    if (!audioInput.files[0]) return;

    const formData = new FormData();
    formData.append('audio', audioInput.files[0]);

    analyzeBtn.disabled = true;

    const response = await fetch('http://localhost:3000/api/generate', {
        method: 'POST',
        body: formData
    });

    const data = await response.json();

    // Populate results
    document.getElementById('pieceTitle').innerText = data.title;
    document.getElementById('instrumentDetected').innerText = data.instrument;
    document.getElementById('keyTempo').innerText = data.keyTempo;
    document.getElementById('accuracyEstimate').innerText = data.accuracy;

    resultsBox.style.display = 'block';
    analyzeBtn.disabled = false;
    resultsBox.scrollIntoView({ behavior: 'smooth' });
});
