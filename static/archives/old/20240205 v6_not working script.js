document.addEventListener('DOMContentLoaded', function() {
    const startRecordBtn = document.getElementById('start-record-btn');
    const transcribedTextBox = document.getElementById('transcribed-text-box');
    const translatedTextBox = document.getElementById('translated-text-box');
    const recordingIndicator = document.getElementById('recordingIndicator');
    const processingIndicator = document.getElementById('processingIndicator');
    const playbackIndicator = document.getElementById('playbackIndicator');

    let isRecording = false;
    let mediaRecorder;
    let audioChunks = [];
    let currentAudio = null;
    let isSynthesizingSpeech = false;

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

                recordingIndicator.style.display = 'block';
                audioChunks = [];

                mediaRecorder.ondataavailable = function(e) {
                    audioChunks.push(e.data);
                };
            });
        startRecordBtn.textContent = 'Stop Recording';
    }

    function stopRecording() {
        mediaRecorder.stop();
        startRecordBtn.textContent = 'Start Recording';
        recordingIndicator.style.display = 'none';
        mediaRecorder.onstop = function(e) {
            sendAudioToServer();
        };
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }

    function sendAudioToServer() {
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
            processingIndicator.style.display = 'none';
            transcribedTextBox.textContent = data.transcript;
            translatedTextBox.textContent = data.translated_text;
            playSynthesizedSpeech(data.translated_text, selectedLanguage);
        }).catch(error => {
            processingIndicator.style.display = 'none';
            console.error('Error:', error);
        });
    }

    function playSynthesizedSpeech(text, language) {
        if (isSynthesizingSpeech) {
            console.log("A speech synthesis request is already in progress.");
            return;
        }
        isSynthesizingSpeech = true;
        playbackIndicator.style.display = 'block';

        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
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

            currentAudio.play();
            currentAudio.onended = () => {
                playbackIndicator.style.display = 'none';
                isSynthesizingSpeech = false;
            };
        }).catch(error => {
            console.error('Error:', error);
            playbackIndicator.style.display = 'none';
            isSynthesizingSpeech = false;
        });
    }
});
