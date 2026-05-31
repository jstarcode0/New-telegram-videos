import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { scanFiles, getTopics, VideoFile, listFolders, clearCache } from './server/scanner.ts';
import { getThumbnail } from './server/thumbnails.ts';
import { getConfig, saveConfig } from './server/config.ts';
import dotenv from 'dotenv';
import mime from 'mime-types';

dotenv.config();

const app = express();
app.use(express.json()); // Essential for POST requests
const PORT = 3000;
const DOWNLOADS_ROOT = path.join(process.cwd(), 'telegram_downloads');
const THUMB_PATH = path.resolve(process.env.THUMBNAIL_PATH || path.join(process.cwd(), 'thumbnails'));

function getResolvedVideoPath() {
  const config = getConfig();
  if (config.mediaRoot) {
    return config.mediaRoot;
  }
  return process.env.VIDEO_STORAGE_PATH || DOWNLOADS_ROOT;
}

async function startServer() {
  console.log(`[Storage] Base Downloads Path: ${DOWNLOADS_ROOT}`);
  
  // Ensure paths exist
  if (!fs.existsSync(DOWNLOADS_ROOT)) fs.mkdirSync(DOWNLOADS_ROOT, { recursive: true });
  if (!fs.existsSync(THUMB_PATH)) fs.mkdirSync(THUMB_PATH, { recursive: true });

  // Config & Folder Selection API
  app.get('/api/config', (req, res) => {
    res.json(getConfig());
  });

  app.get('/api/folders', async (req, res) => {
    try {
      const folders = await listFolders(DOWNLOADS_ROOT);
      res.json(folders);
    } catch (err) {
      res.status(500).json({ error: 'Failed to list folders' });
    }
  });

  app.post('/api/select-folder', async (req, res) => {
    const { folder } = req.body;
    if (!folder) return res.status(400).json({ error: 'Folder name required' });

    // Security check: ensure folder is directly under DOWNLOADS_ROOT
    const targetPath = path.join(DOWNLOADS_ROOT, folder);
    const resolvedTargetPath = path.resolve(targetPath);
    const resolvedBase = path.resolve(DOWNLOADS_ROOT);

    if (!resolvedTargetPath.startsWith(resolvedBase)) {
      return res.status(403).json({ error: 'Path traversal forbidden' });
    }

    if (!fs.existsSync(resolvedTargetPath) || !fs.statSync(resolvedTargetPath).isDirectory()) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    // Save configuration
    saveConfig({ mediaRoot: resolvedTargetPath });
    clearCache();
    
    console.log(`[Config] Selected Media Folder: ${resolvedTargetPath}`);
    res.json({ success: true, mediaRoot: resolvedTargetPath });
  });

  app.post('/api/rescan', (req, res) => {
    clearCache();
    res.json({ success: true });
  });

  // API Routes - using dynamic path
  app.get('/api/videos', async (req, res) => {
    const path = getResolvedVideoPath();
    try {
      const videos = await scanFiles(path);
      res.json(videos);
    } catch (err) {
      res.status(500).json({ error: 'Failed to scan videos' });
    }
  });

  app.get('/api/topics', async (req, res) => {
    const path = getResolvedVideoPath();
    try {
      const topics = await getTopics(path);
      res.json(topics);
    } catch (err) {
      res.status(500).json({ error: 'Failed to get topics' });
    }
  });

  app.get('/api/search', async (req, res) => {
    const path = getResolvedVideoPath();
    const q = (req.query.q as string || '').toLowerCase();
    try {
      const videos = await scanFiles(path);
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
    const path = getResolvedVideoPath();
    const { id } = req.params;
    try {
      const videos = await scanFiles(path);
      const video = videos.find(v => v.id === id);
      if (!video) return res.status(404).json({ error: 'Video not found' });
      res.json(video);
    } catch (err) {
      res.status(500).json({ error: 'Failed to get video' });
    }
  });

  // Thumbnail Route
  app.get('/api/thumbnail/:id', async (req, res) => {
    const path = getResolvedVideoPath();
    const { id } = req.params;
    try {
      const videos = await scanFiles(path);
      const video = videos.find(v => v.id === id);
      if (!video || video.type !== 'video') {
        return res.status(404).send('Not found');
      }
      
      console.log(`[Thumbnails] Generating/Fetching: ${video.name}`);
      const thumbPath = await getThumbnail(id, video.path);
      res.sendFile(thumbPath);
    } catch (err) {
      res.status(404).send('Not found');
    }
  });

  // Streaming Route
  app.get('/api/stream/:id', async (req, res) => {
    const p = getResolvedVideoPath();
    const { id } = req.params;
    const videos = await scanFiles(p);
    const video = videos.find(v => v.id === id);

    if (!video) return res.status(404).send('Video not found');

    const filePath = video.path;
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    console.log(`[Streaming] Serving: ${video.name} | Range: ${range || 'Full'}`);

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
        'Cache-Control': 'no-cache',
      };
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': mime.lookup(video.ext) || 'video/mp4',
        'Accept-Ranges': 'bytes',
      };
      res.writeHead(200, head);
      fs.createReadStream(filePath).pipe(res);
    }
  });

  // PDF Route
  app.get('/api/pdf/:id', async (req, res) => {
    const path = getResolvedVideoPath();
    const { id } = req.params;
    const videos = await scanFiles(path);
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
