/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

export type MusicTrack = {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  youtubeId: string;
  duration: number; // seconds
  addedAt: string;
};

export type MusicPlaylist = {
  id: string;
  name: string;
  trackIds: string[];
  createdAt: string;
};

export type ColorTheme = 'purple' | 'ocean' | 'rose' | 'forest' | 'sunset' | 'mono';

interface MusicContextType {
  // Library
  tracks: MusicTrack[];
  addTracks: (tracks: MusicTrack[]) => void;
  removeTrack: (id: string) => void;
  clearAllData: () => void;

  // Playlists
  playlists: MusicPlaylist[];
  createPlaylist: (name: string, trackIds?: string[]) => string;
  updatePlaylist: (id: string, name: string, trackIds: string[]) => void;
  deletePlaylist: (id: string) => void;

  // Queue
  queue: string[];
  setQueue: (trackIds: string[]) => void;
  addToQueue: (trackId: string) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  queueIndex: number;
  setQueueIndex: (i: number) => void;

  // Player state
  currentTrackId: string | null;
  isPlaying: boolean;
  isLoop: boolean;
  isShuffle: boolean;
  volume: number;
  progress: number; // 0–100
  duration: number; // seconds
  isMusicBarVisible: boolean;

  // Player controls
  playTrack: (trackId: string, queueIds?: string[]) => void;
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  toggleLoop: () => void;
  toggleShuffle: () => void;
  setVolume: (vol: number) => void;
  seekTo: (percent: number) => void;
  setProgress: (p: number) => void;
  setDuration: (d: number) => void;
  setIsPlaying: (v: boolean) => void;

  // Settings
  colorTheme: ColorTheme;
  setColorTheme: (theme: ColorTheme) => void;

  // Config
  exportConfig: () => void;
  importConfig: (jsonStr: string) => void;

  // Modals
  isAddTxtOpen: boolean;
  setIsAddTxtOpen: (v: boolean) => void;
  isCreatePlaylistOpen: boolean;
  setIsCreatePlaylistOpen: (v: boolean) => void;
  isQueueOpen: boolean;
  setIsQueueOpen: (v: boolean) => void;
  isMusicSettingsOpen: boolean;
  setIsMusicSettingsOpen: (v: boolean) => void;
  isMusicPartyOpen: boolean;
  setIsMusicPartyOpen: (v: boolean) => void;

  // P2P Music Party
  musicPeerId: string | null;
  musicRoomId: string | null;
  isMusicHost: boolean;
  musicPeers: string[];
  musicMessages: any[];
  initMusicHost: () => Promise<string>;
  joinMusicRoom: (id: string) => Promise<boolean>;
  leaveMusicRoom: () => void;
  sendMusicP2P: (type: string, payload: any) => void;
  setMusicSyncCallback: (cb: (data: any) => void) => void;

  // YT Player ref
  ytPlayerRef: React.MutableRefObject<any>;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const MusicContext = createContext<MusicContextType | undefined>(undefined);

// ─── Provider ────────────────────────────────────────────────────────────────

export const MusicProvider = ({ children }: { children: React.ReactNode }) => {
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [playlists, setPlaylists] = useState<MusicPlaylist[]>([]);
  const [queue, setQueueState] = useState<string[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoop, setIsLoop] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [volume, setVolumeState] = useState(80);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMusicBarVisible, setIsMusicBarVisible] = useState(false);
  const [colorTheme, setColorThemeState] = useState<ColorTheme>('purple');

