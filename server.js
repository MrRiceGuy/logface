const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;

const upload = multer({ dest: 'uploads/' });

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const LOG_FILE_PATH = path.join(__dirname, 'log.json');

app.post('/api/logs', upload.single('image'), (req, res) => {
    const { log } = req.body;
    if (!log) {
        return res.status(400).json({ error: 'Log entry is required.' });
    }

    fs.readFile(LOG_FILE_PATH, 'utf8', (err, data) => {
        if (err && err.code !== 'ENOENT') {
            console.error('Error reading log file:', err);
            return res.status(500).json({ error: 'Failed to read log file.' });
        }

        let logEntries = [];
        if (data) {
            try {
                logEntries = JSON.parse(data);
            } catch (parseError) {
                console.error('Error parsing log file:', parseError);
                return res.status(500).json({ error: 'Failed to parse log file.' });
            }
        }

        const newEntry = {
            timestamp: new Date().toISOString(),
            log: log,
            image: ''
        };

        if (req.file) {
            newEntry.image = `/uploads/${req.file.filename}`;
        }

        logEntries.push(newEntry);

        fs.writeFile(LOG_FILE_PATH, JSON.stringify(logEntries, null, 2), (writeErr) => {
            if (writeErr) {
                console.error('Error writing to log file:', writeErr);
                return res.status(500).json({ error: 'Failed to save log entry.' });
            }
            res.status(201).json({ message: 'Log entry saved successfully.' });
        });
    });
});

app.get('/api/logs', (req, res) => {
    fs.readFile(LOG_FILE_PATH, 'utf8', (err, data) => {
        if (err && err.code !== 'ENOENT') {
            console.error('Error reading log file:', err);
            return res.status(500).json({ error: 'Failed to read log file.' });
        }

        let logEntries = [];
        if (data) {
            try {
                logEntries = JSON.parse(data);
            } catch (parseError) {
                console.error('Error parsing log file:', parseError);
                return res.status(500).json({ error: 'Failed to parse log file.' });
            }
        }

        res.json({ logs: logEntries });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
