document.addEventListener('DOMContentLoaded', function() {
    const startRecordBtn = document.getElementById('start-record-btn');
    const recordingIndicator = document.getElementById('recordingIndicator');
    const processingIndicator = document.getElementById('processingIndicator');
    const playbackIndicator = document.getElementById('playbackIndicator');
    const transcribedTextBox = document.getElementById('transcribed-text-box');
    const translatedTextBox = document.getElementById('translated-text-box');
    const languageDropdown = document.getElementById('language-dropdown');

    let isRecording = false;
    let mediaRecorder;
    let audioChunks = [];
    let currentAudio = null;

    function generateUniqueId() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    }

    startRecordBtn.addEventListener('click', function() {
        if (!isRecording) {
            startRecording();
        } else {
            stopRecording();
        }
        isRecording = !isRecording;
    });

    function startRecording() {
        audioChunks = []; // Clear previous audio chunks
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                mediaRecorder = new MediaRecorder(stream);
                mediaRecorder.start();

                recordingIndicator.style.display = 'block'; // Show recording indicator

                mediaRecorder.ondataavailable = function(e) {
                    audioChunks.push(e.data);
                };
            });
        startRecordBtn.textContent = 'Stop Recording';
    }

    function stopRecording() {
        mediaRecorder.stop();
        startRecordBtn.textContent = 'Start Recording';

        recordingIndicator.style.display = 'none'; // Hide recording indicator

        mediaRecorder.onstop = function() {
            sendAudioToServer(); // Call this function to send audio to server
        };

        mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }

    function sendAudioToServer() {
        processingIndicator.style.display = 'block'; // Show processing indicator

        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const formData = new FormData();
        
        formData.append('audio', audioBlob);
        const selectedLanguage = languageDropdown.value;
        formData.append('language', selectedLanguage);
        formData.append('recordingSessionId', generateUniqueId());

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
        playbackIndicator.style.display = 'block'; // Show the playback indicator

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
    
            currentAudio.play();
            currentAudio.onended = () => {
                playbackIndicator.style.display = 'none'; // Hide the playback indicator when audio ends
            };
        }).catch(error => {
            console.error('Error:', error);
            playbackIndicator.style.display = 'none'; // Hide the playback indicator in case of error
        });
    }
});
