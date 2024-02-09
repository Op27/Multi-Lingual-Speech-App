document.addEventListener('DOMContentLoaded', function() {
    const startRecordBtn = document.getElementById('start-record-btn');
    const transcribedTextBox = document.getElementById('transcribed-text-box');
    const translatedTextBox = document.getElementById('translated-text-box');

    let isRecording = false;
    let mediaRecorder;
    let audioChunks = [];
    let currentAudio = null;
    let isSynthesizingSpeech = false; // Flag to prevent multiple speech synthesis requests

    startRecordBtn.addEventListener('click', function() {
        if (!isRecording) {
            startRecording();
        } else {
            stopRecording();
        }
        isRecording = !isRecording;
    });

    function generateUniqueId() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    }  


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

        mediaRecorder.onstop = function() {
            sendAudioToServer(); // Call this function to send audio to server
        };

        mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }

    function sendAudioToServer() {
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

            playSynthesizedSpeech(data.translated_text, selectedLanguage); // Play the translated text
        }).catch(error => {
            processingIndicator.style.display = 'none'; // Hide processing indicator in case of error
            console.error('Error:', error);
        });
    }

    function playSynthesizedSpeech(text, language) {
        if (isSynthesizingSpeech) {
            console.log("A speech synthesis request is already in progress.");
            return; // Exit if another synthesis request is in progress
        }

        isSynthesizingSpeech = true; // Prevent further synthesis requests until this one completes

        const playbackIndicator = document.getElementById('playbackIndicator');

        if (currentAudio) {
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
                isSynthesizingSpeech = false; // Allow new synthesis requests
            };
        }).catch(error => {
            console.error('Error:', error);
            playbackIndicator.style.display = 'none'; // Hide the playback indicator in case of error
            isSynthesizingSpeech = false; // Allow new synthesis requests even after an error
        });
    }
});