  // Modals
  const [isAddTxtOpen, setIsAddTxtOpen] = useState(false);
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isMusicSettingsOpen, setIsMusicSettingsOpen] = useState(false);
  const [isMusicPartyOpen, setIsMusicPartyOpen] = useState(false);

  // P2P
  const [musicPeerId, setMusicPeerId] = useState<string | null>(null);
  const [musicRoomId, setMusicRoomId] = useState<string | null>(null);
  const [isMusicHost, setIsMusicHost] = useState(false);
  const [musicPeers, setMusicPeers] = useState<string[]>([]);
  const [musicMessages, setMusicMessages] = useState<any[]>([]);
  const isMusicHostRef = useRef(false);
  const musicPeerRef = useRef<any>(null);
  const musicConnsRef = useRef<{ [id: string]: any }>({});
  const musicSyncCallbackRef = useRef<((data: any) => void) | null>(null);
  const isMusicPartyOpenRef = useRef(false);

  const ytPlayerRef = useRef<any>(null);

  // ─── LocalStorage Load ─────────────────────────────────────────────────

  useEffect(() => {
    try {
      const savedTracks = localStorage.getItem('tani_music_tracks');
      if (savedTracks) setTracks(JSON.parse(savedTracks));

      const savedPlaylists = localStorage.getItem('tani_music_playlists');
      if (savedPlaylists) setPlaylists(JSON.parse(savedPlaylists));

      const savedQueue = localStorage.getItem('tani_music_queue');
      if (savedQueue) setQueueState(JSON.parse(savedQueue));

      const savedCurrentTrack = localStorage.getItem('tani_music_current');
      if (savedCurrentTrack) {
        setCurrentTrackId(savedCurrentTrack);
        setIsMusicBarVisible(true);
      }

      const savedVolume = localStorage.getItem('tani_music_volume');
      if (savedVolume) setVolumeState(Number(savedVolume));

      const savedTheme = localStorage.getItem('tani_music_theme') as ColorTheme;
      if (savedTheme) setColorThemeState(savedTheme);

      const savedLoop = localStorage.getItem('tani_music_loop');
      if (savedLoop) setIsLoop(savedLoop === 'true');

      const savedShuffle = localStorage.getItem('tani_music_shuffle');
      if (savedShuffle) setIsShuffle(savedShuffle === 'true');
    } catch (e) {
      console.error('MusicStore: Failed to load from localStorage', e);
    }
  }, []);

  useEffect(() => {
    isMusicPartyOpenRef.current = isMusicPartyOpen;
  }, [isMusicPartyOpen]);

  // ─── Track Management ──────────────────────────────────────────────────

  const addTracks = useCallback((newTracks: MusicTrack[]) => {
    setTracks(prev => {
      const existingIds = new Set(prev.map(t => t.youtubeId));
      const filtered = newTracks.filter(t => !existingIds.has(t.youtubeId));
      const updated = [...prev, ...filtered];
      localStorage.setItem('tani_music_tracks', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeTrack = useCallback((id: string) => {
    setTracks(prev => {
      const updated = prev.filter(t => t.id !== id);
      localStorage.setItem('tani_music_tracks', JSON.stringify(updated));
      return updated;
    });
    setQueueState(prev => {
      const updated = prev.filter(tid => tid !== id);
      localStorage.setItem('tani_music_queue', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // ─── Playlist Management ───────────────────────────────────────────────

  const createPlaylist = useCallback((name: string, trackIds: string[] = []): string => {
    const id = `pl_${Date.now()}`;
    const playlist: MusicPlaylist = {
      id,
      name,
      trackIds,
      createdAt: new Date().toISOString(),
    };
    setPlaylists(prev => {
      const updated = [...prev, playlist];
      localStorage.setItem('tani_music_playlists', JSON.stringify(updated));
      return updated;
    });
    return id;
  }, []);

  const updatePlaylist = useCallback((id: string, name: string, trackIds: string[]) => {
    setPlaylists(prev => {
      const updated = prev.map(p => p.id === id ? { ...p, name, trackIds } : p);
      localStorage.setItem('tani_music_playlists', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const deletePlaylist = useCallback((id: string) => {
    setPlaylists(prev => {
      const updated = prev.filter(p => p.id !== id);
      localStorage.setItem('tani_music_playlists', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // ─── Queue Management ──────────────────────────────────────────────────

  const setQueue = useCallback((trackIds: string[]) => {
    setQueueState(trackIds);
    localStorage.setItem('tani_music_queue', JSON.stringify(trackIds));
  }, []);

  const addToQueue = useCallback((trackId: string) => {
    setQueueState(prev => {
      const updated = [...prev, trackId];
      localStorage.setItem('tani_music_queue', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeFromQueue = useCallback((index: number) => {
    setQueueState(prev => {
      const updated = [...prev];
      updated.splice(index, 1);
      localStorage.setItem('tani_music_queue', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearQueue = useCallback(() => {
    setQueueState([]);
    localStorage.removeItem('tani_music_queue');
  }, []);

  // ─── Player Controls ───────────────────────────────────────────────────

  const playTrack = useCallback((trackId: string, queueIds?: string[]) => {
    setCurrentTrackId(trackId);
    setIsPlaying(true);
    setIsMusicBarVisible(true);
    setProgress(0);
    localStorage.setItem('tani_music_current', trackId);
    if (queueIds) {
      const idx = queueIds.indexOf(trackId);
      setQueueState(queueIds);
      setQueueIndex(idx >= 0 ? idx : 0);
      localStorage.setItem('tani_music_queue', JSON.stringify(queueIds));
    } else {
      setQueueState(prev => {
        if (!prev.includes(trackId)) {
          const updated = [trackId, ...prev];
          localStorage.setItem('tani_music_queue', JSON.stringify(updated));
          return updated;
        }
        const idx = prev.indexOf(trackId);
        setQueueIndex(idx);
        return prev;
      });
    }
  }, []);

  const togglePlay = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const nextTrack = useCallback(() => {
    setQueueState(prevQueue => {
      if (prevQueue.length === 0) return prevQueue;
      setQueueIndex(prevIdx => {
        let nextIdx: number;
        if (isShuffle) {
          nextIdx = Math.floor(Math.random() * prevQueue.length);
        } else {
          nextIdx = (prevIdx + 1) % prevQueue.length;
        }
        const nextId = prevQueue[nextIdx];
        setCurrentTrackId(nextId);
        setProgress(0);
        setIsPlaying(true);
        localStorage.setItem('tani_music_current', nextId);
        return nextIdx;
      });
      return prevQueue;
    });
  }, [isShuffle]);

  const prevTrack = useCallback(() => {
    setQueueState(prevQueue => {
      if (prevQueue.length === 0) return prevQueue;
      setQueueIndex(prevIdx => {
        const prevIdxNew = prevIdx === 0 ? prevQueue.length - 1 : prevIdx - 1;
        const prevId = prevQueue[prevIdxNew];
        setCurrentTrackId(prevId);
        setProgress(0);
        setIsPlaying(true);
        localStorage.setItem('tani_music_current', prevId);
        return prevIdxNew;
      });
      return prevQueue;
    });
  }, []);

  const toggleLoop = useCallback(() => {
    setIsLoop(prev => {
      localStorage.setItem('tani_music_loop', String(!prev));
      return !prev;
    });
  }, []);

  const toggleShuffle = useCallback(() => {
    setIsShuffle(prev => {
      localStorage.setItem('tani_music_shuffle', String(!prev));
      return !prev;
    });
  }, []);

  const setVolume = useCallback((vol: number) => {
    setVolumeState(vol);
    localStorage.setItem('tani_music_volume', String(vol));
    if (ytPlayerRef.current?.setVolume) ytPlayerRef.current.setVolume(vol);
  }, []);

  const seekTo = useCallback((percent: number) => {
    if (ytPlayerRef.current?.seekTo && duration > 0) {
      ytPlayerRef.current.seekTo((percent / 100) * duration, true);
      setProgress(percent);
    }
  }, [duration]);

  // ─── Settings ──────────────────────────────────────────────────────────

  const setColorTheme = useCallback((theme: ColorTheme) => {
    setColorThemeState(theme);
    localStorage.setItem('tani_music_theme', theme);
  }, []);

  const exportConfig = useCallback(() => {
    const config = {
      version: '1.0',
      tracks,
      playlists,
      settings: { colorTheme, isLoop, isShuffle, volume },
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tani-music-config-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [tracks, playlists, colorTheme, isLoop, isShuffle, volume]);

  const importConfig = useCallback((jsonStr: string) => {
    try {
      const config = JSON.parse(jsonStr);
      if (config.tracks) {
        setTracks(config.tracks);
        localStorage.setItem('tani_music_tracks', JSON.stringify(config.tracks));
      }
      if (config.playlists) {
        setPlaylists(config.playlists);
        localStorage.setItem('tani_music_playlists', JSON.stringify(config.playlists));
      }
      if (config.settings) {
        if (config.settings.colorTheme) setColorTheme(config.settings.colorTheme);
        if (config.settings.volume !== undefined) setVolume(config.settings.volume);
        if (config.settings.isLoop !== undefined) setIsLoop(config.settings.isLoop);
        if (config.settings.isShuffle !== undefined) setIsShuffle(config.settings.isShuffle);
      }
    } catch (e) {
      console.error('MusicStore: Failed to import config', e);
    }
  }, [setColorTheme, setVolume]);

  const clearAllData = useCallback(() => {
    setTracks([]);
    setPlaylists([]);
    setQueueState([]);
    setCurrentTrackId(null);
    setIsPlaying(false);
    setIsMusicBarVisible(false);
    const keys = ['tani_music_tracks', 'tani_music_playlists', 'tani_music_queue', 'tani_music_current'];
    keys.forEach(k => localStorage.removeItem(k));
  }, []);

  // ─── P2P Music Party ───────────────────────────────────────────────────

  const setMusicSyncCallback = useCallback((cb: (data: any) => void) => {
    musicSyncCallbackRef.current = cb;
  }, []);

  const handleMusicIncomingData = useCallback((data: any) => {
    if (data.type === 'MUSIC_CHAT') {
      setMusicMessages(prev => [...prev, data.payload]);
    } else if (data.type === 'MUSIC_SYNC') {
      if (musicSyncCallbackRef.current) musicSyncCallbackRef.current(data.payload);
      if (isMusicHostRef.current) {
        Object.values(musicConnsRef.current).forEach((conn: any) => {
          if (conn.peer !== data.payload.senderId) conn.send(data);
        });
      }
    }
  }, []);

  const initMusicHost = async (): Promise<string> => {
    const PeerClass = (await import('peerjs')).default;
    const peer = new PeerClass();
    return new Promise<string>((resolve) => {
      peer.on('open', (id) => {
        setMusicPeerId(id); setMusicRoomId(id); setIsMusicHost(true);
        isMusicHostRef.current = true; setMusicMessages([]);
        musicPeerRef.current = peer;
        resolve(id);
      });
      peer.on('connection', (conn) => {
        conn.on('open', () => {
          musicConnsRef.current[conn.peer] = conn;
          setMusicPeers(prev => [...prev, conn.peer]);
        });
        conn.on('data', handleMusicIncomingData);
        conn.on('close', () => {
          delete musicConnsRef.current[conn.peer];
          setMusicPeers(prev => prev.filter(p => p !== conn.peer));
        });
      });
    });
  };

  const joinMusicRoom = async (id: string): Promise<boolean> => {
    const PeerClass = (await import('peerjs')).default;
    const peer = new PeerClass();
    return new Promise<boolean>((resolve) => {
      peer.on('open', (myId) => {
        setMusicPeerId(myId); setIsMusicHost(false); isMusicHostRef.current = false;
        musicPeerRef.current = peer;
        const conn = peer.connect(id);
        conn.on('open', () => {
          setMusicRoomId(id); musicConnsRef.current[id] = conn; resolve(true);
        });
        conn.on('data', handleMusicIncomingData);
        conn.on('close', () => { setMusicRoomId(null); delete musicConnsRef.current[id]; });
        conn.on('error', () => resolve(false));
      });
      peer.on('error', () => resolve(false));
    });
  };

  const sendMusicP2P = useCallback((type: string, payload: any) => {
    const data = { type, payload: { ...payload, senderId: musicPeerId } };
    if (type === 'MUSIC_CHAT') setMusicMessages(prev => [...prev, data.payload]);
    Object.values(musicConnsRef.current).forEach((conn: any) => conn.send(data));
  }, [musicPeerId]);

  const leaveMusicRoom = useCallback(() => {
    if (musicPeerRef.current) musicPeerRef.current.destroy();
    musicConnsRef.current = {};
    setMusicPeerId(null); setMusicRoomId(null); setIsMusicHost(false);
    isMusicHostRef.current = false; setMusicPeers([]); setMusicMessages([]);
  }, []);

  useEffect(() => {
    return () => { if (musicPeerRef.current) musicPeerRef.current.destroy(); };
  }, []);

  // ─── Context Value ─────────────────────────────────────────────────────

  return (
    <MusicContext.Provider value={{
      tracks, addTracks, removeTrack, clearAllData,
      playlists, createPlaylist, updatePlaylist, deletePlaylist,
      queue, setQueue, addToQueue, removeFromQueue, clearQueue, queueIndex, setQueueIndex,
      currentTrackId, isPlaying, isLoop, isShuffle, volume, progress, duration, isMusicBarVisible,
      playTrack, togglePlay, nextTrack, prevTrack, toggleLoop, toggleShuffle,
      setVolume, seekTo, setProgress, setDuration, setIsPlaying,
      colorTheme, setColorTheme,
      exportConfig, importConfig,
      isAddTxtOpen, setIsAddTxtOpen,
      isCreatePlaylistOpen, setIsCreatePlaylistOpen,
      isQueueOpen, setIsQueueOpen,
      isMusicSettingsOpen, setIsMusicSettingsOpen,
      isMusicPartyOpen, setIsMusicPartyOpen,
      musicPeerId, musicRoomId, isMusicHost, musicPeers, musicMessages,
      initMusicHost, joinMusicRoom, leaveMusicRoom, sendMusicP2P, setMusicSyncCallback,
      ytPlayerRef,
    }}>
      {children}
    </MusicContext.Provider>
  );
};

export const useMusicContext = () => {
  const context = useContext(MusicContext);
  if (!context) throw new Error('useMusicContext must be used within MusicProvider');
  return context;
};
