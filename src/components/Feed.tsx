import React, { useState, useEffect, useRef, useCallback } from 'react';
import { fetchRandomArticles, fetchRelatedArticles, searchArticles } from '../lib/api';
import { Article } from '../types';
import ArticleCard from './ArticleCard';
import Sidebar from './Sidebar';
import { useAppContext } from '../store/AppContext';
import { Globe, User } from 'lucide-react';

export default function Feed() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const { preferredLang, setPreferredLang, addHistory, profile, setCurrentView } = useAppContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const loadMore = useCallback(async (count = 3) => {
    let candidates: Article[] = [];
    
    const hasLikes = profile.likes.length > 0;
    const hasInterests = profile.interests && profile.interests.length > 0;
    const dislikedList = profile.dislikedInterests || [];

    // Strategy 1: User Interests (Positive preferences)
    if (hasInterests) {
      try {
        const shuffledInterests = [...profile.interests].sort(() => Math.random() - 0.5);
        for (const interest of shuffledInterests.slice(0, 2)) {
          const searchRes = await searchArticles(interest, preferredLang, 2);
          for (const item of searchRes) {
            candidates.push(item);
            const related = await fetchRelatedArticles(item.title, preferredLang, 2);
            candidates.push(...related);
          }
        }
      } catch (e) {
        console.error("Failed fetching interests candidates", e);
      }
    }

    // Strategy 2: Related to Liked Articles
    if (hasLikes) {
      try {
        const shuffledLikes = [...profile.likes].sort(() => Math.random() - 0.5);
        for (const likedArt of shuffledLikes.slice(0, 2)) {
          const related = await fetchRelatedArticles(likedArt.title, preferredLang, 3);
          candidates.push(...related);
        }
      } catch (e) {
        console.error("Failed fetching related candidates", e);
      }
    }

    // Strategy 3: Random Articles (keeps discovery fresh)
    try {
      const randomArts = await fetchRandomArticles(preferredLang, count + 2);
      candidates.push(...randomArts);
    } catch (e) {
      console.error("Failed fetching random candidates", e);
    }

    // Filter and score candidates
    const negativeKeywords = dislikedList.map(kw => kw.toLowerCase());
    const dislikedTitles = new Set(profile.dislikes.map(title => title.toLowerCase()));
    const historyIds = new Set(profile.history.map(item => item.id));

    const uniqueCandidates = Array.from(new Map(candidates.map(item => [item.id, item])).values());

    // Filter candidates strictly
    const filteredCandidates = uniqueCandidates.filter(article => {
      if (!article.extract || article.extract.length < 50) return false;
      
      const titleLower = article.title.toLowerCase();
      const extractLower = article.extract.toLowerCase();

      // Exclude already disliked article titles
      if (dislikedTitles.has(titleLower)) return false;

      // Exclude already read history
      if (historyIds.has(article.id)) return false;

      // Exclude if it matches any negative disliked interests/keywords
      for (const kw of negativeKeywords) {
        if (titleLower.includes(kw) || extractLower.includes(kw)) {
          return false;
        }
      }

      return true;
    });

    // Score candidates
    const scoredCandidates = filteredCandidates.map(article => {
      let score = 10; // base score
      const titleLower = article.title.toLowerCase();
      const extractLower = article.extract.toLowerCase();

      // Bonus for matching positive interests
      if (profile.interests) {
        for (const interest of profile.interests) {
          const kw = interest.toLowerCase();
          if (titleLower.includes(kw)) {
            score += 15;
          } else if (extractLower.includes(kw)) {
            score += 8;
          }
        }
      }

      // Small random variation to keep items dynamic
      score += Math.random() * 5;

      return { article, score };
    });

    // Sort by score descending
    const sortedArticles = scoredCandidates
      .sort((a, b) => b.score - a.score)
      .map(entry => entry.article);

    const finalArticles = sortedArticles.slice(0, count);

    if (finalArticles.length > 0) {
      setArticles(prev => {
        const existingIds = new Set(prev.map(a => a.id));
        const uniqueNew = finalArticles.filter(a => !existingIds.has(a.id));
        return [...prev, ...uniqueNew];
      });
    } else {
      // If we filtered out too many, fallback directly to fetching random to ensure feed is not stuck empty,
      // but still filter strictly
      try {
        const randomFallback = await fetchRandomArticles(preferredLang, count);
        const safeFallback = randomFallback.filter(article => {
          const titleLower = article.title.toLowerCase();
          const extractLower = (article.extract || "").toLowerCase();
          if (dislikedTitles.has(titleLower)) return false;
          if (historyIds.has(article.id)) return false;
          for (const kw of negativeKeywords) {
            if (titleLower.includes(kw) || extractLower.includes(kw)) return false;
          }
          return true;
        });

        if (safeFallback.length > 0) {
          setArticles(prev => {
            const existingIds = new Set(prev.map(a => a.id));
            const uniqueNew = safeFallback.filter(a => !existingIds.has(a.id));
            return [...prev, ...uniqueNew];
          });
        }
      } catch (e) {
        console.error("Failed loading fallback random articles", e);
      }
    }
  }, [preferredLang, profile.dislikes, profile.likes, profile.interests, profile.dislikedInterests, profile.history]);

  useEffect(() => {
    setArticles([]);
    setLoading(true);
    loadMore(5).then(() => setLoading(false));
  }, [preferredLang]);

  useEffect(() => {
    if (articles[currentIndex]) {
      addHistory(articles[currentIndex]);
    }
  }, [currentIndex, articles, addHistory]);

  useEffect(() => {
    // Load more when nearing the end
    if (articles.length > 0 && currentIndex >= articles.length - 2) {
      loadMore(3);
    }
  }, [currentIndex, articles.length, loadMore]);

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
    <div className="relative w-full h-full bg-black flex flex-col md:rounded-[32px] md:overflow-visible">
      {/* Scrollable Feed Container + Header are inside a rounded, overflow-hidden wrapper to clip article content beautifully */}
      <div className="flex-1 w-full h-full overflow-hidden flex flex-col md:rounded-[32px] relative">
        {/* Top Header Navigation */}
        <header className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center px-8 py-6 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
          <button 
            onClick={handleRefresh}
            className="flex items-center space-x-2 pointer-events-auto cursor-pointer group active:scale-95 transition-transform duration-150 focus:outline-none"
          >
            <div className="w-6 h-6 bg-white text-black rounded flex items-center justify-center font-extrabold text-sm shadow-md shadow-white/10 group-hover:brightness-90 transition-all select-none">W</div>
            <span className="text-xl font-light tracking-tighter text-white select-none">Wiki<span className="font-bold">Tok</span></span>
          </button>
        </header>

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
      </div>

      {/* Floating Interaction Sidebar - positioned lower right on mobile, and moved outside the frame on PC */}
      {articles.length > 0 && articles[currentIndex] && (
        <div className="absolute right-4 bottom-4 sm:right-8 sm:bottom-6 md:right-auto md:left-[calc(100%+16px)] md:bottom-6 z-20 transition-all duration-300">
          <Sidebar 
            article={articles[currentIndex]} 
            onNext={scrollToNext} 
            onTranslate={(translated) => updateArticle(currentIndex, translated)}
          />
        </div>
      )}
      
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
