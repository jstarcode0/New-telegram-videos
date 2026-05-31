import fs from 'fs';
import path from 'path';
import fg from 'fast-glob';
import NodeCache from 'node-cache';
import crypto from 'crypto';

const cache = new NodeCache({ stdTTL: 300 }); // 5 minutes cache

export function clearCache() {
  cache.flushAll();
}

export async function listFolders(parentPath: string): Promise<any[]> {
  if (!fs.existsSync(parentPath)) return [];
  
  const folders = fs.readdirSync(parentPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  const results = [];
  for (const folder of folders) {
    const fullPath = path.join(parentPath, folder);
    if (!fs.existsSync(fullPath)) continue;
    const stats = fs.statSync(fullPath);
    
    const files = await fg(['**/*.{mp4,mkv,avi,pdf}'], {
      cwd: fullPath,
      stats: true,
    });

    const videoCount = files.filter(f => !f.path.endsWith('.pdf')).length;
    const pdfCount = files.filter(f => f.path.endsWith('.pdf')).length;
    const totalSize = files.reduce((acc, f) => acc + (f.stats?.size || 0), 0);

    results.push({
      name: folder,
      path: folder,
      videoCount,
      pdfCount,
      totalSize,
      mtime: stats.mtime.getTime(),
    });
  }
  
  return results.sort((a, b) => b.mtime - a.mtime);
}

export interface VideoFile {
  id: string;
  numericId: number | null;
  name: string;
  path: string;
  ext: string;
  topic: string;
  size: number;
  type: 'video' | 'pdf';
  mtime: number;
}

export interface Topic {
  name: string;
  count: number;
  videos: VideoFile[];
}

export function generateId(filePath: string): string {
  return crypto.createHash('md5').update(filePath).digest('hex');
}

export async function scanFiles(basePath: string): Promise<VideoFile[]> {
  const cacheKey = `videos_${basePath}`;
  const cached = cache.get<VideoFile[]>(cacheKey);
  if (cached) return cached;

  // Use a fallback path if the target doesn't exist (for dev)
  const resolvedPath = fs.existsSync(basePath) ? basePath : './videos';
  if (!fs.existsSync(resolvedPath)) {
    fs.mkdirSync(resolvedPath, { recursive: true });
  }

  console.log(`[Scanner] Starting recursive scan in: ${resolvedPath}`);

  const entries = await fg(['**/*.{mp4,mkv,avi,pdf}'], {
    cwd: resolvedPath,
    stats: true,
    absolute: true,
  });

  const files: VideoFile[] = entries.map((entry) => {
    const fileName = path.basename(entry.path);
    const fileNameNoExt = fileName.replace(/\.[^/.]+$/, "");
    const ext = path.extname(entry.path).toLowerCase();
    const relativePath = path.relative(resolvedPath, entry.path);
    const pathParts = relativePath.split(path.sep);
    
    // Topic Detection:
    // 1. If deep in folders, use the immediate parent
    // 2. Otherwise extract from filename
    let topic = 'General';
    
    if (pathParts.length > 1) {
       topic = pathParts[pathParts.length - 2];
    } else {
       // Clean filename topic extraction
       // "01517 - Determiners-01.mp4" -> split by '-'
       if (fileName.includes(' - ')) {
         topic = fileName.split(' - ')[0].trim();
       } else if (fileName.includes('-')) {
         topic = fileName.split('-')[0].trim();
       } else {
         topic = fileName.split(/[ \d]/)[0] || 'General';
       }
    }

    // Clean Topic: Remove leading numbers like 01668
    topic = topic.replace(/^\d+[\s\-_]*/, '').trim();
    if (!topic || /^\d+$/.test(topic)) {
       topic = 'General';
    }

    // Special mapping based on keywords if topic is too generic
    if (topic.toLowerCase() === 'general' || topic.length < 3) {
      if (fileName.toLowerCase().includes('grammar')) topic = 'Grammar';
      else if (fileName.toLowerCase().includes('phonetic')) topic = 'Phonetics';
      else if (fileName.toLowerCase().includes('literary')) topic = 'Literary Forms';
      else if (fileName.toLowerCase().includes('mmc')) topic = 'MMC';
    }

    // Capitalize properly
    topic = topic.charAt(0).toUpperCase() + topic.slice(1);

    const numericIdMatch = fileName.match(/^(\d+)/);
    const numericId = numericIdMatch ? parseInt(numericIdMatch[1], 10) : null;

    return {
      id: generateId(entry.path),
      numericId,
      name: fileNameNoExt,
      path: entry.path,
      ext,
      topic,
      size: entry.stats?.size || 0,
      type: ext === '.pdf' ? 'pdf' : 'video',
      mtime: entry.stats?.mtime.getTime() || Date.now(),
    };
  });

  const videoCount = files.filter(f => f.type === 'video').length;
  const pdfCount = files.filter(f => f.type === 'pdf').length;

  console.log(`[Scanner] Found ${videoCount} videos`);
  console.log(`[Scanner] Found ${pdfCount} PDFs`);
  console.log(`[Scanner] Scan complete. Total items: ${files.length}`);

  // Sort by mtime descending (recent first)
  files.sort((a, b) => b.mtime - a.mtime);

  cache.set(cacheKey, files);
  return files;
}

export async function getTopics(basePath: string): Promise<Topic[]> {
  const videos = await scanFiles(basePath);
  const topicMap = new Map<string, Topic>();

  videos.forEach((v) => {
    if (!topicMap.has(v.topic)) {
      topicMap.set(v.topic, { name: v.topic, count: 0, videos: [] });
    }
    const topic = topicMap.get(v.topic)!;
    topic.count++;
    topic.videos.push(v);
  });

  return Array.from(topicMap.values()).sort((a, b) => b.count - a.count);
}
