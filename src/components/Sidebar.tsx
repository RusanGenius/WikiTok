import { Heart, Globe, ThumbsDown, Languages, User, BookOpen } from 'lucide-react';
import { Article } from '../types';
import { useAppContext } from '../store/AppContext';
import { useState, useEffect } from 'react';
import { fetchAvailableLanguages, fetchArticleSummary } from '../lib/api';

interface SidebarProps {
  article: Article;
  onNext: () => void;
  onTranslate: (newArticle: Article) => void;
}

export default function Sidebar({ article, onNext, onTranslate }: SidebarProps) {
  const { profile, toggleLike, addDislike, setCurrentView } = useAppContext();
  const [showLangs, setShowLangs] = useState(false);
  const [availableLangs, setAvailableLangs] = useState<{ lang: string; '*': string }[]>([]);
  const [isLoadingLang, setIsLoadingLang] = useState(false);

  const isLiked = profile.likes.some(a => a.id === article.id);

  const handleDislike = () => {
    addDislike(article);
    onNext();
  };

  const handleTranslateClick = async () => {
    if (showLangs) {
      setShowLangs(false);
      return;
    }
    setIsLoadingLang(true);
    const langs = await fetchAvailableLanguages(article.title, article.lang);
    setAvailableLangs(langs);
    setShowLangs(true);
    setIsLoadingLang(false);
  };

  const handleSelectLang = async (targetLang: string, targetTitle: string) => {
    setShowLangs(false);
    const translated = await fetchArticleSummary(targetTitle, targetLang);
    if (translated) {
      onTranslate(translated);
    }
  };

  const commonLangs = ['en', 'ru', 'es', 'de', 'fr', 'zh'];

  return (
    <div className="flex flex-col items-center space-y-5 sm:space-y-6 shrink-0">
      {/* Like Button */}
      <div 
        className="flex flex-col items-center group cursor-pointer transition-all duration-150 active:scale-90 hover:scale-105" 
        onClick={() => toggleLike(article)}
      >
        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center mb-1 hover:bg-red-500/80 transition-colors shadow-lg shadow-black/30">
          <Heart className={`w-6 h-6 sm:w-7 sm:h-7 ${isLiked ? 'fill-red-500 text-red-500' : 'text-white'}`} />
        </div>
        <span className="text-[10px] sm:text-xs font-semibold text-white/80">{isLiked ? 'Liked' : 'Like'}</span>
      </div>

      {/* Read Full Article Button */}
      <div className="flex flex-col items-center group transition-all duration-150 active:scale-90 hover:scale-105">
        <a 
          href={article.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-12 h-12 sm:w-14 sm:h-14 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center mb-1 hover:bg-indigo-500 transition-colors cursor-pointer shadow-lg shadow-black/30"
        >
          <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
        </a>
        <span className="text-[10px] sm:text-xs font-semibold text-white/80">Read</span>
      </div>

      {/* Translate Button */}
      <div className="relative flex flex-col items-center group transition-all duration-150 active:scale-90 hover:scale-105">
        <button 
          onClick={handleTranslateClick}
          className="w-12 h-12 sm:w-14 sm:h-14 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center mb-1 hover:bg-white/20 transition-colors cursor-pointer shadow-lg shadow-black/30"
        >
          <Languages className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
        </button>
        <span className="text-[10px] sm:text-xs font-semibold text-white/80">Translate</span>
        
        {showLangs && (
          <div className="absolute right-full mr-4 bottom-0 bg-black/90 backdrop-blur-md border border-white/10 rounded-xl p-2 flex flex-col gap-1 max-h-60 overflow-y-auto min-w-[140px] z-50">
            {isLoadingLang ? (
              <span className="text-sm text-gray-300 px-2 py-1">Loading...</span>
            ) : availableLangs.length === 0 ? (
              <span className="text-sm text-gray-300 px-2 py-1">No translations</span>
            ) : (
              availableLangs
                .filter(l => commonLangs.includes(l.lang))
                .concat(availableLangs.filter(l => !commonLangs.includes(l.lang)))
                .map(l => (
                <button
                  key={l.lang}
                  onClick={() => handleSelectLang(l.lang, l['*'])}
                  className="text-xs sm:text-sm text-white hover:bg-white/20 px-3 py-2 rounded text-left flex justify-between transition-colors duration-100"
                >
                  <span className="uppercase font-bold text-indigo-400 mr-2">{l.lang}</span>
                  <span className="truncate max-w-[90px]">{l['*']}</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Dislike/Less Button */}
      <div 
        className="flex flex-col items-center group cursor-pointer transition-all duration-150 active:scale-90 hover:scale-105" 
        onClick={handleDislike}
      >
        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center mb-1 hover:bg-white/20 transition-colors shadow-lg shadow-black/30">
          <ThumbsDown className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
        </div>
        <span className="text-[10px] sm:text-xs font-semibold text-white/80">Less</span>
      </div>

      {/* Profile Button (matches the top-right style but fits in sidebar) */}
      <div 
        className="flex flex-col items-center group cursor-pointer transition-all duration-150 active:scale-90 hover:scale-105" 
        onClick={() => setCurrentView('profile')}
      >
        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center mb-1 hover:bg-white/20 transition-colors shadow-lg shadow-black/30">
          <User className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
        </div>
        <span className="text-[10px] sm:text-xs font-semibold text-white/80">Profile</span>
      </div>
    </div>
  );
}
