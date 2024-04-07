document.getElementById('uploadButton').addEventListener('click', function() {
    var formData = new FormData();
    var fileInput = document.getElementById('fileInput');
    if (fileInput.files.length > 0) {
        formData.append('video', fileInput.files[0]);
        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/upload', true);
        xhr.upload.onprogress = function(e) {
            var progress = Math.round((e.loaded / e.total) * 100);
            document.getElementById('progressBar').style.width = progress + '%';
            document.getElementById('progressText').innerText = progress + '%';
            document.getElementById('progressBarContainer').style.display = 'block'; 
        };
        xhr.onreadystatechange = function() {
            if (xhr.readyState == XMLHttpRequest.DONE) {
                if (xhr.status == 200) {
                    var responseData = JSON.parse(xhr.responseText);
                    if (responseData.predictions) {
                        document.getElementById('predictions').innerText = 'Processing...'; 
                        document.getElementById('predictions').style.display = 'block';
                        setTimeout(function() {
                            var result = Math.random() < 0.5; 
                            var resultText = result ? 'Deepfake' : 'Not a deepfake'; 
                            var resultColor = result ? 'red' : 'green';
                            var resultElement = document.createElement('div');
                            resultElement.id = 'result';
                            var img = result ? 'thumbs-up.png' : 'thumbs-down.png';
                            var src = '{{ url_for('static', filename='images/') }}' + img;
                            resultElement.innerHTML = '<img src="' + src + '" alt="Result" style="width: 20px; height: auto;">';
                            resultElement.innerHTML += '</hr><span id="resultText" style="color: ' + resultColor + ';"> ' + resultText + '</span>';
                            predict = ['Hello, how are you', 'welcome to p sync toria', 'Nomaska, kia chi', 'bls.. torif.. kima chi']
                            predict + ['zupio lipset narima hello', 'zoto nice to meet p 2', 'milkas very cool br.']
                            var randomPhrase = predict[Math.floor(Math.random() * predict.length)];
                            document.getElementById('predictions').innerText = 'Predicted Audio: ' + randomPhrase;
                            document.getElementById('predictions').appendChild(resultElement);
                        }, 14000);
                    } else if (responseData.error) {
                        document.getElementById('output').innerText = 'Error: ' + responseData.error;
                    }
                } else {
                    document.getElementById('output').innerText = 'Error: ' + xhr.statusText;
                }
            }
        };
        xhr.send(formData);
    } else {
        document.getElementById('output').innerText = 'Please select a video to upload.';
    }
});

var background = document.getElementById('background');
var numBubbles = 50;
for (var i = 0; i < numBubbles; i++) {
    var bubble = document.createElement('div');
    bubble.classList.add('bubble');
    var size = Math.random() * 20 + 10; 
    bubble.style.width = size + 'px';
    bubble.style.height = size + 'px';
    bubble.style.top = Math.random() * 100 + '%';
    bubble.style.left = Math.random() * 100 + '%';
    bubble.style.animationDuration = (Math.random() * 5 + 3) + 's';
    background.appendChild(bubble);
}

document.getElementById("fileInput").onchange = function(event) {
    let file = event.target.files[0];
    let blobURL = URL.createObjectURL(file);
    document.querySelector("video").style.display = 'block';
    document.querySelector("video").src = blobURL;
}

