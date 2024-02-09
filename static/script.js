document.addEventListener('DOMContentLoaded', function() {
    const startRecordBtn = document.getElementById('start-record-btn');
    const transcribedTextBox = document.getElementById('transcribed-text-box');
    const translatedTextBox = document.getElementById('translated-text-box');
    const processingIndicator = document.getElementById('processingIndicator');
    const playbackIndicator = document.getElementById('playbackIndicator');

    let isRecording = false;
    let mediaRecorder;
    let audioChunks = [];
    let currentAudio = null;
    let isSynthesizingSpeech = false; 
    let audioQueue = []; 

    function generateUniqueId() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    }
    
    function enqueueAudio(blob) {
        const audioUrl = URL.createObjectURL(blob);
        audioQueue.push(audioUrl);
    
        if (!isSynthesizingSpeech || audioQueue.length === 1) {
            playNextInQueue();
        }
    }  

    function playNextInQueue() {
        if (audioQueue.length > 0) {
            const nextAudioUrl = audioQueue.shift();
            currentAudio = new Audio(nextAudioUrl);
            currentAudio.play().then(() => {
                console.log("Audio playback started.");
            }).catch(error => {
                console.error("Error playing audio:", error);
            });
            currentAudio.onended = playNextInQueue;
        } else {
            isSynthesizingSpeech = false;
            console.log("Audio queue is empty.");
        }
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
        audioChunks = [];
        const recordingSessionId = generateUniqueId(); 
        sessionStorage.setItem('recordingSessionId', recordingSessionId);

        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                mediaRecorder = new MediaRecorder(stream);
                mediaRecorder.start();
                document.getElementById('recordingIndicator').style.display = 'block';

                mediaRecorder.ondataavailable = function(e) {
                    audioChunks.push(e.data);
                };
            });
        startRecordBtn.textContent = 'Stop Recording';
    }

    function stopRecording() {
        mediaRecorder.stop();
        startRecordBtn.textContent = 'Start Recording';
        document.getElementById('recordingIndicator').style.display = 'none';
        mediaRecorder.onstop = sendAudioToServer; 
        mediaRecorder.stream.getTracks().forEach(track => track.stop()); 
    }

    function sendAudioToServer() {
        processingIndicator.style.display = 'block';
    
        const audioBlob = new Blob(audioChunks, {type: 'audio/wav'});
        const selectedLanguage = document.getElementById('language-dropdown').value; 
        const formData = new FormData();
        formData.append('audio', audioBlob);
        formData.append('language', selectedLanguage); 
    
        fetch('http://127.0.0.1:5000/process_audio', {
            method: 'POST',
            body: formData,
        }).then(response => response.json())
        .then(data => {
            processingIndicator.style.display = 'none';
            transcribedTextBox.textContent = data.transcript;
            translatedTextBox.textContent = data.translated_text;
            playSynthesizedSpeech(data.translated_text, selectedLanguage);
        }).catch(error => {
            console.error('Error:', error);
            processingIndicator.style.display = 'none';
        });
    }
        

    function playSynthesizedSpeech(text, language) {
        if (isSynthesizingSpeech) {
            console.log("A speech synthesis request is already in progress.");
            return;
        }
        isSynthesizingSpeech = true;
    
        fetch('http://127.0.0.1:5000/synthesize_speech', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({text: text, language: language}),
        }).then(response => response.blob())
        .then(blob => {
            enqueueAudio(blob); 
        }).catch(error => {
            console.error('Error:', error);
            isSynthesizingSpeech = false; 
        });
    }
       
});
