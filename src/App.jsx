import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Music, Instagram, Youtube, Ghost, Twitter,
  Facebook, Linkedin, Cloud, Video, Mic2, Image, Radio,
  Layers, Scissors, Clipboard, CheckCircle, Loader2, FileVideo,
  FileAudio, Clock, Trash2, Activity, ImageIcon,
  AlertTriangle, X, Zap, Users, BarChart3, Heart,
  Download, Shield, Cpu, Wifi, Star
} from 'lucide-react';
import axios from 'axios';

const platforms = [
  { id: 'tiktok', name: 'TikTok', icon: <Music />, color: '#ff0050' },
  { id: 'instagram', name: 'Instagram', icon: <Instagram />, color: '#E1306C' },
  { id: 'youtube', name: 'YouTube', icon: <Youtube />, color: '#FF0000' },
  { id: 'snapchat', name: 'Snapchat', icon: <Ghost />, color: '#FFFC00' },
  { id: 'twitter', name: 'Twitter/X', icon: <Twitter />, color: '#1DA1F2' },
  { id: 'facebook', name: 'Facebook', icon: <Facebook />, color: '#1877F2' },
  { id: 'spotify', name: 'Spotify', icon: <Radio />, color: '#1DB954' },
  { id: 'soundcloud', name: 'SoundCloud', icon: <Mic2 />, color: '#FF5500' },
  { id: 'linkedin', name: 'LinkedIn', icon: <Linkedin />, color: '#0077B5' },
  { id: 'pinterest', name: 'Pinterest', icon: <Image />, color: '#BD081C' },
  { id: 'tumblr', name: 'Tumblr', icon: <Layers />, color: '#36465D' },
  { id: 'douyin', name: 'Douyin', icon: <Music />, color: '#00f2ff' },
  { id: 'kuaishou', name: 'Kuaishou', icon: <Video />, color: '#FF7F24' },
  { id: 'capcut', name: 'CapCut', icon: <Scissors />, color: '#ffffff' },
  { id: 'dailymotion', name: 'Dailymotion', icon: <Video />, color: '#0066DC' },
  { id: 'bluesky', name: 'Bluesky', icon: <Cloud />, color: '#0085FF' },
];

const loadingLogs = [
  "⬡ Handshake initialized...",
  "⬡ Requesting content stream...",
  "⬡ Bypassing token layer...",
  "⬡ Parsing media packets...",
  "⬡ Finalizing extraction...",
];

