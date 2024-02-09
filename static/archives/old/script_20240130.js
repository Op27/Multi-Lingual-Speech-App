document.addEventListener('DOMContentLoaded', function() {
  const startRecordBtn = document.getElementById('start-record-btn');
  const transcribedTextBox = document.getElementById('transcribed-text-box');
  const translatedTextBox = document.getElementById('translated-text-box');

  let isRecording = false;
  let mediaRecorder;
  let audioChunks = [];

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

            mediaRecorder.ondataavailable = function(e) {
                audioChunks.push(e.data);
            };

            mediaRecorder.onstop = function() {
                console.log(document.getElementById('recordedAudio')); // Debugging line
                const audio = document.getElementById('recordedAudio');
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                const audioUrl = URL.createObjectURL(audioBlob);
                audio.src = audioUrl;

                // Clear the audioChunks array
                audioChunks = [];
            };
        });
    startRecordBtn.textContent = 'Stop Recording';
}

function stopRecording() {
    mediaRecorder.stop();
    startRecordBtn.textContent = 'Start Recording';

    mediaRecorder.onstop = function(e) {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        document.getElementById('recordedAudio').src = audioUrl; // For debugging, can be removed later

        sendAudioToServer(); // Call this function to send audio to server

        // Clear the audioChunks array
        audioChunks = [];
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
    };
}


function sendAudioToServer() {
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
        // Update the transcribed and translated text boxes
        transcribedTextBox.textContent = data.transcript; // Assuming 'data.transcript' holds the transcribed text
        translatedTextBox.textContent = data.translated_text; // Assuming 'data.translated_text' holds the translated text
    }).catch(error => {
        console.error('Error:', error);
    });
}




});
