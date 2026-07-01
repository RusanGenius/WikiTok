import { useState, useEffect, useCallback } from 'react';
import { Article, UserProfile } from '../types';

const STORAGE_KEY = 'wikitok_profile';

const defaultProfile: UserProfile = {
  likes: [],
  favorites: [],
  history: [],
  dislikes: [],
  interests: [],
  dislikedInterests: [],
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
      if (prev.history[0]?.id === article.id) return prev;
      // Remove if already in history to move it to the top
      const filteredHistory = prev.history.filter(a => a.id !== article.id);
      const newHistory = [article, ...filteredHistory].slice(0, 1000); // Keep last 1000
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
      
      // If adding to interests, remove from dislikedInterests to avoid conflicts
      const newDisliked = !isInterested && prev.dislikedInterests?.includes(interest)
        ? prev.dislikedInterests.filter(i => i !== interest)
        : prev.dislikedInterests || [];

      const newProfile = { ...prev, interests: newInterests, dislikedInterests: newDisliked };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile));
      return newProfile;
    });
  }, []);

  const toggleDislikedInterest = useCallback((interest: string) => {
    setProfile(prev => {
      const isDisliked = prev.dislikedInterests?.includes(interest);
      const newDisliked = isDisliked
        ? prev.dislikedInterests.filter(i => i !== interest)
        : [...(prev.dislikedInterests || []), interest];

      // If adding to disliked, remove from liked interests to avoid conflicts
      const newInterests = !isDisliked && prev.interests?.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : prev.interests || [];

      const newProfile = { ...prev, dislikedInterests: newDisliked, interests: newInterests };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile));
      return newProfile;
    });
  }, []);

  const cycleInterest = useCallback((interest: string) => {
    setProfile(prev => {
      const isLiked = prev.interests?.includes(interest);
      const isDisliked = prev.dislikedInterests?.includes(interest);

      let newInterests = prev.interests || [];
      let newDisliked = prev.dislikedInterests || [];

      if (!isLiked && !isDisliked) {
        // Neutral -> Liked
        newInterests = [...newInterests, interest];
      } else if (isLiked) {
        // Liked -> Disliked
        newInterests = newInterests.filter(i => i !== interest);
        newDisliked = [...newDisliked, interest];
      } else {
        // Disliked -> Neutral
        newDisliked = newDisliked.filter(i => i !== interest);
      }

      const newProfile = { ...prev, interests: newInterests, dislikedInterests: newDisliked };
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
    toggleInterest,
    toggleDislikedInterest,
    cycleInterest
  };
}
