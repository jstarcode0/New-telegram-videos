import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';

const THUMB_DIR = process.env.THUMBNAIL_PATH || './thumbnails';

if (!fs.existsSync(THUMB_DIR)) {
  fs.mkdirSync(THUMB_DIR, { recursive: true });
}

export async function getThumbnail(videoId: string, videoPath: string): Promise<string> {
  const thumbPath = path.join(THUMB_DIR, `${videoId}.jpg`);

  if (fs.existsSync(thumbPath)) {
    return thumbPath;
  }

  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .on('end', () => resolve(thumbPath))
      .on('error', (err) => {
        console.error('FFmpeg error:', err);
        // Return a placeholder or the same error
        reject(err);
      })
      .screenshots({
        count: 1,
        folder: THUMB_DIR,
        filename: `${videoId}.jpg`,
        size: '320x180',
      });
  });
}
