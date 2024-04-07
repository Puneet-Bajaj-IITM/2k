function uploadVideo() {
    const fileInput = document.getElementById('videoInput');
    const previewContainer = document.getElementById('previewContainer');
    const previewVideo = document.getElementById('previewVideo');
    const outputElement = document.getElementById('output');

    const file = fileInput.files[0];
    if (!file) {
        alert('Please select a video file.');
        return;
    }

    const videoURL = URL.createObjectURL(file);
    previewVideo.src = videoURL;
    previewContainer.style.display = 'block';

    fetch('/upload', {
        method: 'POST',
        body: file,
    })
    .then(response => response.json())
    .then(data => {
        outputElement.innerHTML = `<p>Speech in Video: ${data.speech}</p><p>Deepfake: ${data.is_deepfake ? 'Yes' : 'No'}</p>`;
    })
    .catch(error => {
        console.error('Error processing video:', error);
    });
}

function playPreview() {
    const previewVideo = document.getElementById('previewVideo');
    previewVideo.play();
}
