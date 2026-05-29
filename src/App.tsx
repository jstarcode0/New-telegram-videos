import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, Play, Folder, Clock, ChevronRight, LayoutGrid, List, Menu, X, 
  PlayCircle, Download, FileText, ChevronLeft, Maximize, FastForward, 
  SkipBack, SkipForward, Volume2, Settings, HardDrive, RefreshCw, 
  LogOut, Activity, BarChart2, Info, Monitor, MousePointer, Keyboard
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { VideoFile, Topic, FolderInfo, AppConfig } from './types.ts';

// --- Components ---

const HighlightingText = ({ text, highlight }: { text: string, highlight: string }) => {
  if (!highlight.trim()) return <span>{text}</span>;
  const regex = new RegExp(`(${highlight})`, 'gi');
  const parts = text.split(regex);
  return (
    <span>
      {parts.map((part, i) => 
        part.toLowerCase() === highlight.toLowerCase() ? 
          <mark key={i} className="bg-blue-500/30 text-blue-400 px-0.5 rounded transition-all">{part}</mark> : 
          part
      )}
    </span>
  );
};

const Navbar = ({ onSearch, onToggleSidebar, onOpenSettings, currentPath }: { onSearch: (q: string) => void, onToggleSidebar: () => void, onOpenSettings: () => void, currentPath?: string | null }) => (
  <nav className="fixed top-0 left-0 right-0 h-16 bg-black/80 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-6 z-50 shadow-2xl">
    <div className="flex items-center gap-4">
      <button onClick={onToggleSidebar} className="p-2 hover:bg-white/10 rounded-xl lg:hidden transition-colors">
        <Menu size={24} className="text-white" />
      </button>
      <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.location.href = '/'}>
        <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/20">
          <Play size={20} fill="white" className="text-white ml-0.5" />
        </div>
        <div className="flex flex-col">
           <h1 className="text-lg font-black text-white tracking-tighter leading-none">TELEGRAM</h1>
           <span className="text-[10px] font-bold text-white/40 tracking-[0.2em] leading-none mt-0.5 uppercase">Video Archive</span>
        </div>
      </div>
      {currentPath && (
         <div className="hidden lg:flex items-center gap-2 ml-6 px-4 py-1.5 bg-white/5 rounded-full border border-white/10 max-w-xs transition-opacity hover:opacity-100 opacity-60">
            <HardDrive size={14} className="text-blue-500 shrink-0" />
            <span className="text-[10px] font-bold text-white uppercase truncate">
              {currentPath.split('/').pop()}
            </span>
         </div>
      )}
    </div>
    
    <div className="flex-1 max-w-2xl mx-8 hidden sm:block">
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-blue-500 transition-colors" size={18} />
        <input 
          type="text" 
          placeholder="Quick search titles, topics..." 
          className="w-full bg-white/5 border border-white/10 rounded-2xl py-2.5 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white/10 transition-all font-medium text-sm"
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
    </div>

    <div className="flex items-center gap-2">
       <button 
        onClick={onOpenSettings}
        className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-white transition-all hover:scale-105 active:scale-95 group"
       >
          <Settings size={20} className="group-hover:rotate-45 transition-transform" />
       </button>
    </div>
  </nav>
);

