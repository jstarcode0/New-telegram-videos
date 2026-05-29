import fs from 'fs';
import path from 'path';
import fg from 'fast-glob';
import NodeCache from 'node-cache';
import crypto from 'crypto';

const cache = new NodeCache({ stdTTL: 300 }); // 5 minutes cache

export interface VideoFile {
  id: string;
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
  const cached = cache.get<VideoFile[]>('videos');
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
    const ext = path.extname(entry.path).toLowerCase();
    const relativePath = path.relative(resolvedPath, entry.path);
    const pathParts = relativePath.split(path.sep);
    
    // Topic Detection:
    // 1. Use the immediate parent folder name if it's not the root
    // 2. Otherwise extract from filename
    let topic = 'General';
    
    if (pathParts.length > 1) {
       // Root/FolderA/File.mp4 -> FolderA
       // Root/FolderA/SubFolder/File.mp4 -> SubFolder
       topic = pathParts[pathParts.length - 2];
    } else {
       // Try extracting from name like before
       if (fileName.includes(' - ')) {
         topic = fileName.split(' - ')[0].trim();
       } else {
         const firstWord = fileName.split(/[ \d]/)[0];
         if (firstWord && firstWord.length > 2) {
           topic = firstWord;
         }
       }
    }

    return {
      id: generateId(entry.path),
      name: fileName,
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

  cache.set('videos', files);
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
