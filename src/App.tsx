import React, { useState, useEffect } from 'react';
import { Search, Play, Folder, Clock, ChevronRight, LayoutGrid, List, Menu, X, PlayCircle, Download, FileText, ChevronLeft, Maximize, FastForward, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { VideoFile, Topic } from './types';

// Components
const Navbar = ({ onSearch, onToggleSidebar }: { onSearch: (q: string) => void, onToggleSidebar: () => void }) => (
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
    <div className="w-48 hidden sm:flex justify-end pr-2">
       <span className="text-xs text-white/40 uppercase tracking-widest font-semibold">Premium Player</span>
    </div>
  </nav>
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
          {topics.map((t) => (
            <button 
              key={t.name}
              onClick={() => { onSelectTopic(t.name); onClose(); }}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all group ${activeTopic === t.name ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
            >
              <div className="flex items-center gap-3">
                <Folder size={18} className={activeTopic === t.name ? 'text-blue-500' : ''} />
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
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">{video.name}</h1>
            <div className="flex items-center gap-4 mt-4">
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
  const [videos, setVideos] = useState<VideoFile[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoFile | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 300000); // 5 mins
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [vRes, tRes] = await Promise.all([
        fetch('/api/videos'),
        fetch('/api/topics')
      ]);
      setVideos(await vRes.json());
      setTopics(await tRes.json());
    } finally {
      setLoading(false);
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
          <p className="text-white/40 font-mono text-sm tracking-widest uppercase animate-pulse">Initializing Library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-600/30 selection:text-blue-400">
      <Navbar onSearch={setSearchTerm} onToggleSidebar={() => setIsSidebarOpen(true)} />
      
      <Sidebar 
        topics={topics} 
        activeTopic={activeTopic} 
        onSelectTopic={setActiveTopic} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      <main className={`pt-24 lg:pl-64 px-6 pb-12 transition-all`}>
        {/* Recent & Hero Section (only on "All Topics" and if no search) */}
        {!activeTopic && !searchTerm && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Clock size={24} className="text-blue-500" />
              Recently Added
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentVideos.map(v => (
                <VideoCard key={v.id} video={v} onClick={() => setSelectedVideo(v)} />
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Folder size={24} className="text-blue-500" />
              {activeTopic || (searchTerm ? `Search: ${searchTerm}` : 'Explore Library')}
            </h2>
            <span className="text-xs font-mono text-white/30 uppercase tracking-widest">
              {currentVideos.length} items found
            </span>
          </div>

          {currentVideos.length === 0 ? (
            <div className="py-24 text-center bg-white/5 rounded-3xl border border-white/5">
              <Search size={48} className="mx-auto text-white/10 mb-4" />
              <p className="text-white/40">No videos found matching your criteria</p>
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

      <footer className="lg:pl-64 py-12 px-6 border-t border-white/5 text-center">
        <p className="text-white/20 text-sm font-medium tracking-tight">RPSC Record Plus Live Archive &copy; 2026</p>
      </footer>
    </div>
  );
}