const FolderCard: React.FC<{ folder: FolderInfo; onSelect: () => void; isSelected?: boolean }> = ({ folder, onSelect, isSelected }) => (
  <motion.div 
    whileHover={{ y: -6, scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onSelect}
    className={`p-6 cursor-pointer rounded-[2rem] border transition-all relative overflow-hidden group ${isSelected ? 'bg-blue-600/10 border-blue-600' : 'bg-[#0f0f0f] border-white/5 hover:border-white/20'}`}
  >
    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
       <Folder size={80} />
    </div>
    <div className="flex items-center justify-between mb-8 relative z-10">
      <div className={`p-4 rounded-2xl ${isSelected ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-white/5 text-white/40'}`}>
        <Folder size={28} />
      </div>
      <div className="text-right">
        <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] block mb-1">Last Scan</span>
        <span className="text-xs text-white/50 font-mono">{new Date(folder.mtime).toLocaleDateString()}</span>
      </div>
    </div>
    <h3 className="text-xl font-bold text-white mb-2 truncate group-hover:text-blue-400 transition-colors">{folder.name}</h3>
    <div className="grid grid-cols-2 gap-4 mt-6 relative z-10">
      <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
        <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest block mb-1">Videos</span>
        <span className="text-sm text-white font-mono font-bold">{folder.videoCount}</span>
      </div>
      <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
        <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest block mb-1">PDFs</span>
        <span className="text-sm text-white font-mono font-bold">{folder.pdfCount}</span>
      </div>
      <div className="p-3 bg-white/5 rounded-2xl border border-white/5 col-span-2">
        <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest block mb-1">Total Payload</span>
        <span className="text-sm text-white font-mono font-bold">{(folder.totalSize / (1024 * 1024 * 1024)).toFixed(2)} GB</span>
      </div>
    </div>
  </motion.div>
);

