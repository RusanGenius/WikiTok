import { createContext, useContext, useState, ReactNode } from 'react';
import { useProfile } from './useProfile';
import { Article, UserProfile } from '../types';

interface AppContextType {
  preferredLang: string;
  setPreferredLang: (lang: string) => void;
  currentView: 'feed' | 'profile';
  setCurrentView: (view: 'feed' | 'profile') => void;
  profile: UserProfile;
  toggleLike: (article: Article) => void;
  toggleFavorite: (article: Article) => void;
  addHistory: (article: Article) => void;
  addDislike: (article: Article) => void;
  clearHistory: () => void;
  toggleInterest: (interest: string) => void;
  toggleDislikedInterest: (interest: string) => void;
  cycleInterest: (interest: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [preferredLang, setPreferredLang] = useState('ru');
  const [currentView, setCurrentView] = useState<'feed' | 'profile'>('feed');
  const profileStore = useProfile();

  if (!profileStore.isLoaded) return null;

  return (
    <AppContext.Provider
      value={{
        preferredLang,
        setPreferredLang,
        currentView,
        setCurrentView,
        ...profileStore,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
}