const INITIAL_VISITORS = 14205;
const INITIAL_LINKS = 45902;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const itemVariants = {
  hidden: { y: 16, opacity: 0, scale: 0.95 },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 200, damping: 20 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const Corners = ({ color = '#00f2ff' }) => (
  <>
    <span className="corner-tl" style={{ borderColor: color, opacity: 0.6 }} />
    <span className="corner-tr" style={{ borderColor: color, opacity: 0.6 }} />
    <span className="corner-bl" style={{ borderColor: color, opacity: 0.6 }} />
    <span className="corner-br" style={{ borderColor: color, opacity: 0.6 }} />
  </>
);

export default function App() {
  const [selected, setSelected] = useState(null);
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [logIndex, setLogIndex] = useState(0);
  const [history, setHistory] = useState([]);
  const [notification, setNotification] = useState(null);
  const [stats, setStats] = useState({ visitors: INITIAL_VISITORS, links: INITIAL_LINKS });
  const [ripple, setRipple] = useState(null);
  const inputRef = useRef(null);

  const activePlatform = selected ? platforms.find(p => p.id === selected) : null;
  const activeColor = activePlatform?.color ?? '#00f2ff';
  const activeName = activePlatform?.name ?? 'Universal';
  const endpoint = selected ? `/api/${selected}` : '';

  useEffect(() => {
    if (!isLoading) return;
    setLogIndex(0);
    const iv = setInterval(() => {
      setLogIndex(prev => prev < loadingLogs.length - 1 ? prev + 1 : prev);
    }, 750);
    return () => clearInterval(iv);
  }, [isLoading]);

  useEffect(() => {
    const iv = setInterval(() => {
      setStats(prev => ({ ...prev, visitors: prev.visitors + Math.floor(Math.random() * 3) }));
    }, 4000);
    return () => clearInterval(iv);
  }, []);

  const showNotify = (message, type = 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
      inputRef.current?.focus();
    } catch {
      showNotify('Clipboard access denied.', 'error');
    }
  };

  const addToHistory = data => setHistory(prev => [data, ...prev].slice(0, 4));
  const clearHistory = () => setHistory([]);

  const getDownloadLink = type => {
    if (!result) return null;

    if (Array.isArray(result)) {
      if (type === 'video') {
        const vid = result.find(x => x.type === 'video' || x.type === 'mp4');
        return vid ? vid.url : result[0]?.url ?? null;
      }
      return null;
    }

    const list =
      result.formats ||
      result.downloads ||
      result.videoLinks ||
      result.medias ||
      result.downloadLinks;

    if (list && Array.isArray(list)) {
      if (type === 'video') {
        let v = list.find(item => {
          const lbl = String(item.text || item.label || item.quality || '').toLowerCase();
          const u = String(item.url || '').toLowerCase();
          const isV =
            lbl.includes('video') ||
            lbl.includes('mp4') ||
            item.extension === 'mp4' ||
            item.type === 'video';
          return isV && !u.includes('.m3u8');
        });
        if (!v) v = list.find(i => i.url && String(i.url).includes('.mp4'));
        if (!v && list.length > 0) {
          const first = list[0];
          const lbl = String(first.label || first.type || '').toLowerCase();
          if (!lbl.includes('profile') && !lbl.includes('audio')) v = first;
        }
        return v ? v.url : null;
      }
      if (type === 'audio') {
        const a = list.find(item => {
          const lbl = String(
            item.text || item.label || item.type || item.extension || ''
          ).toLowerCase();
          return lbl.includes('mp3') || lbl.includes('audio') || lbl.includes('music');
        });
        return a ? a.url : null;
      }
    }

    if (type === 'video') {
      return result.videoUrl || result.download || result.video || result.url || null;
    }
    return null;
  };

  const getButtonConfig = () => {
    const vLink = getDownloadLink('video');
    const isImg = vLink && /\.(jpg|webp|png)/i.test(String(vLink));
    switch (selected) {
      case 'pinterest':
        return { label: 'DOWNLOAD IMAGE', icon: <ImageIcon size={13} />, noData: 'NO IMAGE' };
      case 'spotify':
        return { label: 'DOWNLOAD TRACK', icon: <Music size={13} />, noData: 'NO TRACK' };
      case 'soundcloud':
        return { label: 'DOWNLOAD TRACK', icon: <Music size={13} />, noData: 'NO TRACK' };
      case 'instagram':
        return isImg
          ? { label: 'DOWNLOAD IMAGE', icon: <ImageIcon size={13} />, noData: 'NO POST' }
          : { label: 'DOWNLOAD REEL', icon: <Instagram size={13} />, noData: 'NO POST' };
      default:
        return { label: 'DOWNLOAD VIDEO', icon: <FileVideo size={13} />, noData: 'NO VIDEO' };
    }
  };

  const btnConfig = getButtonConfig();
  const isAudioPlatform = ['spotify', 'soundcloud'].includes(selected);
  const primaryLink = isAudioPlatform ? getDownloadLink('audio') : getDownloadLink('video');
  const showAudioBtn = !isAudioPlatform && !['instagram', 'pinterest'].includes(selected);

  const handleExtract = async e => {
    if (!url) return showNotify('Please insert a URL first!', 'error');
    if (!selected) return showNotify('Please select a platform first!', 'error');

    if (e?.currentTarget) {
      const rect = e.currentTarget.getBoundingClientRect();
      setRipple({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      setTimeout(() => setRipple(null), 600);
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await axios.post(endpoint, { url });
      setResult(response.data);
      addToHistory(response.data);
      setStats(prev => ({ ...prev, links: prev.links + 1 }));
      showNotify('Extraction successful!', 'success');
    } catch (error) {
      let msg = 'Failed to reach server.';
      if (error.response?.data) {
        const d = error.response.data;
        msg = d.message || d.error || d.details || JSON.stringify(d);
        if (typeof msg === 'object') msg = JSON.stringify(msg);
      } else if (error.message) {
        msg = error.message;
      }
      showNotify(`ERROR: ${String(msg).substring(0, 120)}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen flex flex-col items-center px-4 py-8 sm:py-12 overflow-x-hidden"
      style={{ background: '#03000f' }}
    >
      <div className="grid-bg" />
      <div className="glow-orb-1" />
      <div className="glow-orb-2" />
      <div className="glow-orb-3" />
      <div className="scanline" />

      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center gap-8">

        <AnimatePresence>
          {notification && (
            <motion.div
              key="notify"
              initial={{ y: -80, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -80, opacity: 0, scale: 0.9 }}
              className={`fixed top-4 left-1/2 z-50 w-[92%] max-w-md -translate-x-1/2 rounded-xl p-4 flex items-start gap-3 shadow-2xl border ${
                notification.type === 'error'
                  ? 'notify-error border-red-500/30'
                  : 'notify-success border-green-500/30'
              }`}
            >
              <div
                className={`shrink-0 p-1.5 rounded-lg ${
                  notification.type === 'error'
                    ? 'bg-red-500/15 text-red-400'
                    : 'bg-green-500/15 text-green-400'
                }`}
              >
                <AlertTriangle size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-[10px] font-black tracking-widest uppercase mb-1 ${
                    notification.type === 'error' ? 'text-red-400' : 'text-green-400'
                  }`}
                >
                  {notification.type === 'error' ? '⚠ SYSTEM ALERT' : '✔ SUCCESS'}
                </p>
                <p className="text-gray-300 text-xs font-mono leading-relaxed break-words">
                  {notification.message}
                </p>
              </div>
              <button
                onClick={() => setNotification(null)}
                className="shrink-0 text-gray-500 hover:text-white transition-colors"
              >
                <X size={15} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.header
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="w-full text-center flex flex-col items-center gap-4 pt-2"
        >
          <div className="status-badge flex items-center gap-2 px-4 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_#00ff88]" />
            <span className="text-[10px] text-green-400 font-bold tracking-[0.25em] uppercase">
              All Systems Operational
            </span>
          </div>

          <div className="relative">
            <h1
              className="gradient-text-main text-4xl sm:text-5xl md:text-7xl font-black tracking-tight leading-none select-none"
              style={{ letterSpacing: '-0.02em' }}
            >
              VINCENTSENSEI
            </h1>
            <div className="gradient-text-sub text-sm sm:text-base font-black tracking-[0.6em] uppercase mt-1">
              DOWNLOADER
            </div>
            <div
              className="absolute inset-0 blur-3xl opacity-20 pointer-events-none"
              style={{
                background:
                  'radial-gradient(ellipse, #7d00ff 0%, #00f2ff 50%, transparent 100%)',
              }}
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-cyan-500/60" />
            <span className="text-[10px] sm:text-xs font-bold tracking-[0.45em] text-cyan-400/70 uppercase whitespace-nowrap">
              NO WATERMARK · NO LIMITS
            </span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-cyan-500/60" />
          </div>

          <div className="flex flex-wrap justify-center gap-2 mt-1">
            {[
              { icon: <Shield size={10} />, text: 'SECURE', color: '#00f2ff' },
              { icon: <Zap size={10} />, text: 'FAST', color: '#ff00ff' },
              { icon: <Cpu size={10} />, text: '16 PLATFORMS', color: '#7d00ff' },
              { icon: <Star size={10} />, text: 'FREE', color: '#ffaa00' },
            ].map(({ icon, text, color }) => (
              <span
                key={text}
                className="flex items-center gap-1 px-3 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase"
                style={{
                  background: `${color}15`,
                  border: `1px solid ${color}30`,
                  color,
                }}
              >
                {icon} {text}
              </span>
            ))}
          </div>
        </motion.header>

        <div
          className="w-full overflow-hidden py-2 border-y"
          style={{
            borderColor: 'rgba(0,242,255,0.06)',
            background:
              'linear-gradient(90deg, transparent, rgba(0,242,255,0.03), transparent)',
          }}
        >
          <div className="ticker-wrap">
            <span className="ticker-text text-[9px] font-mono tracking-widest text-cyan-500/40 uppercase">
              {Array(6)
                .fill(
                  '◆ TIKTOK ◆ INSTAGRAM ◆ YOUTUBE ◆ SPOTIFY ◆ SOUNDCLOUD ◆ SNAPCHAT ◆ FACEBOOK ◆ PINTEREST ◆ TWITTER/X ◆ LINKEDIN ◆ CAPCUT ◆ BLUESKY ◆ DAILYMOTION ◆ KUAISHOU ◆ DOUYIN ◆ TUMBLR'
                )
                .join('  ')}
            </span>
          </div>
        </div>

        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5"
        >
          {platforms.map(p => {
            const isActive = selected === p.id;
            return (
              <motion.button
                key={p.id}
                variants={itemVariants}
                onClick={() => {
                  setSelected(p.id);
                  setResult(null);
                }}
                whileHover={{ scale: 1.04, y: -3 }}
                whileTap={{ scale: 0.96 }}
                className="platform-btn glass-card glass-card-hover relative flex items-center gap-3 px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl text-left overflow-hidden"
                style={{
                  borderColor: isActive ? p.color : 'rgba(255,255,255,0.05)',
                  boxShadow: isActive
                    ? `0 0 12px ${p.color}40, 0 0 24px ${p.color}20, inset 0 0 12px ${p.color}08`
                    : 'none',
                }}
              >
                {isActive && (
                  <div
                    className="absolute inset-0 opacity-8 pointer-events-none"
                    style={{
                      background: `radial-gradient(ellipse at 20% 50%, ${p.color}20, transparent 70%)`,
                    }}
                  />
                )}

                <div
                  className="shrink-0 transition-all duration-300"
                  style={{
                    color: p.color,
                    filter: isActive ? `drop-shadow(0 0 8px ${p.color})` : 'none',
                  }}
                >
                  {React.cloneElement(p.icon, { size: 18 })}
                </div>

                <span
                  className="text-[10px] sm:text-xs font-bold tracking-wider uppercase truncate transition-colors duration-300"
                  style={{ color: isActive ? 'rgba(255,255,255,0.9)' : 'rgba(156,163,175,1)' }}
                >
                  {p.name}
                </span>

                {isActive && (
                  <motion.span
                    layoutId="platform-dot"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full"
                    style={{
                      backgroundColor: p.color,
                      boxShadow: `0 0 8px ${p.color}, 0 0 16px ${p.color}`,
                    }}
                  />
                )}
              </motion.button>
            );
          })}
        </motion.section>

        <motion.section
          layout
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="w-full relative"
        >
          <div
            className="relative rounded-2xl p-[1px] transition-all duration-500"
            style={{
              background: `linear-gradient(135deg, ${activeColor}60, #7d00ff60, #ff00ff40)`,
              boxShadow: `0 0 20px ${activeColor}20, 0 0 40px ${activeColor}10`,
            }}
          >
            <div
              className="relative rounded-[15px] p-4 sm:p-5 flex flex-col gap-3"
              style={{ background: 'rgba(5,2,18,0.95)', backdropFilter: 'blur(20px)' }}
            >
              <Corners color={activeColor} />

              <div className="flex items-center justify-between text-[10px] font-mono">
                <div className="flex items-center gap-2">
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-ping"
                    style={{
                      backgroundColor: activeColor,
                      boxShadow: `0 0 6px ${activeColor}`,
                    }}
                  />
                  <span className="text-gray-500">TARGET:</span>
                  <span className="font-black uppercase" style={{ color: activeColor }}>
                    {activeName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {isLoading ? (
                    <span className="terminal-text animate-pulse">{loadingLogs[logIndex]}</span>
                  ) : (
                    <span className="text-gray-600 flex items-center gap-1">
                      <Wifi size={10} className="text-green-500" /> READY
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <input
                    ref={inputRef}
                    type="text"
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleExtract(e)}
                    placeholder={`Paste ${activeName} link here...`}
                    className="neon-input w-full h-12 rounded-xl px-4 pr-12 font-mono text-xs"
                  />
                  <button
                    onClick={handlePaste}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-cyan-400 transition-colors p-1"
                  >
                    <Clipboard size={15} />
                  </button>
                </div>

                <button
                  onClick={handleExtract}
                  disabled={isLoading}
                  className="extract-btn relative h-12 px-6 sm:px-8 rounded-xl font-black text-black text-xs flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                >
                  <AnimatePresence>
                    {ripple && (
                      <motion.span
                        key="ripple"
                        className="absolute rounded-full bg-white/30 pointer-events-none"
                        style={{
                          left: ripple.x - 60,
                          top: ripple.y - 60,
                          width: 120,
                          height: 120,
                        }}
                        initial={{ scale: 0, opacity: 1 }}
                        animate={{ scale: 3, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6 }}
                      />
                    )}
                  </AnimatePresence>
                  {isLoading ? (
                    <>
                      <Loader2 size={15} className="animate-spin" /> PROCESSING
                    </>
                  ) : (
                    <>
                      <Zap size={15} className="fill-black" /> EXTRACT
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center gap-4 text-[9px] font-mono text-gray-600">
                <span className="flex items-center gap-1">
                  <Shield size={9} className="text-cyan-600" /> SSL ENCRYPTED
                </span>
                <span className="flex items-center gap-1">
                  <Star size={9} className="text-purple-600" /> NO LOGS STORED
                </span>
                <span className="flex items-center gap-1">
                  <Zap size={9} className="text-pink-600" /> INSTANT DL
                </span>
              </div>
            </div>
          </div>
        </motion.section>

        <AnimatePresence mode="wait">
          {result && (
            <motion.section
              key="result"
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 180, damping: 22 }}
              className="w-full"
            >
              <div className="result-card relative rounded-2xl overflow-hidden">
                <Corners color="#00f2ff" />

                <div
                  className="flex items-center justify-between px-5 py-3"
                  style={{
                    background:
                      'linear-gradient(90deg, rgba(0,242,255,0.06), rgba(125,0,255,0.06))',
                    borderBottom: '1px solid rgba(0,242,255,0.08)',
                  }}
                >
                  <div className="flex items-center gap-2 text-green-400 text-[10px] font-black tracking-widest uppercase">
                    <CheckCircle size={13} />
                    <span>EXTRACTED SUCCESSFULLY</span>
                  </div>
                  <span className="text-[9px] text-gray-600 font-mono">
                    {result.date || new Date().toLocaleTimeString()}
                  </span>
                </div>

                <div className="p-4 sm:p-5 flex flex-col md:flex-row gap-5">
                  <div
                    className="relative w-full md:w-[220px] aspect-video rounded-xl overflow-hidden shrink-0"
                    style={{
                      border: '1px solid rgba(0,242,255,0.12)',
                      boxShadow: '0 0 20px rgba(0,0,0,0.5)',
                    }}
                  >
                    {result.thumbnail ? (
                      <img
                        src={result.thumbnail}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ background: 'rgba(0,0,0,0.5)' }}
                      >
                        <ImageIcon size={32} className="text-gray-600" />
                      </div>
                    )}
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background:
                          'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)',
                      }}
                    />
                    <div className="absolute bottom-2 left-2 text-[9px] text-white font-mono bg-black/60 backdrop-blur-md px-2 py-0.5 rounded border border-white/10">
                      {result.size || 'HD'}
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col justify-between gap-4">
                    <div>
                      <h3 className="text-white font-bold text-base sm:text-lg leading-snug line-clamp-2 mb-2">
                        {result.title || 'Untitled Media'}
                      </h3>
                      <div className="flex items-center gap-2 text-gray-500 text-xs">
                        <Activity size={11} className="text-cyan-600" />
                        <span>
                          By <span className="text-gray-300">{result.author || 'Unknown'}</span>
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {primaryLink ? (
                        <a
                          href={primaryLink}
                          target="_blank"
                          rel="noreferrer"
                          className={`download-btn-video flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold tracking-wider ${
                            isAudioPlatform || !showAudioBtn ? 'sm:col-span-2' : ''
                          }`}
                        >
                          <Download size={13} /> {btnConfig.label}
                        </a>
                      ) : (
                        <button
                          disabled
                          className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold cursor-not-allowed text-gray-600 border border-white/5 ${
                            isAudioPlatform || !showAudioBtn ? 'sm:col-span-2' : ''
                          }`}
                          style={{ background: 'rgba(255,255,255,0.03)' }}
                        >
                          {btnConfig.icon} {btnConfig.noData}
                        </button>
                      )}

                      {showAudioBtn &&
                        (getDownloadLink('audio') ? (
                          <a
                            href={getDownloadLink('audio')}
                            target="_blank"
                            rel="noreferrer"
                            className="download-btn-audio flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold tracking-wider"
                          >
                            <FileAudio size={13} /> DOWNLOAD MP3
                          </a>
                        ) : (
                          <button
                            disabled
                            className="flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold cursor-not-allowed text-gray-600 border border-white/5"
                            style={{ background: 'rgba(255,255,255,0.03)' }}
                          >
                            <FileAudio size={13} /> NO AUDIO
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {history.length > 0 && (
            <motion.section
              key="history"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2 text-[10px] font-black tracking-widest text-gray-500 uppercase">
                  <Clock size={11} className="text-cyan-600" /> Recent Extractions
                </div>
                <button
                  onClick={clearHistory}
                  className="flex items-center gap-1 text-[10px] text-red-500/60 hover:text-red-400 transition-colors font-bold tracking-wider uppercase"
                >
                  <Trash2 size={10} /> Clear
                </button>
              </div>

              <div className="space-y-2">
                {history.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="history-item rounded-xl p-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {item.thumbnail ? (
                        <img
                          src={item.thumbnail}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover shrink-0"
                          style={{ border: '1px solid rgba(0,242,255,0.1)' }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                          <Activity size={14} className="text-gray-600" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-gray-300 text-xs font-bold truncate">
                          {item.title || 'Untitled'}
                        </p>
                        <p className="text-[10px] text-gray-600">{item.author || '—'}</p>
                      </div>
                    </div>
                    <span className="shrink-0 ml-3 text-[9px] font-bold tracking-wider text-cyan-500/60 border border-cyan-500/20 px-2.5 py-1 rounded-md bg-cyan-500/5">
                      DONE
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <motion.section
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="w-full grid grid-cols-2 gap-3 sm:gap-4"
        >
          <div
            className="stat-card glass-card rounded-2xl p-4 sm:p-5 flex items-center justify-between hover:border-cyan-500/20 transition-all duration-300 group"
            style={{ '--stat-color': '#00f2ff' }}
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_6px_#00f2ff]" />
                <span className="text-[9px] font-black tracking-widest text-cyan-500/60 uppercase">
                  Live Users
                </span>
              </div>
              <p className="text-2xl sm:text-3xl font-mono font-black text-white">
                {stats.visitors.toLocaleString()}
              </p>
            </div>
            <div
              className="p-3 rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(0,242,255,0.3)]"
              style={{
                background: 'rgba(0,242,255,0.08)',
                border: '1px solid rgba(0,242,255,0.15)',
              }}
            >
              <Users size={20} className="text-cyan-400" />
            </div>
          </div>

          <div
            className="stat-card glass-card rounded-2xl p-4 sm:p-5 flex items-center justify-between hover:border-green-500/20 transition-all duration-300 group"
            style={{ '--stat-color': '#00ff88' }}
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_6px_#00ff88]" />
                <span className="text-[9px] font-black tracking-widest text-green-500/60 uppercase">
                  Processed
                </span>
              </div>
              <p className="text-2xl sm:text-3xl font-mono font-black text-white">
                {stats.links.toLocaleString()}
              </p>
            </div>
            <div
              className="p-3 rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(0,255,136,0.3)]"
              style={{
                background: 'rgba(0,255,136,0.08)',
                border: '1px solid rgba(0,255,136,0.15)',
              }}
            >
              <BarChart3 size={20} className="text-green-400" />
            </div>
          </div>
        </motion.section>

        <motion.footer
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="w-full text-center pb-4 mt-4"
        >
          <div
            className="h-px w-full mb-6"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(0,242,255,0.15), rgba(255,0,255,0.15), transparent)',
            }}
          />
          <p className="text-[10px] font-mono tracking-[0.25em] text-gray-600 mb-1 uppercase">
            © 2026 VincentSensei Downloader · All Rights Reserved
          </p>
          <p className="text-[9px] font-mono text-gray-700 tracking-widest uppercase">
            Powered by VINCENTSENSEI Engine v6
          </p>
        </motion.footer>
      </div>

      <motion.a
  href="https://web.facebook.com/vincent.09123455"
  target="_blank"
  rel="noopener noreferrer"
  initial={{ opacity: 0, scale: 0.8 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ delay: 1 }}
  whileHover={{ scale: 1.08 }}
  whileTap={{ scale: 0.95 }}
  className="donate-btn fixed bottom-5 right-4 sm:right-6 z-50 flex items-center gap-2 text-black font-black text-[11px] px-4 py-2.5 rounded-full cursor-pointer tracking-wider uppercase"
>
  <Facebook size={14} className="fill-black" />
  CONTACT ON FACEBOOK
</motion.a>
    </div>
  );
}