const FolderSelection = ({ folders, onSelect, onRescan, loading }: { folders: FolderInfo[], onSelect: (f: FolderInfo) => void, onRescan: () => void, loading: boolean }) => {
  const [q, setQ] = useState('');
  const filtered = folders.filter(f => f.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 selection:bg-blue-500/30 selection:text-blue-400">
      <div className="max-w-6xl w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-500 rounded-full border border-blue-500/20">
               <Monitor size={14} />
               <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Deployment Host v2.0</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-[0.9]">Select<br />Media Batch</h1>
            <p className="text-white/40 text-lg md:text-xl max-w-lg font-medium leading-relaxed italic">Discovery mode active. Please identify the archive root for indexing.</p>
          </div>
          <button 
            onClick={onRescan}
            disabled={loading}
            className="group flex items-center gap-3 px-8 py-4 bg-white/5 hover:bg-white/10 disabled:opacity-50 border border-white/10 rounded-3xl text-white font-bold transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-blue-500/5"
          >
            <RefreshCw size={22} className={loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'} />
            <span className="tracking-tight">Reload Local Tree</span>
          </button>
        </div>

        <div className="relative mb-12 shadow-2xl">
           <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-blue-500" size={24} />
           <input 
            type="text" 
            placeholder="Search discovered folders..."
            className="w-full bg-[#0a0a0a] border border-white/5 rounded-3xl py-6 pl-16 pr-6 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-xl shadow-inner placeholder:text-white/10"
            value={q}
            onChange={(e) => setQ(e.target.value)}
           />
        </div>

        {loading && folders.length === 0 ? (
          <div className="py-32 text-center">
            <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity }}>
               <HardDrive size={64} className="mx-auto text-blue-500 mb-6" />
            </motion.div>
            <p className="text-white font-mono uppercase tracking-[0.4em] text-[10px] font-black">Indexing Local Storage Systems...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-32 text-center bg-white/2 rounded-[4rem] border border-white/5 border-dashed">
            <Search size={64} className="mx-auto text-white/5 mb-6" />
            <p className="text-white/10 text-2xl font-black tracking-widest uppercase">No Archives Detected</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pb-32">
            {filtered.map(f => (
              <FolderCard key={f.path} folder={f} onSelect={() => onSelect(f)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const VideoCard: React.FC<{ video: VideoFile; onClick: () => void; highlight: string }> = ({ video, onClick, highlight }) => (
  <motion.div 
    layout
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -8, scale: 1.02 }}
    onClick={onClick}
    className="group cursor-pointer bg-[#0f0f0f] rounded-3xl overflow-hidden border border-white/5 hover:border-blue-500/40 transition-all hover:shadow-2xl hover:shadow-black/60 active:scale-[0.98]"
  >
    <div className="relative aspect-video overflow-hidden bg-black/40">
      {video.type === 'video' ? (
        <img 
          src={`/api/thumbnail/${video.id}`} 
          alt={video.name} 
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://placehold.co/600x337/000/333?text=${encodeURIComponent(video.topic)}`;
          }}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-red-900/10 text-red-500/40 group-hover:text-red-500 transition-colors">
          <FileText size={48} className="group-hover:scale-110 transition-transform" />
          <span className="mt-3 text-[10px] font-black uppercase tracking-[0.3em]">Document</span>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />
      
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100">
        <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-2xl">
           <Play fill="white" size={28} className="text-white ml-1" />
        </div>
      </div>

      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
         <span className="px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-black text-white border border-white/10 uppercase tracking-widest translate-y-8 group-hover:translate-y-0 transition-transform duration-300">
           {video.ext.replace('.', '')}
         </span>
         {video.type === 'video' && (
           <span className="text-[10px] text-white/60 font-mono bg-black/40 px-2 py-0.5 rounded-md backdrop-blur-sm">HD Archive</span>
         )}
      </div>
    </div>
    <div className="p-4 md:p-6 min-w-0">
      <h4 className="text-white font-bold text-xs md:text-sm line-clamp-2 leading-relaxed min-h-[2.4rem] md:min-h-[2.8rem] group-hover:text-blue-400 transition-colors break-words overflow-hidden">
        <HighlightingText text={video.name} highlight={highlight} />
      </h4>
      <div className="flex items-center justify-between mt-4 border-t border-white/5 pt-4">
        <div className="flex items-center gap-2">
           <div className="w-1.5 h-1.5 rounded-full bg-blue-500 group-hover:animate-pulse" />
           <span className="text-[10px] font-black text-white/40 uppercase tracking-widest group-hover:text-blue-500 transition-colors">
             <HighlightingText text={video.topic} highlight={highlight} />
           </span>
        </div>
        <span className="text-[10px] font-mono text-white/20 uppercase">{(video.size / (1024 * 1024)).toFixed(1)} MB</span>
      </div>
    </div>
  </motion.div>
);

const VideoPlayerPage = ({ 
  video, 
  allVideos,
  onBack, 
  onNext, 
  onPrev, 
  relatedPdfs 
}: { 
  video: VideoFile, 
  allVideos: VideoFile[],
  onBack: () => void, 
  onNext?: () => void, 
  onPrev?: () => void, 
  relatedPdfs: VideoFile[] 
}) => {
  const [playbackSpeed, setPlaybackSpeed] = useState(() => parseFloat(localStorage.getItem('pref_speed') || '1'));
  const [volume, setVolume] = useState(() => parseFloat(localStorage.getItem('pref_volume') || '1'));
  const [isLiked, setIsLiked] = useState(false);
  const [networkStats, setNetworkStats] = useState({ progress: 0 });
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const player = videoRef.current;
    if (!player) return;

    // Load saved position
    const savedPos = localStorage.getItem(`continue_${video.id}`);
    if (savedPos) player.currentTime = parseFloat(savedPos);
    
    player.volume = volume;
    player.playbackRate = playbackSpeed;

    const onTimeUpdate = () => {
      localStorage.setItem(`continue_${video.id}`, player.currentTime.toString());
      if (player.buffered.length > 0) {
        const prog = (player.buffered.end(player.buffered.length - 1) / player.duration) * 100;
        setNetworkStats({ progress: Math.min(prog, 100) });
      }
    };

    const onVolumeChange = () => {
      if (videoRef.current) {
        setVolume(videoRef.current.volume);
        localStorage.setItem('pref_volume', videoRef.current.volume.toString());
      }
    };

    player.addEventListener('timeupdate', onTimeUpdate);
    player.addEventListener('volumechange', onVolumeChange);

    return () => {
      player.pause();
      player.src = "";
      player.load();
      if (document.pictureInPictureElement === player) {
        document.exitPictureInPicture().catch(() => {});
      }
      player.removeEventListener('timeupdate', onTimeUpdate);
      player.removeEventListener('volumechange', onVolumeChange);
    };
  }, [video.id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!videoRef.current) return;
      const v = videoRef.current;
      if (e.key === ' ') { e.preventDefault(); v.paused ? v.play() : v.pause(); }
      if (e.key === 'f') containerRef.current?.requestFullscreen();
      if (e.key === 'ArrowRight') v.currentTime += 5;
      if (e.key === 'ArrowLeft') v.currentTime -= 5;
      if (e.key === 'ArrowUp') v.volume = Math.min(1, v.volume + 0.1);
      if (e.key === 'ArrowDown') v.volume = Math.max(0, v.volume - 0.1);
      if (e.key === 'm') v.muted = !v.muted;
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const upNext = useMemo(() => {
    return allVideos.filter(v => v.type === 'video' && v.id !== video.id).slice(0, 10);
  }, [allVideos, video.id]);

  const handleShare = () => {
    navigator.share?.({ title: video.name, url: window.location.href }).catch(() => {
      navigator.clipboard.writeText(window.location.href);
    });
  };

  return (
    <div className="fixed inset-0 bg-[#050505] z-[100] overflow-y-auto overflow-x-hidden selection:bg-blue-600/30 font-sans">
      <div className="w-full max-w-[1600px] mx-auto px-4 py-4 lg:py-8">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={onBack} className="flex items-center gap-2 text-white/40 hover:text-white transition-all group px-3 py-1.5 bg-white/5 rounded-xl border border-white/5 shrink-0">
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">Library</span>
          </button>
          <div className="h-px bg-white/5 flex-1" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <div 
              ref={containerRef} 
              className="relative w-full aspect-video bg-black rounded-2xl md:rounded-3xl overflow-hidden border border-white/10 shadow-2xl ring-1 ring-white/10 group/player max-h-[75vh]"
              onDoubleClick={() => containerRef.current?.requestFullscreen()}
            >
              <video 
                ref={videoRef}
                src={`/api/stream/${video.id}`} 
                controls 
                autoPlay 
                playsInline
                className="w-full h-full"
                style={{ playbackRate: playbackSpeed }}
                onEnded={onNext}
              />
              <div className="absolute top-4 left-4 pointer-events-none opacity-0 group-hover/player:opacity-100 transition-opacity">
                <div className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg border border-white/10 flex items-center gap-2">
                  <Activity size={12} className="text-blue-500" />
                  <span className="text-[9px] font-bold text-white uppercase">Buffer: {networkStats.progress.toFixed(1)}%</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h1 className="text-xl md:text-2xl font-black text-white leading-tight break-words">{video.name}</h1>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2 border-b border-white/5 pb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold text-white shadow-lg">
                    {video.topic.charAt(0)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white truncate max-w-[200px]">{video.topic}</span>
                    <span className="text-[10px] text-white/40 uppercase font-black">Archive Batch</span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button 
                    onClick={() => setIsLiked(!isLiked)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${isLiked ? 'bg-blue-600 border-blue-600' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                  >
                    <Activity size={16} className={isLiked ? 'text-white' : 'text-blue-500'} />
                    <span className="text-xs font-bold">{isLiked ? 'Favorite' : 'Like'}</span>
                  </button>
                  <button onClick={handleShare} className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-all">
                    <Monitor size={16} />
                    <span className="text-xs font-bold">Share</span>
                  </button>
                  <div className="h-8 w-px bg-white/10 mx-1" />
                  <button 
                    onClick={() => {
                      if (document.pictureInPictureElement) {
                        document.exitPictureInPicture();
                      } else {
                        videoRef.current?.requestPictureInPicture();
                      }
                    }}
                    className="p-2.5 bg-white/5 hover:bg-white/10 rounded-full border border-white/10"
                  >
                    <Monitor size={18} />
                  </button>
                </div>
              </div>

              <div className="p-6 bg-white/5 rounded-2xl border border-white/5 space-y-4">
                <div className="flex flex-wrap gap-x-8 gap-y-4 text-xs font-bold text-white/60">
                   <div className="flex flex-col">
                      <span className="text-[9px] uppercase text-white/20 tracking-widest mb-1">Uploaded</span>
                      <span>{new Date(video.mtime).toLocaleDateString()}</span>
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[9px] uppercase text-white/20 tracking-widest mb-1">Payload</span>
                      <span>{(video.size / (1024 * 1024)).toFixed(1)} MB</span>
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[9px] uppercase text-white/20 tracking-widest mb-1">Format</span>
                      <span className="uppercase">{video.ext.replace('.', '')} Archive</span>
                   </div>
                </div>
                <div className="h-px bg-white/5" />
                <div className="flex items-center gap-4">
                   <span className="text-[10px] font-black uppercase text-white/20">Playback Speed:</span>
                   <div className="flex gap-1">
                      {[0.5, 1, 1.25, 1.5, 2].map(speed => (
                        <button 
                          key={speed}
                          onClick={() => {
                            setPlaybackSpeed(speed);
                            localStorage.setItem('pref_speed', speed.toString());
                          }}
                          className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all ${playbackSpeed === speed ? 'bg-blue-600 text-white shadow-lg' : 'bg-white/5 text-white/20 hover:text-white'}`}
                        >
                          {speed}x
                        </button>
                      ))}
                   </div>
                </div>
              </div>
            </div>

            {relatedPdfs.length > 0 && (
              <div className="pt-8">
                <h3 className="text-sm font-black text-white/20 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                  <FileText size={16} className="text-red-500" />
                  Technical Documentation
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {relatedPdfs.map(pdf => (
                    <div key={pdf.id} className="flex items-center justify-between p-4 bg-white/2 rounded-2xl border border-white/5 group hover:bg-white/5 transition-all">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="p-2.5 bg-red-500/10 text-red-500 rounded-xl">
                          <FileText size={18} />
                        </div>
                        <div className="flex flex-col overflow-hidden">
                           <span className="text-xs font-bold text-white/80 truncate">{pdf.name}</span>
                           <span className="text-[9px] text-white/20 font-black">{(pdf.size / (1024 * 1024)).toFixed(1)} MB</span>
                        </div>
                      </div>
                      <a href={`/api/pdf/${pdf.id}`} target="_blank" className="p-2.5 bg-white/5 hover:bg-blue-600 rounded-xl text-white/40 hover:text-white transition-all">
                        <Download size={16} />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-4 space-y-6">
             <div className="flex items-center justify-between px-2">
                <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Up Next</h3>
                <div className="flex gap-2">
                   <button onClick={onPrev} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-all">
                      <SkipBack size={16} />
                   </button>
                   <button onClick={onNext} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-all">
                      <SkipForward size={16} />
                   </button>
                </div>
             </div>

             <div className="space-y-4">
                {upNext.map(v => (
                  <div 
                    key={v.id} 
                    onClick={() => {
                        // The app state handles selection in App.tsx
                        const event = new CustomEvent('select-video', { detail: v });
                        window.dispatchEvent(event);
                    }}
                    className="flex gap-3 p-2 rounded-2xl hover:bg-white/5 transition-all group cursor-pointer border border-transparent hover:border-white/5"
                  >
                    <div className="relative w-40 aspect-video rounded-xl overflow-hidden shrink-0 bg-black">
                      <img 
                        src={`/api/thumbnail/${v.id}`} 
                        alt={v.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        onError={(e) => (e.target as HTMLImageElement).src = `https://placehold.co/320x180/111/fff?text=${encodeURIComponent(v.topic)}`}
                      />
                    </div>
                    <div className="flex flex-col justify-center min-w-0 pr-2">
                      <h4 className="text-xs font-bold text-white/90 line-clamp-2 leading-snug group-hover:text-blue-400 transition-colors mb-2">{v.name}</h4>
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-black text-blue-500/60 uppercase truncate">{v.topic}</span>
                        <span className="text-[8px] font-mono text-white/20 uppercase">{(v.size / (1024 * 1024)).toFixed(0)} MB</span>
                      </div>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Sidebar = ({ topics, activeTopic, onSelectTopic, isOpen, onClose }: { topics: Topic[], activeTopic: string | null, onSelectTopic: (name: string | null) => void, isOpen: boolean, onClose: () => void }) => {
  const getTopicIcon = (name: string) => {
    const low = name.toLowerCase();
    if (low.includes('grammar')) return <Activity size={18} className="text-emerald-500" />;
    if (low.includes('phonetic')) return <Volume2 size={18} className="text-yellow-500" />;
    if (low.includes('literary')) return <Play size={18} className="text-purple-500" />;
    if (low.includes('poetry')) return <FileText size={18} className="text-pink-500" />;
    if (low.includes('mmc')) return <BarChart2 size={18} className="text-orange-500" />;
    return <Folder size={18} className="text-blue-500" />;
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xl z-[60] lg:hidden"
          />
        )}
      </AnimatePresence>
      <aside className={`fixed top-16 left-0 bottom-0 w-72 bg-black/40 backdrop-blur-md border-r border-white/5 overflow-y-auto z-[70] transition-all duration-500 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 space-y-10">
          <div className="space-y-4">
            <h3 className="px-4 text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-4">Relay Controls</h3>
            <button 
              onClick={() => { onSelectTopic(null); onClose(); }}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${activeTopic === null ? 'bg-blue-600 text-white shadow-2xl shadow-blue-500/20' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}
            >
              <LayoutGrid size={22} className={activeTopic === null ? 'text-white' : 'text-blue-500/40'} />
              <span className="font-bold tracking-tight">Prime Feed</span>
            </button>
          </div>
          
          <div className="space-y-2">
            <div className="px-4 flex items-center justify-between mb-6">
               <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Index Keys</h3>
               <span className="text-[9px] font-black text-blue-500 uppercase">{topics.length}</span>
            </div>
            {topics.length === 0 ? (
               <div className="px-8 py-10 text-center bg-white/5 rounded-3xl border border-white/10 border-dashed">
                  <Activity size={32} className="mx-auto text-white/5 mb-3" />
                  <p className="text-[10px] text-white/20 font-black uppercase tracking-widest">Awaiting Datasets</p>
               </div>
            ) : topics.map((t) => (
              <button 
                key={t.name}
                onClick={() => { onSelectTopic(t.name); onClose(); }}
                className={`w-full flex items-center justify-between px-5 py-3.5 rounded-2xl transition-all group ${activeTopic === t.name ? 'bg-white/10 text-white' : 'text-white/30 hover:bg-white/5 hover:text-white'}`}
              >
                <div className="flex items-center gap-4 overflow-hidden">
                  {getTopicIcon(t.name)}
                  <span className="truncate text-sm font-black tracking-tight">{t.name}</span>
                </div>
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg ${activeTopic === t.name ? 'bg-blue-500 text-white' : 'bg-white/5 text-white/40 group-hover:text-white group-hover:bg-white/10'}`}>
                  {t.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
};

const SettingsView = ({ currentRoot, onClose, onRescan, onChangeSource }: { currentRoot: string | null, onClose: () => void, onRescan: () => void, onChangeSource: () => void }) => (
  <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 sm:p-12">
     <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="absolute inset-0 bg-black/90 backdrop-blur-3xl"
     />
     <motion.div 
      initial={{ opacity: 0, scale: 0.9, y: 40 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 40 }}
      className="relative w-full max-w-2xl bg-[#0a0a0a] rounded-[3rem] border border-white/10 shadow-[0_40px_120px_rgba(0,0,0,1)] overflow-hidden"
     >
        <div className="p-10 pb-6 flex items-center justify-between">
          <div className="flex flex-col">
             <h2 className="text-3xl font-black text-white tracking-tighter leading-none">Console</h2>
             <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mt-1">Platform Orchestration</span>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-2xl text-white/20 hover:text-white transition-all shadow-xl">
            <X size={28} />
          </button>
        </div>

        <div className="p-10 pt-0 space-y-10">
           <div className="p-8 bg-[#0f0f0f] rounded-[2rem] border border-white/5 relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity">
                 <Settings size={120} />
              </div>
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-4 block">Archive Directory</span>
              <div className="flex items-center gap-5">
                 <div className="p-5 bg-blue-600 rounded-3xl text-white shadow-2xl shadow-blue-500/40">
                    <HardDrive size={32} />
                 </div>
                 <div className="flex-1 overflow-hidden">
                    <p className="text-white font-black truncate text-2xl tracking-tighter leading-none mb-1">{currentRoot ? currentRoot.split('/').pop() : 'Undefined'}</p>
                    <p className="text-white/20 text-xs truncate font-mono tracking-tighter uppercase">{currentRoot || 'No Source identified'}</p>
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
              <button 
                onClick={onRescan}
                className="flex flex-col items-start gap-4 p-8 bg-white/5 hover:bg-white/10 rounded-[2.5rem] border border-white/5 transition-all group shadow-xl"
              >
                <div className="p-4 bg-blue-500/10 text-blue-500 rounded-2xl group-hover:scale-110 transition-transform">
                   <RefreshCw className="group-hover:rotate-180 transition-transform duration-700" />
                </div>
                <div className="text-left">
                   <p className="text-white font-black text-lg tracking-tight leading-none mb-1">Index Re-cache</p>
                   <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest">Update Local Metadata</p>
                </div>
              </button>

              <button 
                onClick={onChangeSource}
                className="flex flex-col items-start gap-4 p-8 bg-white/5 hover:bg-white/10 rounded-[2.5rem] border border-white/5 transition-all group shadow-xl"
              >
                <div className="p-4 bg-red-500/10 text-red-500 rounded-2xl group-hover:scale-110 transition-transform">
                   <LogOut className="group-hover:-translate-x-1 transition-transform" />
                </div>
                <div className="text-left">
                   <p className="text-white font-black text-lg tracking-tight leading-none mb-1">Batch Handover</p>
                   <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest">Identify New Media Root</p>
                </div>
              </button>
           </div>
        </div>

        <div className="p-8 bg-black/40 border-t border-white/5 flex items-center justify-between px-10">
           <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-white/20 text-[10px] font-black uppercase tracking-widest">Relay Active</span>
           </div>
           <span className="text-white/10 text-[9px] font-black uppercase tracking-[0.5em]">System Archive 2026</span>
        </div>
     </motion.div>
  </div>
);

// --- Main Application ---

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

    const handleSelectVideo = (e: any) => {
      setSelectedVideo(e.detail);
    };
    window.addEventListener('select-video', handleSelectVideo);
    return () => window.removeEventListener('select-video', handleSelectVideo);
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

  const currentVideos = useMemo(() => {
    return videos.filter(v => {
      const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            v.topic.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTopic = !activeTopic || v.topic === activeTopic;
      return matchesSearch && matchesTopic;
    });
  }, [videos, searchTerm, activeTopic]);

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
      <div className="min-h-screen bg-black flex items-center justify-center p-12 overflow-hidden">
        <div className="flex flex-col items-center">
          <motion.div 
            animate={{ rotate: 360 }} 
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 border-t-2 border-r-2 border-blue-600 rounded-full mb-10 shadow-2xl shadow-blue-500/20" 
          />
          <div className="flex flex-col items-center space-y-2">
             <span className="text-white font-black uppercase tracking-[0.5em] text-xs">Platform Initialization</span>
             <span className="text-white/20 font-mono text-[10px] tracking-widest animate-pulse uppercase">Handshaking with Local Host...</span>
          </div>
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
    <div className="min-h-screen bg-black text-white selection:bg-blue-600/30 selection:text-blue-400 font-sans tracking-tight">
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

      <main className="pt-24 lg:pl-72 w-full max-w-full overflow-x-hidden px-4 md:px-8 pb-32 transition-all">
        {/* Statistics Banner */}
        {!activeTopic && !searchTerm && (
           <section className="mb-16 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
              {[
                { l: 'Archives', v: videos.filter(v=>v.type==='video').length, i: <PlayCircle size={18} className="text-blue-500"/> },
                { l: 'Dataset Logs', v: videos.filter(v=>v.type==='pdf').length, i: <FileText size={18} className="text-red-500"/> },
                { l: 'Index Size', v: `${(videos.reduce((a,v)=>a+v.size,0)/(1024*1024*1024)).toFixed(1)} GB`, i: <HardDrive size={18} className="text-white/20"/> },
                { l: 'Network State', v: 'Optimized', i: <Activity size={18} className="text-emerald-500"/> },
              ].map(s => (
                <div key={s.l} className="p-4 md:p-6 bg-[#0f0f0f] rounded-2xl md:rounded-[2rem] border border-white/5 flex items-center gap-4 group hover:border-white/20 transition-all overflow-hidden">
                   <div className="p-3 bg-white/5 rounded-2xl group-hover:scale-110 transition-transform shrink-0">{s.i}</div>
                   <div className="min-w-0">
                      <p className="text-[10px] font-black text-white/20 uppercase tracking-widest truncate">{s.l}</p>
                      <p className="text-base md:text-lg font-black text-white truncate">{s.v}</p>
                   </div>
                </div>
              ))}
           </section>
        )}

        {/* Recent Media section */}
        {!activeTopic && !searchTerm && (
          <section className="mb-20">
            <div className="flex items-center justify-between mb-8">
               <h2 className="text-3xl font-black text-white tracking-tighter flex items-center gap-4">
                 <Clock size={32} className="text-blue-500" />
                 Recent Uploads
               </h2>
               <div className="h-px flex-1 mx-8 bg-white/5 hidden sm:block" />
            </div>
            {recentVideos.length === 0 ? (
               <div className="py-24 bg-white/2 border border-dashed border-white/5 rounded-[3rem] text-center">
                  <p className="text-white/20 uppercase font-black tracking-widest text-xs">No media detected in root</p>
               </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {recentVideos.map(v => (
                  <VideoCard key={v.id} video={v} onClick={() => setSelectedVideo(v)} highlight={searchTerm} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Topic Content area */}
        <section>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-2">{activeTopic ? 'Archive Category' : 'Discovery mode'}</span>
              <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none">
                {activeTopic || (searchTerm ? `Search Result` : 'Library Explorer')}
              </h2>
            </div>
            <div className="flex items-center gap-3">
               {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="px-4 py-2 bg-white/10 rounded-xl text-xs font-bold hover:bg-white/20 transition-colors">Clear Search</button>
               )}
               <span className="text-[10px] font-black text-white/20 uppercase tracking-widest bg-white/5 px-4 py-2 rounded-full border border-white/5 ring-1 ring-white/10">
                 {currentVideos.length} units indexed
               </span>
            </div>
          </div>

          {currentVideos.length === 0 ? (
            <div className="py-40 text-center bg-[#070707] rounded-[4rem] border border-white/5 shadow-inner">
              <Search size={64} className="mx-auto text-white/5 mb-6" />
              <p className="text-white/20 font-black text-2xl tracking-widest uppercase italic">Archive Unidentified</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {currentVideos.map(v => (
                <VideoCard key={v.id} video={v} onClick={() => v.type === 'video' ? setSelectedVideo(v) : window.open(`/api/pdf/${v.id}`, '_blank')} highlight={searchTerm} />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Floating Overlays */}
      <AnimatePresence>
        {selectedVideo && (
          <VideoPlayerPage 
            video={selectedVideo} 
            allVideos={videos}
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

      <footer className="lg:pl-72 w-full max-w-full overflow-x-hidden py-12 md:py-20 px-4 md:px-10 border-t border-white/5 text-center flex flex-col items-center gap-6">
        <div className="w-12 h-1 bg-blue-600 rounded-full opacity-20" />
        <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6 text-white/10 font-black uppercase tracking-[0.2em] md:tracking-[0.4em] text-[8px] md:text-[10px]">
           <span>Secured Archive</span>
           <span className="w-1 h-1 rounded-full bg-white/10 hidden md:block" />
           <span>High Performance Indexing</span>
           <span className="w-1 h-1 rounded-full bg-white/10 hidden md:block" />
           <span>Cloud Node 2026</span>
        </div>
      </footer>
    </div>
  );
}
