import React, { useState, useEffect } from 'react';
import { Search, Play, Folder, Clock, ChevronRight, LayoutGrid, List, Menu, X, PlayCircle, Download, FileText, ChevronLeft, Maximize, FastForward, SkipBack, SkipForward, Volume2, Settings, HardDrive, RefreshCw, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { VideoFile, Topic, FolderInfo, AppConfig } from './types';

// Components
const Navbar = ({ onSearch, onToggleSidebar, onOpenSettings, currentPath }: { onSearch: (q: string) => void, onToggleSidebar: () => void, onOpenSettings: () => void, currentPath?: string | null }) => (
  <nav className="fixed top-0 left-0 right-0 h-16 bg-black/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-6 z-50">
    <div className="flex items-center gap-4">
      <button onClick={onToggleSidebar} className="p-2 hover:bg-white/10 rounded-full lg:hidden">
        <Menu size={24} className="text-white" />
      </button>
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.reload()}>
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <Play size={18} fill="white" className="text-white ml-0.5" />
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight hidden sm:block">Telegram Library</h1>
      </div>
      {currentPath && (
         <div className="hidden md:flex items-center gap-2 ml-4 px-3 py-1 bg-white/5 rounded-full border border-white/10">
            <HardDrive size={14} className="text-blue-500" />
            <span className="text-[10px] font-bold text-white/60 truncate max-w-[200px]">
              {currentPath.split('/').pop()}
            </span>
         </div>
      )}
    </div>
    <div className="flex-1 max-w-2xl px-4">
      <div className="relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-blue-500 transition-colors" size={18} />
        <input 
          type="text" 
          placeholder="Search videos, topics..." 
          className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white/10 transition-all"
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
    </div>
    <div className="flex items-center gap-3">
       <button 
        onClick={onOpenSettings}
        className="p-2.5 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 text-white transition-all hover:scale-105 active:scale-95"
       >
          <Settings size={20} />
       </button>
    </div>
  </nav>
);

const FolderCard: React.FC<{ folder: FolderInfo; onSelect: () => void; isSelected?: boolean }> = ({ folder, onSelect, isSelected }) => (
  <motion.div 
    whileHover={{ y: -4 }}
    onClick={onSelect}
    className={`p-6 cursor-pointer rounded-3xl border transition-all ${isSelected ? 'bg-blue-600/10 border-blue-600 shadow-2xl shadow-blue-500/10' : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'}`}
  >
    <div className="flex items-start justify-between mb-4">
      <div className={`p-4 rounded-2xl ${isSelected ? 'bg-blue-600 text-white' : 'bg-white/5 text-white/40'}`}>
        <Folder size={32} />
      </div>
      <div className="text-right">
        <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest block">Modified</span>
        <span className="text-xs text-white/60 font-medium">{new Date(folder.mtime).toLocaleDateString()}</span>
      </div>
    </div>
    <h3 className="text-lg font-bold text-white mb-2 truncate">{folder.name}</h3>
    <div className="flex items-center gap-4">
      <div className="flex flex-col">
        <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Files</span>
        <span className="text-sm text-white/80 font-mono">{folder.fileCount}</span>
      </div>
      <div className="w-px h-6 bg-white/10" />
      <div className="flex flex-col">
        <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Size</span>
        <span className="text-sm text-white/80 font-mono">{(folder.totalSize / (1024 * 1024)).toFixed(1)} MB</span>
      </div>
    </div>
  </motion.div>
);

