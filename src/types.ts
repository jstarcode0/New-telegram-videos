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

export interface FolderInfo {
  name: string;
  path: string;
  videoCount: number;
  pdfCount: number;
  totalSize: number;
  mtime: number;
}

export interface AppConfig {
  mediaRoot: string | null;
}
