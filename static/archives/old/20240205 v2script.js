document.addEventListener('DOMContentLoaded', function() {
    const startRecordBtn = document.getElementById('start-record-btn');
    const transcribedTextBox = document.getElementById('transcribed-text-box');
    const translatedTextBox = document.getElementById('translated-text-box');

    let isRecording = false;
    let mediaRecorder;
    let audioChunks = [];
    let currentAudio = null;

    startRecordBtn.addEventListener('click', function() {
        if (!isRecording) {
            startRecording();
        } else {
            stopRecording();
        }
        isRecording = !isRecording;
    });

    function startRecording() {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.start();

            document.getElementById('recordingIndicator').style.display = 'block'; // Show recording indicator

            mediaRecorder.ondataavailable = function(e) {
                audioChunks.push(e.data);
            };
        });
    startRecordBtn.textContent = 'Stop Recording';
}

    function stopRecording() {
        mediaRecorder.stop();
        startRecordBtn.textContent = 'Start Recording';

        document.getElementById('recordingIndicator').style.display = 'none'; // Hide recording indicator

        mediaRecorder.onstop = function(e) {
            sendAudioToServer(); // Call this function to send audio to server
        };

        mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }

    function sendAudioToServer() {
        console.log("sendAudioToServer called");
        const processingIndicator = document.getElementById('processingIndicator'); 
        processingIndicator.style.display = 'block';

        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const formData = new FormData();
        
        formData.append('audio', audioBlob);
        const selectedLanguage = document.getElementById('language-dropdown').value;
        formData.append('language', selectedLanguage);

        fetch('http://127.0.0.1:5000/process_audio', {
            method: 'POST',
            body: formData
        }).then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        }).then(data => {
            processingIndicator.style.display = 'none'; // Hide processing indicator
            transcribedTextBox.textContent = data.transcript;
            translatedTextBox.textContent = data.translated_text;

            // Play the translated text
            playSynthesizedSpeech(data.translated_text, selectedLanguage);
        }).catch(error => {
            processingIndicator.style.display = 'none'; // Hide processing indicator in case of error
            console.error('Error:', error);
        });
    }

    function playSynthesizedSpeech(text, language) {
        console.log(`playSynthesizedSpeech called with text: ${text} and language: ${language}`);
        const playbackIndicator = document.getElementById('playbackIndicator'); // Get the playback indicator element
    
        if (currentAudio && !currentAudio.paused) {
            currentAudio.pause();
            currentAudio.currentTime = 0; // Reset audio playback to the start
        }
    
        fetch('http://127.0.0.1:5000/synthesize_speech', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: text, language: language })
        }).then(response => response.blob())
        .then(blob => {
            const audioUrl = URL.createObjectURL(blob);
            currentAudio = new Audio(audioUrl);
    
            playbackIndicator.style.display = 'block'; // Show the playback indicator
    
            currentAudio.play();
            currentAudio.onended = () => {
                playbackIndicator.style.display = 'none'; // Hide the playback indicator when audio ends
            };
        }).catch(error => {
            console.error('Error:', error);
            playbackIndicator.style.display = 'none'; // Hide the playback indicator in case of error
        });
    }
  

    }
);