const FolderSelection = ({ folders, onSelect, onRescan, loading }: { folders: FolderInfo[], onSelect: (f: FolderInfo) => void, onRescan: () => void, loading: boolean }) => {
  const [q, setQ] = useState('');
  const filtered = folders.filter(f => f.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 selection:bg-blue-600/30 selection:text-blue-400">
      <div className="max-w-5xl w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="text-blue-500 font-bold uppercase tracking-[0.3em] text-xs mb-3 block">Media Library</span>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">Source Selection</h1>
            <p className="text-white/40 mt-3 text-lg">Choose a media batch to begin library scanning.</p>
          </div>
          <button 
            onClick={onRescan}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 disabled:opacity-50 border border-white/10 rounded-2xl text-white font-bold transition-all hover:scale-105 active:scale-95 shadow-xl"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            Scan Directory
          </button>
        </div>

        <div className="relative mb-8">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={20} />
           <input 
            type="text" 
            placeholder="Search batches..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-lg shadow-inner"
            value={q}
            onChange={(e) => setQ(e.target.value)}
           />
        </div>

        {loading && folders.length === 0 ? (
          <div className="py-24 text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <p className="text-white/40 font-mono uppercase tracking-[0.2em] text-xs">Scanning filesystem...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center bg-white/5 rounded-[3rem] border border-white/5 border-dashed">
            <Search size={48} className="mx-auto text-white/5 mb-4" />
            <p className="text-white/20 text-xl font-medium italic">No batches found matching "{q}"</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(f => (
              <FolderCard key={f.path} folder={f} onSelect={() => onSelect(f)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const SettingsView = ({ currentRoot, onClose, onRescan, onChangeSource }: { currentRoot: string | null, onClose: () => void, onRescan: () => void, onChangeSource: () => void }) => (
  <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 sm:p-12">
     <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="absolute inset-0 bg-black/80 backdrop-blur-xl"
     />
     <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      className="relative w-full max-w-xl bg-neutral-900 rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden"
     >
        <div className="p-8 pb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Library Settings</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 pt-0 space-y-6">
           <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
              <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-3 block">Currently Active Source</span>
              <div className="flex items-center gap-3">
                 <div className="p-3 bg-blue-600 rounded-2xl text-white">
                    <Folder size={24} />
                 </div>
                 <div className="flex-1 overflow-hidden">
                    <p className="text-white font-bold truncate text-lg">{currentRoot ? currentRoot.split('/').pop() : 'Not Set'}</p>
                    <p className="text-white/30 text-xs truncate font-mono">{currentRoot || '---'}</p>
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-1 gap-4">
              <button 
                onClick={onRescan}
                className="flex items-center justify-between p-5 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all group"
              >
                <div className="flex items-center gap-4">
                   <RefreshCw className="text-blue-500 group-hover:rotate-180 transition-transform duration-500" />
                   <div className="text-left">
                      <p className="text-white font-bold">Refresh Media Cache</p>
                      <p className="text-white/40 text-xs">Re-scan the current folder for new changes</p>
                   </div>
                </div>
                <ChevronRight className="text-white/20" />
              </button>

              <button 
                onClick={onChangeSource}
                className="flex items-center justify-between p-5 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all group"
              >
                <div className="flex items-center gap-4">
                   <LogOut className="text-red-500" />
                   <div className="text-left">
                      <p className="text-white font-bold">Change Media Source</p>
                      <p className="text-white/40 text-xs">Switch to a different video batch folder</p>
                   </div>
                </div>
                <ChevronRight className="text-white/20" />
              </button>
           </div>
        </div>

        <div className="p-8 bg-black/40 border-t border-white/5 flex items-center justify-center">
           <p className="text-white/20 text-xs font-bold uppercase tracking-widest">Library Version 2.0.4 - Production-Ready</p>
        </div>
     </motion.div>
  </div>
);

const Sidebar = ({ topics, activeTopic, onSelectTopic, isOpen, onClose }: { topics: Topic[], activeTopic: string | null, onSelectTopic: (name: string | null) => void, isOpen: boolean, onClose: () => void }) => (
  <>
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
        />
      )}
    </AnimatePresence>
    <aside className={`fixed top-16 left-0 bottom-0 w-64 bg-black border-r border-white/10 overflow-y-auto z-[70] transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="p-4 space-y-6">
        <div>
          <button 
            onClick={() => { onSelectTopic(null); onClose(); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTopic === null ? 'bg-blue-600 text-white shadow-lg' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
          >
            <LayoutGrid size={20} />
            <span className="font-medium">All Topics</span>
          </button>
        </div>
        
        <div className="space-y-1">
          <h3 className="px-4 text-xs font-bold text-white/30 uppercase tracking-widest mb-2">Categories</h3>
          {topics.length === 0 ? (
             <p className="px-4 text-[10px] text-white/20 italic">No topics found</p>
          ) : topics.map((t) => (
            <button 
              key={t.name}
              onClick={() => { onSelectTopic(t.name); onClose(); }}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all group ${activeTopic === t.name ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <Folder size={18} className={activeTopic === t.name ? 'text-blue-500' : 'text-white/30'} />
                <span className="truncate text-sm font-medium">{t.name}</span>
              </div>
              <span className="text-[10px] font-mono bg-white/5 py-0.5 px-2 rounded-full group-hover:bg-white/10">{t.count}</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  </>
);

const VideoCard: React.FC<{ video: VideoFile; onClick: () => void }> = ({ video, onClick }) => (
  <motion.div 
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -4 }}
    onClick={onClick}
    className="group cursor-pointer bg-white/5 rounded-2xl overflow-hidden border border-white/5 hover:border-white/20 transition-all hover:shadow-2xl hover:shadow-black"
  >
    <div className="relative aspect-video overflow-hidden bg-black/40">
      {video.type === 'video' ? (
        <img 
          src={`/api/thumbnail/${video.id}`} 
          alt={video.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://placehold.co/600x337/111/fff?text=${encodeURIComponent(video.topic)}`;
          }}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-red-900/20 text-red-500">
          <FileText size={48} />
          <span className="mt-2 text-xs font-bold uppercase tracking-widest">PDF Document</span>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <PlayCircle size={48} className="text-white drop-shadow-lg" />
      </div>
      {video.type === 'video' && (
        <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-white border border-white/10 uppercase">
          Video
        </div>
      )}
    </div>
    <div className="p-4">
      <h4 className="text-white font-medium text-sm line-clamp-2 leading-relaxed group-hover:text-blue-400 transition-colors">{video.name}</h4>
      <div className="flex items-center gap-2 mt-2">
        <span className="text-[10px] font-bold text-blue-500/80 uppercase tracking-wider">{video.topic}</span>
        <span className="w-1 h-1 rounded-full bg-white/10" />
        <span className="text-[10px] text-white/40 uppercase font-medium">{(video.size / (1024 * 1024)).toFixed(1)} MB</span>
      </div>
    </div>
  </motion.div>
);

const VideoPlayerPage = ({ video, onBack, onNext, onPrev, relatedPdfs }: { video: VideoFile, onBack: () => void, onNext?: () => void, onPrev?: () => void, relatedPdfs: VideoFile[] }) => {
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(`continue_${video.id}`);
    if (saved && videoRef.current) {
      videoRef.current.currentTime = parseFloat(saved);
    }

    const interval = setInterval(() => {
      if (videoRef.current && !videoRef.current.paused) {
        localStorage.setItem(`continue_${video.id}`, videoRef.current.currentTime.toString());
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [video.id]);

  return (
    <div className="fixed inset-0 bg-black z-[100] overflow-y-auto">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <button onClick={onBack} className="flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors group">
          <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium underline decoration-white/20 underline-offset-4">Back to Library</span>
        </button>

        <div className="aspect-video bg-white/5 rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative shadow-blue-500/5">
          <video 
            ref={videoRef}
            src={`/api/stream/${video.id}`} 
            controls 
            autoPlay 
            className="w-full h-full"
            style={{ playbackRate: playbackSpeed }}
            onEnded={onNext}
          />
        </div>

        <div className="mt-8 flex flex-col md:flex-row justify-between items-start gap-6">
          <div className="flex-1 overflow-hidden">
            <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight break-words">{video.name}</h1>
            <div className="flex flex-wrap items-center gap-4 mt-4">
               <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                  <Folder size={18} className="text-blue-500" />
                  <span className="text-sm font-medium text-white/80">{video.topic}</span>
               </div>
               <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                  <Clock size={18} className="text-white/40" />
                  <span className="text-sm font-medium text-white/80">{new Date(video.mtime).toLocaleDateString()}</span>
               </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
              {[0.5, 1, 1.25, 1.5, 2].map(s => (
                <button 
                  key={s} 
                  onClick={() => setPlaybackSpeed(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${playbackSpeed === s ? 'bg-blue-600 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
                >
                  {s}x
                </button>
              ))}
            </div>
            <div className="flex gap-2">
               <button onClick={onPrev} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-white transition-colors">
                  <SkipBack size={20} />
               </button>
               <button onClick={onNext} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-white transition-colors">
                  <SkipForward size={20} />
               </button>
            </div>
          </div>
        </div>

        {relatedPdfs.length > 0 && (
          <div className="mt-12">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <FileText size={20} className="text-red-500" />
              Related Documents
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {relatedPdfs.map(pdf => (
                <div key={pdf.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 group hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="p-2 bg-red-500/20 text-red-500 rounded-lg">
                      <FileText size={20} />
                    </div>
                    <span className="text-sm font-medium text-white/80 truncate">{pdf.name}</span>
                  </div>
                  <a href={`/api/pdf/${pdf.id}`} target="_blank" className="p-2 text-white/40 hover:text-white transition-colors">
                    <Download size={20} />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function App() {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [folders, setFolders] = useState<FolderInfo[]>([]);
  const [videos, setVideos] = useState<VideoFile[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoFile | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    initApp();
  }, []);

  const initApp = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/config');
      const cfg = await res.json();
      setConfig(cfg);
      
      if (cfg.mediaRoot) {
        await fetchData();
      } else {
        await fetchFolders();
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchFolders = async () => {
    setScanning(true);
    try {
      const res = await fetch('/api/folders');
      setFolders(await res.json());
    } finally {
      setScanning(false);
    }
  };

  const fetchData = async () => {
    try {
      const [vRes, tRes] = await Promise.all([
        fetch('/api/videos'),
        fetch('/api/topics')
      ]);
      setVideos(await vRes.json());
      setTopics(await tRes.json());
    } catch (err) {
      console.error('Failed to load media', err);
    }
  };

  const handleSelectFolder = async (folder: FolderInfo) => {
    setScanning(true);
    try {
      const res = await fetch('/api/select-folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder: folder.name })
      });
      const data = await res.json();
      if (data.success) {
        setConfig({ mediaRoot: data.mediaRoot });
        await fetchData();
      }
    } finally {
      setScanning(false);
    }
  };

  const handleRescanCache = async () => {
    setScanning(true);
    try {
      await fetch('/api/rescan', { method: 'POST' });
      await fetchData();
      setIsSettingsOpen(false);
    } finally {
      setScanning(false);
    }
  };

  const currentVideos = videos.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          v.topic.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTopic = !activeTopic || v.topic === activeTopic;
    return matchesSearch && matchesTopic;
  });

  const recentVideos = videos.filter(v => v.type === 'video').slice(0, 8);

  const handleNext = () => {
    if (!selectedVideo) return;
    const currentIndex = currentVideos.findIndex(v => v.id === selectedVideo.id);
    const nextVideo = currentVideos.find((v, i) => i > currentIndex && v.type === 'video');
    if (nextVideo) setSelectedVideo(nextVideo);
  };

  const handlePrev = () => {
    if (!selectedVideo) return;
    const currentIndex = currentVideos.findIndex(v => v.id === selectedVideo.id);
    const prevVideo = [...currentVideos].reverse().find((v, i) => (currentVideos.length - 1 - i) < currentIndex && v.type === 'video');
    if (prevVideo) setSelectedVideo(prevVideo);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/40 font-mono text-sm tracking-widest uppercase animate-pulse">Loading Platform...</p>
        </div>
      </div>
    );
  }

  if (!config?.mediaRoot) {
    return (
      <FolderSelection 
        folders={folders} 
        onSelect={handleSelectFolder} 
        onRescan={fetchFolders} 
        loading={scanning} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-600/30 selection:text-blue-400">
      <Navbar 
        onSearch={setSearchTerm} 
        onToggleSidebar={() => setIsSidebarOpen(true)} 
        onOpenSettings={() => setIsSettingsOpen(true)}
        currentPath={config.mediaRoot}
      />
      
      <Sidebar 
        topics={topics} 
        activeTopic={activeTopic} 
        onSelectTopic={setActiveTopic} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      <main className={`pt-24 lg:pl-64 px-6 pb-12 transition-all`}>
        {/* Recent Section */}
        {!activeTopic && !searchTerm && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Clock size={24} className="text-blue-500" />
              Recent Media
            </h2>
            {recentVideos.length === 0 ? (
               <div className="p-8 bg-white/5 border border-dashed border-white/10 rounded-3xl text-center">
                  <p className="text-white/20">No videos found yet in this directory.</p>
               </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {recentVideos.map(v => (
                  <VideoCard key={v.id} video={v} onClick={() => setSelectedVideo(v)} />
                ))}
              </div>
            )}
          </section>
        )}

        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Folder size={24} className="text-blue-500" />
              {activeTopic || (searchTerm ? `Results: ${searchTerm}` : 'Full Library')}
            </h2>
            <span className="text-xs font-mono text-white/30 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/10">
              {currentVideos.length} items
            </span>
          </div>

          {currentVideos.length === 0 ? (
            <div className="py-24 text-center bg-white/5 rounded-[2.5rem] border border-white/5">
              <Search size={48} className="mx-auto text-white/5 mb-4" />
              <p className="text-white/40">No media matches your filter/search</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentVideos.map(v => (
                <VideoCard key={v.id} video={v} onClick={() => v.type === 'video' ? setSelectedVideo(v) : window.open(`/api/pdf/${v.id}`, '_blank')} />
              ))}
            </div>
          )}
        </section>
      </main>

      <AnimatePresence>
        {selectedVideo && (
          <VideoPlayerPage 
            video={selectedVideo} 
            onBack={() => setSelectedVideo(null)} 
            onNext={handleNext}
            onPrev={handlePrev}
            relatedPdfs={videos.filter(v => v.type === 'pdf' && v.topic === selectedVideo.topic)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSettingsOpen && (
          <SettingsView 
            currentRoot={config.mediaRoot}
            onClose={() => setIsSettingsOpen(false)}
            onRescan={handleRescanCache}
            onChangeSource={() => {
              setConfig({ mediaRoot: null });
              setIsSettingsOpen(false);
              fetchFolders();
            }}
          />
        )}
      </AnimatePresence>

      <footer className="lg:pl-64 py-12 px-6 border-t border-white/5 text-center">
        <p className="text-white/10 text-xs font-bold uppercase tracking-widest">Archive Management System &copy; 2026</p>
      </footer>
    </div>
  );
}
