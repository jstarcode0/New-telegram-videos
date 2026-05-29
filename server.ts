import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { scanFiles, getTopics, VideoFile } from './server/scanner.ts';
import { getThumbnail } from './server/thumbnails.ts';
import dotenv from 'dotenv';
import mime from 'mime-types';

dotenv.config();

const app = express();
const PORT = 3000;
const VIDEO_PATH = process.env.VIDEO_STORAGE_PATH || './videos';
const THUMB_PATH = path.resolve(process.env.THUMBNAIL_PATH || './thumbnails');

async function startServer() {
  // Ensure paths exist
  if (!fs.existsSync(VIDEO_PATH)) fs.mkdirSync(VIDEO_PATH, { recursive: true });
  if (!fs.existsSync(THUMB_PATH)) fs.mkdirSync(THUMB_PATH, { recursive: true });

  // API Routes
  app.get('/api/videos', async (req, res) => {
    try {
      const videos = await scanFiles(VIDEO_PATH);
      res.json(videos);
    } catch (err) {
      res.status(500).json({ error: 'Failed to scan videos' });
    }
  });

  app.get('/api/topics', async (req, res) => {
    try {
      const topics = await getTopics(VIDEO_PATH);
      res.json(topics);
    } catch (err) {
      res.status(500).json({ error: 'Failed to get topics' });
    }
  });

  app.get('/api/search', async (req, res) => {
    const q = (req.query.q as string || '').toLowerCase();
    try {
      const videos = await scanFiles(VIDEO_PATH);
      const filtered = videos.filter(v => 
        v.name.toLowerCase().includes(q) || 
        v.topic.toLowerCase().includes(q)
      );
      res.json(filtered);
    } catch (err) {
      res.status(500).json({ error: 'Search failed' });
    }
  });

  app.get('/api/video/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const videos = await scanFiles(VIDEO_PATH);
      const video = videos.find(v => v.id === id);
      if (!video) return res.status(404).json({ error: 'Video not found' });
      res.json(video);
    } catch (err) {
      res.status(500).json({ error: 'Failed to get video' });
    }
  });

  // Thumbnail Route
  app.get('/api/thumbnail/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const videos = await scanFiles(VIDEO_PATH);
      const video = videos.find(v => v.id === id);
      if (!video || video.type !== 'video') {
        return res.status(404).send('Not found');
      }
      
      const thumbPath = await getThumbnail(id, video.path);
      res.sendFile(path.resolve(thumbPath));
    } catch (err) {
      res.status(404).send('Not found');
    }
  });

  // Streaming Route
  app.get('/api/stream/:id', async (req, res) => {
    const { id } = req.params;
    const videos = await scanFiles(VIDEO_PATH);
    const video = videos.find(v => v.id === id);

    if (!video) return res.status(404).send('Video not found');

    const filePath = video.path;
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(filePath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': mime.lookup(video.ext) || 'video/mp4',
      };
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': mime.lookup(video.ext) || 'video/mp4',
      };
      res.writeHead(200, head);
      fs.createReadStream(filePath).pipe(res);
    }
  });

  // PDF Route
  app.get('/api/pdf/:id', async (req, res) => {
    const { id } = req.params;
    const videos = await scanFiles(VIDEO_PATH);
    const file = videos.find(v => v.id === id);

    if (!file || file.type !== 'pdf') return res.status(404).send('PDF not found');

    res.contentType('application/pdf');
    fs.createReadStream(file.path).pipe(res);
  });

  // Vite Integrations
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile(path.join(process.cwd(), 'dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
