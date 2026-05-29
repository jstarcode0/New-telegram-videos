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

export interface FolderInfo {
  name: string;
  path: string;
  fileCount: number;
  totalSize: number;
  mtime: number;
}

export interface AppConfig {
  mediaRoot: string | null;
}
