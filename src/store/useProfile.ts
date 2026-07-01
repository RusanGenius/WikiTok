import { useState, useEffect, useCallback } from 'react';
import { Article, UserProfile } from '../types';

const STORAGE_KEY = 'wikitok_profile';

const defaultProfile: UserProfile = {
  likes: [],
  favorites: [],
  history: [],
  dislikes: [],
  interests: [],
};

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setProfile({ ...defaultProfile, ...JSON.parse(saved) });
      } catch (e) {
        console.error("Failed to parse profile", e);
      }
    }
    setIsLoaded(true);
  }, []);

  const saveProfile = useCallback((newProfile: UserProfile) => {
    setProfile(newProfile);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile));
  }, []);

  const toggleLike = useCallback((article: Article) => {
    setProfile(prev => {
      const isLiked = prev.likes.some(a => a.id === article.id);
      const newLikes = isLiked 
        ? prev.likes.filter(a => a.id !== article.id)
        : [article, ...prev.likes];
      const newProfile = { ...prev, likes: newLikes };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile));
      return newProfile;
    });
  }, []);

  const toggleFavorite = useCallback((article: Article) => {
    setProfile(prev => {
      const isFav = prev.favorites.some(a => a.id === article.id);
      const newFavs = isFav 
        ? prev.favorites.filter(a => a.id !== article.id)
        : [article, ...prev.favorites];
      const newProfile = { ...prev, favorites: newFavs };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile));
      return newProfile;
    });
  }, []);

  const addHistory = useCallback((article: Article) => {
    setProfile(prev => {
      // Remove if already in history to move it to the top
      const filteredHistory = prev.history.filter(a => a.id !== article.id);
      const newHistory = [article, ...filteredHistory].slice(0, 200); // Keep last 200
      const newProfile = { ...prev, history: newHistory };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile));
      return newProfile;
    });
  }, []);

  const addDislike = useCallback((article: Article) => {
    setProfile(prev => {
      if (prev.dislikes.includes(article.title)) return prev;
      const newProfile = { ...prev, dislikes: [...prev.dislikes, article.title] };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile));
      return newProfile;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setProfile(prev => {
      const newProfile = { ...prev, history: [] };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile));
      return newProfile;
    });
  }, []);

  const toggleInterest = useCallback((interest: string) => {
    setProfile(prev => {
      const isInterested = prev.interests?.includes(interest);
      const newInterests = isInterested
        ? prev.interests.filter(i => i !== interest)
        : [...(prev.interests || []), interest];
      const newProfile = { ...prev, interests: newInterests };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile));
      return newProfile;
    });
  }, []);

  return {
    profile,
    isLoaded,
    toggleLike,
    toggleFavorite,
    addHistory,
    addDislike,
    clearHistory,
    toggleInterest
  };
}
