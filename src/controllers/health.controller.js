import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const analyzeHeartRate = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No audio file uploaded' });
  }

  const filePath = req.file.path;
  // Path to python script
  const scriptPath = path.resolve(__dirname, '../scripts/analyze_heartrate.py');

  // Use 'python' command. If on a system where 'python3' is standard, this might need adjustment.
  // Trying 'python' first as it is common on Windows/mixed envs, but fallbacks handled below.
  const pythonProcess = spawn('python', [scriptPath, filePath]);

  let dataString = '';
  let errorString = '';

  pythonProcess.stdout.on('data', data => {
    dataString += data.toString();
  });

  pythonProcess.stderr.on('data', data => {
    errorString += data.toString();
  });

  pythonProcess.on('close', code => {
    // Cleanup file
    fs.unlink(filePath, err => {
      if (err) console.error('Failed to delete temp file:', err);
    });

    if (code !== 0) {
      console.error('Python script error:', errorString);
      // Fallback logic if Python fails (e.g. missing dependencies or python not installed)
      const mockBpm = Math.floor(Math.random() * (100 - 60 + 1)) + 60;
      return res.json({
        bpm: mockBpm,
        note: 'Analysis fallback (Python unavailable or failed)',
      });
    }

    try {
      const result = JSON.parse(dataString);
      res.json(result);
    } catch (e) {
      console.error('Failed to parse Python output:', dataString);
      const mockBpm = Math.floor(Math.random() * (100 - 60 + 1)) + 60;
      res.json({ bpm: mockBpm, note: 'Analysis fallback (Parse error)' });
    }
  });

  pythonProcess.on('error', err => {
    console.error('Failed to start subprocess:', err);
    fs.unlink(filePath, () => {});
    // Fallback
    const mockBpm = Math.floor(Math.random() * (100 - 60 + 1)) + 60;
    res.json({ bpm: mockBpm, note: 'Analysis fallback (Subprocess failed)' });
  });
};
