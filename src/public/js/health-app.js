const startBtn = document.getElementById('start-btn');
const appContainer = document.getElementById('app-container');
const statusText = document.getElementById('status-text');
const resultText = document.getElementById('result-text');
let mediaRecorder;
let audioChunks = [];

startBtn.addEventListener('click', async () => {
    if (document.body.classList.contains('recording-mode')) return;

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Update UI to "Getting Ready"
        startBtn.style.pointerEvents = 'none';
        statusText.innerText = "Get Ready...";
        
        setTimeout(() => {
            startRecording(stream);
        }, 1000);

    } catch (err) {
        console.error("Error accessing microphone:", err);
        statusText.innerText = "Microphone access denied.";
    }
});

function startRecording(stream) {
    document.body.classList.add('recording-mode');
    statusText.innerText = "Recording...";
    startBtn.innerHTML = "<span>...</span>";
    
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];

    mediaRecorder.addEventListener("dataavailable", event => {
        audioChunks.push(event.data);
    });

    mediaRecorder.addEventListener("stop", () => {
        document.body.classList.remove('recording-mode');
        statusText.innerText = "Analyzing...";
        startBtn.innerHTML = "<span>START</span>";
        startBtn.style.pointerEvents = 'auto';
        
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        sendAudio(audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
    });

    mediaRecorder.start();

    setTimeout(() => {
        mediaRecorder.stop();
    }, 15000);
}

async function sendAudio(blob) {
    const formData = new FormData();
    formData.append('audio', blob, 'heartbeat.wav');

    try {
        const response = await fetch('/api/health/analyze', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) throw new Error('Analysis failed');
        
        const data = await response.json();
        resultText.innerText = `Heart Rate: ${data.bpm} BPM`;
        statusText.innerText = "Done";
    } catch (error) {
        console.error(error);
        statusText.innerText = "Error during analysis";
    }
}
