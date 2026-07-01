import React, { useState, useEffect, useRef, useCallback } from 'react';
import { fetchRandomArticles, fetchRelatedArticles, searchArticles } from '../lib/api';
import { Article } from '../types';
import ArticleCard from './ArticleCard';
import { useAppContext } from '../store/AppContext';
import { Globe, User } from 'lucide-react';

export default function Feed() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const { preferredLang, setPreferredLang, addHistory, profile, setCurrentView } = useAppContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const loadMore = useCallback(async (count = 3) => {
    let newArticles: Article[] = [];
    
    // Smart recommendation logic
    const hasLikes = profile.likes.length > 0;
    const hasInterests = profile.interests && profile.interests.length > 0;
    
    const strategies = ['random'];
    if (hasLikes) strategies.push('related');
    if (hasInterests) strategies.push('interest');
    
    // Pick a random strategy
    const strategy = strategies[Math.floor(Math.random() * strategies.length)];
    
    try {
      if (strategy === 'related') {
        const sourceList = profile.likes;
        const randomSource = sourceList[Math.floor(Math.random() * sourceList.length)];
        newArticles = await fetchRelatedArticles(randomSource.title, preferredLang, count);
      } else if (strategy === 'interest') {
        const randomInterest = profile.interests[Math.floor(Math.random() * profile.interests.length)];
        const searchRes = await searchArticles(randomInterest, preferredLang, 1);
        if (searchRes.length > 0) {
            newArticles = await fetchRelatedArticles(searchRes[0].title, preferredLang, count);
        }
      }
    } catch(e) {
        console.error("Recommendation strategy failed, falling back to random", e);
    }
    
    // Fallback or if strategy was 'random'
    if (newArticles.length === 0) {
      newArticles = await fetchRandomArticles(preferredLang, count);
    }
    
    // Filter out dislikes
    const filtered = newArticles.filter(a => !profile.dislikes.includes(a.title));
    if (filtered.length > 0) {
      setArticles(prev => {
        // filter out duplicates
        const existingIds = new Set(prev.map(a => a.id));
        const uniqueNew = filtered.filter(a => !existingIds.has(a.id));
        return [...prev, ...uniqueNew];
      });
    } else {
      // Try again if all were filtered
      loadMore(count);
    }
  }, [preferredLang, profile.dislikes, profile.likes, profile.interests]);

  useEffect(() => {
    setArticles([]);
    setLoading(true);
    loadMore(5).then(() => setLoading(false));
  }, [preferredLang]);

  useEffect(() => {
    if (articles[currentIndex]) {
      addHistory(articles[currentIndex]);
    }
    
    // Load more when nearing the end
    if (currentIndex >= articles.length - 2) {
      loadMore(3);
    }
  }, [currentIndex, articles, addHistory, loadMore]);

  const handleRefresh = useCallback(async () => {
    setLoading(true);
    setArticles([]);
    setCurrentIndex(0);
    await loadMore(5);
    setLoading(false);
  }, [loadMore]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const index = Math.round(container.scrollTop / container.clientHeight);
    if (index !== currentIndex) {
      setCurrentIndex(index);
    }
  };

  const scrollToNext = () => {
    if (containerRef.current) {
      const nextIndex = currentIndex + 1;
      containerRef.current.scrollTo({
        top: nextIndex * containerRef.current.clientHeight,
        behavior: 'smooth'
      });
    }
  };

  const updateArticle = (index: number, updated: Article) => {
    setArticles(prev => {
      const copy = [...prev];
      copy[index] = updated;
      return copy;
    });
  };

  if (loading && articles.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black text-white">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-gray-600 border-t-white rounded-full animate-spin mb-4" />
          <p>Loading Wikipedia...</p>
        </div>
      </div>
    );
  }

  const langs = ['en', 'ru', 'es', 'fr', 'de'];

  return (
    <div className="relative w-full h-full bg-black flex flex-col overflow-hidden">
      {/* Top Header Navigation */}
      <header className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center px-8 py-6 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
        <button 
          onClick={handleRefresh}
          className="flex items-center space-x-2 pointer-events-auto cursor-pointer group active:scale-95 transition-transform duration-150 focus:outline-none"
        >
          <div className="w-6 h-6 bg-white text-black rounded flex items-center justify-center font-extrabold text-sm shadow-md shadow-white/10 group-hover:brightness-90 transition-all select-none">W</div>
          <span className="text-xl font-light tracking-tighter text-white select-none">Wiki<span className="font-bold">Tok</span></span>
        </button>
        
        <div className="flex items-center space-x-6 pointer-events-auto">
          <div className="flex bg-white/10 rounded-full px-4 py-1.5 backdrop-blur-md border border-white/10 relative group">
            {langs.slice(0, 3).map(l => (
              <button
                key={l}
                onClick={() => setPreferredLang(l)}
                className={`px-3 text-sm font-medium uppercase transition-colors ${preferredLang === l ? 'text-white' : 'text-white/40 hover:text-white/80'}`}
              >
                {l}
              </button>
            ))}
            {/* Dropdown for other languages if needed */}
            <div className="absolute right-0 top-full mt-2 bg-black/80 backdrop-blur-md rounded-xl p-2 hidden group-hover:flex flex-col gap-1 w-24 border border-white/10">
              {langs.slice(3).map(l => (
                <button
                  key={l}
                  onClick={() => setPreferredLang(l)}
                  className={`uppercase text-sm py-2 px-3 rounded text-left ${preferredLang === l ? 'text-white font-bold bg-white/20' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Algorithm Insight Indicator (Subtle) */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex flex-col space-y-2 pointer-events-none hidden sm:flex">
        <div className="w-1 h-8 bg-indigo-500 rounded-full"></div>
        <div className="w-1 h-4 bg-white/20 rounded-full"></div>
        <div className="w-1 h-4 bg-white/20 rounded-full"></div>
        <div className="w-1 h-4 bg-white/20 rounded-full"></div>
      </div>

      {/* Feed Container */}
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 w-full h-full overflow-y-scroll snap-y snap-mandatory hide-scrollbar relative z-10"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {articles.map((article, index) => (
          <ArticleCard 
            key={index} 
            article={article} 
            onNext={scrollToNext}
            onUpdateArticle={(updated) => updateArticle(index, updated)}
          />
        ))}
      </div>
      
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
