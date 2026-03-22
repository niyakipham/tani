/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

export type UserProfile = { name: string; avatar: string };
export type Movie = { slug: string; name: string; thumb_url: string; epName?: string; time?: string; poster_url?: string; progress?: number };

interface AppContextType {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  userProfile: UserProfile | null;
  setUserProfile: (profile: UserProfile) => void;
  preferences: string[];
  setPreferences: (prefs: string[]) => void;
  favorites: Movie[];
  toggleFavorite: (movie: Movie) => void;
  history: Movie[];
  addToHistory: (movie: Movie, epName: string, progress?: number) => void;
  updateHistoryProgress: (slug: string, progress: number) => void;
  downloads: Movie[];
  addDownload: (movie: Movie, epName: string) => void;
  removeFromList: (listName: 'favorites' | 'history' | 'downloads', index: number) => void;
  isSidePanelOpen: boolean;
  sidePanelTab: 'fav' | 'history' | 'download';
  openSidePanel: (tab: 'fav' | 'history' | 'download') => void;
  closeSidePanel: () => void;
  isOnboardingOpen: boolean;
  setIsOnboardingOpen: (isOpen: boolean) => void;
  isStoryModeOpen: boolean;
  setIsStoryModeOpen: (isOpen: boolean) => void;
  isScanModalOpen: boolean;
  setIsScanModalOpen: (isOpen: boolean) => void;
  isNotificationModalOpen: boolean;
  setIsNotificationModalOpen: (isOpen: boolean) => void;
  notificationSettings: {
    newEpisodes: boolean;
    recommendations: boolean;
    systemUpdates: boolean;
  };
  setNotificationSettings: (settings: { newEpisodes: boolean; recommendations: boolean; systemUpdates: boolean }) => void;
  currentMovieSlug: string | null;
  setCurrentMovieSlug: (slug: string) => void;
  recentSearches: string[];
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  isWatchPartyOpen: boolean;
  setIsWatchPartyOpen: (isOpen: boolean) => void;
  peerId: string | null;
  roomId: string | null;
  isHost: boolean;
  peers: string[];
  messages: any[];
  initHost: () => Promise<string>;
  joinRoom: (id: string) => Promise<boolean>;
  leaveRoom: () => void;
  sendP2PMessage: (type: string, payload: any) => void;
  setVideoSyncCallback: (cb: (data: any) => void) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [preferences, setPreferences] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<Movie[]>([]);
  const [history, setHistory] = useState<Movie[]>([]);
  const [downloads, setDownloads] = useState<Movie[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [sidePanelTab, setSidePanelTab] = useState<'fav' | 'history' | 'download'>('fav');
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(true);
  const [isStoryModeOpen, setIsStoryModeOpen] = useState(false);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    newEpisodes: true,
    recommendations: true,
    systemUpdates: true,
  });
  const [currentMovieSlug, setCurrentMovieSlug] = useState<string | null>(null);
  const [isWatchPartyOpen, setIsWatchPartyOpen] = useState(false);

  // P2P State
  const [peerId, setPeerId] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [peers, setPeers] = useState<string[]>([]);
  const [messages, setMessages] = useState<any[]>([]);

  const peerRef = useRef<any>(null);
  const connsRef = useRef<{ [id: string]: any }>({});
  const videoSyncCallbackRef = useRef<((data: any) => void) | null>(null);

  const setVideoSyncCallback = useCallback((cb: (data: any) => void) => {
    videoSyncCallbackRef.current = cb;
  }, []);

  const handleIncomingData = useCallback((data: any) => {
    if (data.type === 'CHAT') {
      setMessages(prev => [...prev, data.payload]);
      if (isHost) {
        Object.values(connsRef.current).forEach(conn => {
          if (conn.peer !== data.payload.senderId) conn.send(data);
        });
      }
    } else if (data.type === 'VIDEO_SYNC') {
      if (videoSyncCallbackRef.current) videoSyncCallbackRef.current(data.payload);
      if (isHost) {
        Object.values(connsRef.current).forEach(conn => {
          if (conn.peer !== data.payload.senderId) conn.send(data);
        });
      }
    }
  }, [isHost]);

  const initHost = async () => {
    const PeerClass = (await import('peerjs')).default;
    const peer = new PeerClass();
    return new Promise<string>((resolve) => {
      peer.on('open', (id) => {
        setPeerId(id); setRoomId(id); setIsHost(true); setMessages([]);
        peerRef.current = peer;
        resolve(id);
      });
      peer.on('connection', (conn) => {
        conn.on('open', () => {
          connsRef.current[conn.peer] = conn;
          setPeers(prev => [...prev, conn.peer]);
        });
        conn.on('data', handleIncomingData);
        conn.on('close', () => {
          delete connsRef.current[conn.peer];
          setPeers(prev => prev.filter(p => p !== conn.peer));
        });
      });
    });
  };

  const joinRoom = async (id: string) => {
    const PeerClass = (await import('peerjs')).default;
    const peer = new PeerClass();
    return new Promise<boolean>((resolve) => {
      peer.on('open', (myId) => {
        setPeerId(myId); setIsHost(false); peerRef.current = peer;
        const conn = peer.connect(id);
        conn.on('open', () => {
          setRoomId(id); connsRef.current[id] = conn; resolve(true);
        });
        conn.on('data', handleIncomingData);
        conn.on('close', () => { setRoomId(null); delete connsRef.current[id]; });
        conn.on('error', () => resolve(false));
      });
      peer.on('error', () => resolve(false));
    });
  };

  const sendP2PMessage = useCallback((type: string, payload: any) => {
    const data = { type, payload: { ...payload, senderId: peerId } };
    if (type === 'CHAT') setMessages(prev => [...prev, data.payload]);
    Object.values(connsRef.current).forEach(conn => conn.send(data));
  }, [peerId]);

  const leaveRoom = useCallback(() => {
    if (peerRef.current) peerRef.current.destroy();
    connsRef.current = {}; setPeerId(null); setRoomId(null); setIsHost(false); setPeers([]); setMessages([]);
  }, []);

  useEffect(() => {
    return () => { if (peerRef.current) peerRef.current.destroy(); };
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem('tanime_theme') as 'dark' | 'light' || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    const savedProfile = localStorage.getItem('tanime_profile');
    if (savedProfile) setUserProfile(JSON.parse(savedProfile));

    const savedPrefs = localStorage.getItem('tanime_prefs');
    if (savedPrefs) {
      setPreferences(JSON.parse(savedPrefs));
      setIsOnboardingOpen(false);
    }

    const savedFavs = localStorage.getItem('tanime_favorites');
    if (savedFavs) setFavorites(JSON.parse(savedFavs));

    const savedHistory = localStorage.getItem('tanime_history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));

    const savedDownloads = localStorage.getItem('tanime_downloads');
    if (savedDownloads) setDownloads(JSON.parse(savedDownloads));

    const savedNotifSettings = localStorage.getItem('tanime_notif_settings');
    if (savedNotifSettings) setNotificationSettings(JSON.parse(savedNotifSettings));

    const savedRecentSearches = localStorage.getItem('tanime_recent_searches');
    if (savedRecentSearches) setRecentSearches(JSON.parse(savedRecentSearches));
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('tanime_theme', newTheme);
    if (newTheme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  };

  const toggleFavorite = (movie: Movie) => {
    setFavorites(prev => {
      const exists = prev.find(f => f.slug === movie.slug);
      let newFavs;
      if (exists) {
        newFavs = prev.filter(f => f.slug !== movie.slug);
      } else {
        newFavs = [{ slug: movie.slug, name: movie.name, thumb_url: movie.thumb_url }, ...prev];
      }
      localStorage.setItem('tanime_favorites', JSON.stringify(newFavs));
      return newFavs;
    });
  };

  const addToHistory = useCallback((movie: Movie, epName: string, progress?: number) => {
    setHistory(prev => {
      const now = new Date();
      const timeStr = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')} - ${now.getDate()}/${now.getMonth()+1}/${now.getFullYear()}`;
      const existing = prev.find(h => h.slug === movie.slug);
      const filtered = prev.filter(h => h.slug !== movie.slug);
      
      let newProgress = progress !== undefined ? progress : 0;
      if (progress === undefined && existing && existing.epName === epName) {
        newProgress = existing.progress || 0;
      }

      const newHistory = [{ slug: movie.slug, name: movie.name, thumb_url: movie.thumb_url, epName, time: timeStr, progress: newProgress }, ...filtered].slice(0, 30);
      localStorage.setItem('tanime_history', JSON.stringify(newHistory));
      return newHistory;
    });
  }, []);

  const updateHistoryProgress = useCallback((slug: string, increment: number) => {
    setHistory(prev => {
      const newHistory = prev.map(h => 
        h.slug === slug 
          ? { ...h, progress: Math.min(100, Math.max(0, (h.progress || 0) + increment)) } 
          : h
      );
      localStorage.setItem('tanime_history', JSON.stringify(newHistory));
      return newHistory;
    });
  }, []);

  const addDownload = (movie: Movie, epName: string) => {
    setDownloads(prev => {
      if (prev.some(d => d.slug === movie.slug && d.epName === epName)) return prev;
      const newDownloads = [{ slug: movie.slug, name: movie.name, thumb_url: movie.thumb_url, epName, time: 'Đã tải hôm nay' }, ...prev];
      localStorage.setItem('tanime_downloads', JSON.stringify(newDownloads));
      return newDownloads;
    });
  };

  const removeFromList = (listName: 'favorites' | 'history' | 'downloads', index: number) => {
    if (listName === 'favorites') {
      const newFavs = [...favorites];
      newFavs.splice(index, 1);
      setFavorites(newFavs);
      localStorage.setItem('tanime_favorites', JSON.stringify(newFavs));
    } else if (listName === 'history') {
      const newHistory = [...history];
      newHistory.splice(index, 1);
      setHistory(newHistory);
      localStorage.setItem('tanime_history', JSON.stringify(newHistory));
    } else if (listName === 'downloads') {
      const newDownloads = [...downloads];
      newDownloads.splice(index, 1);
      setDownloads(newDownloads);
      localStorage.setItem('tanime_downloads', JSON.stringify(newDownloads));
    }
  };

  const openSidePanel = (tab: 'fav' | 'history' | 'download') => {
    setSidePanelTab(tab);
    setIsSidePanelOpen(true);
  };

  const closeSidePanel = () => setIsSidePanelOpen(false);

  const addRecentSearch = useCallback((query: string) => {
    if (!query.trim()) return;
    setRecentSearches(prev => {
      const filtered = prev.filter(q => q.toLowerCase() !== query.toLowerCase());
      const newSearches = [query, ...filtered].slice(0, 5); // Keep top 5
      localStorage.setItem('tanime_recent_searches', JSON.stringify(newSearches));
      return newSearches;
    });
  }, []);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    localStorage.removeItem('tanime_recent_searches');
  }, []);

  return (
    <AppContext.Provider value={{
      theme, toggleTheme, userProfile, setUserProfile, preferences, setPreferences,
      favorites, toggleFavorite, history, addToHistory, updateHistoryProgress, downloads, addDownload, removeFromList,
      isSidePanelOpen, sidePanelTab, openSidePanel, closeSidePanel,
      isOnboardingOpen, setIsOnboardingOpen, isStoryModeOpen, setIsStoryModeOpen,
      isScanModalOpen, setIsScanModalOpen, isNotificationModalOpen, setIsNotificationModalOpen,
      notificationSettings, setNotificationSettings, currentMovieSlug, setCurrentMovieSlug,
      recentSearches, addRecentSearch, clearRecentSearches,
      isWatchPartyOpen, setIsWatchPartyOpen,
      peerId, roomId, isHost, peers, messages, initHost, joinRoom, leaveRoom, sendP2PMessage, setVideoSyncCallback
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
