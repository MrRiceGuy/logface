// script.js

document.addEventListener('DOMContentLoaded', function() {
    const logInput = document.getElementById('logInput');
    const imageInput = document.getElementById('imageInput');
    const saveButton = document.getElementById('saveButton');
    const logEntriesContainer = document.getElementById('logEntries');

    loadLogEntries();

    function loadLogEntries() {
        logEntriesContainer.innerHTML = '';

        fetch('/api/logs')
            .then(response => response.json())
            .then(data => {
                const reversedLogs = data.logs.reverse();
                reversedLogs.forEach(entry => {
                    const entryDiv = document.createElement('div');
                    entryDiv.classList.add('log-entry');

                    const timestamp = new Date(entry.timestamp);
                    const formattedTime = timestamp.toLocaleString('en-US', {
                        hour: 'numeric', minute: 'numeric', hour12: true
                    });
                    const formattedDate = timestamp.toLocaleDateString();

                    const logContent = document.createElement('p');
                    logContent.textContent = `${formattedDate} - ${formattedTime}: ${entry.log}`;

                    entryDiv.appendChild(logContent);

                    if (entry.image) {
                        const img = document.createElement('img');
                        img.src = entry.image;
                        img.alt = 'Log Image';
                        img.style.maxWidth = '100%';
                        entryDiv.appendChild(img);
                    }

                    logEntriesContainer.appendChild(entryDiv);
                });
            })
            .catch(error => console.error('Error fetching log entries:', error));
    }

    function saveLogEntry() {
        const logText = logInput.value.trim();
        const imageFile = imageInput.files[0];

        if (logText === '') {
            alert('Please enter a log entry.');
            return;
        }

        const formData = new FormData();
        formData.append('log', logText);
        if (imageFile) {
            formData.append('image', imageFile);
        }

        fetch('/api/logs', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (response.ok) {
                logInput.value = '';
                imageInput.value = '';
                loadLogEntries();
            } else {
                console.error('Failed to save log entry:', response.statusText);
                alert('Failed to save log entry. Please try again.');
            }
        })
        .catch(error => {
            console.error('Error saving log entry:', error);
            alert('Failed to save log entry. Please try again.');
        });
    }

    saveButton.addEventListener('click', saveLogEntry);
});
