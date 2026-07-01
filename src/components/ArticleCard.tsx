import { Article } from '../types';
import Sidebar from './Sidebar';
import { useState } from 'react';

interface ArticleCardProps {
  key?: number | string;
  article: Article;
  onNext: () => void;
  onUpdateArticle: (updated: Article) => void;
}

export default function ArticleCard({ article, onNext, onUpdateArticle }: ArticleCardProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="relative w-full h-full snap-start snap-always shrink-0 bg-black text-white overflow-hidden flex flex-col justify-end">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/60 z-10 pointer-events-none"></div>
        {article.imageUrl && !imageError ? (
          <img 
            src={article.imageUrl} 
            alt={article.title} 
            className="absolute inset-0 w-full h-full object-cover opacity-30 z-0"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-indigo-950/35 to-black z-0" />
        )}
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-row items-end px-4 pb-6 sm:px-12 sm:pb-8 pt-24 w-full h-full">
        
        {/* Article Text Section */}
        <div className="flex-1 max-w-xl sm:max-w-2xl space-y-3 sm:space-y-4 animate-fade-in mr-20 sm:mr-32 pb-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight select-text">
            {article.title}
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-white/80 leading-relaxed font-light overflow-y-auto max-h-[35vh] pr-2 scrollbar-thin select-text">
            {article.extract}
          </p>
        </div>

        {/* Interaction Sidebar - positioned lower near the bottom right */}
        <div className="absolute right-4 bottom-4 sm:right-8 sm:bottom-6 z-20">
          <Sidebar 
            article={article} 
            onNext={onNext} 
            onTranslate={onUpdateArticle}
          />
        </div>
      </div>
    </div>
  );
}

