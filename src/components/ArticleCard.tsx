import { Article } from '../types';
import { useState } from 'react';

interface ArticleCardProps {
  key?: number | string;
  article: Article;
  onNext: () => void;
  onUpdateArticle: (updated: Article) => void;
}

export default function ArticleCard({ article, onNext, onUpdateArticle }: ArticleCardProps) {
  const [imageError, setImageError] = useState(false);

  const getGradientStyle = (id: string | number) => {
    const palettes = [
      // Teal-Ocean (Blue, light-blue, green)
      { bg: 'bg-[#020a14]', blobs: ['bg-[#0284c7]/25', 'bg-[#0d9488]/20', 'bg-[#16a34a]/15'] },
      // Sunset-Fire (Red, purple, orange)
      { bg: 'bg-[#12030a]', blobs: ['bg-[#dc2626]/20', 'bg-[#7c3aed]/25', 'bg-[#ea580c]/15'] },
      // Cosmic-Neon (Purple, fuchsia, indigo)
      { bg: 'bg-[#0a0512]', blobs: ['bg-[#6366f1]/25', 'bg-[#d946ef]/20', 'bg-[#4f46e5]/20'] },
      // Aurora-Borealis (Emerald, cyan, indigo)
      { bg: 'bg-[#010b0e]', blobs: ['bg-[#059669]/20', 'bg-[#0891b2]/25', 'bg-[#4f46e5]/15'] },
      // Electric-Sun (Yellow, amber, rose)
      { bg: 'bg-[#120b02]', blobs: ['bg-[#eab308]/15', 'bg-[#d97706]/20', 'bg-[#e11d48]/20'] }
    ];
    const str = String(id);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % palettes.length;
    return palettes[index];
  };

  const gradient = getGradientStyle(article.id);

  return (
    <div className="relative w-full h-full snap-start snap-always shrink-0 bg-black text-white overflow-hidden flex flex-col justify-end">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-black/50 z-10 pointer-events-none"></div>
        {article.imageUrl && !imageError ? (
          <img 
            src={article.imageUrl} 
            alt={article.title} 
            className="absolute inset-0 w-full h-full object-cover opacity-30 z-0"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className={`absolute inset-0 w-full h-full ${gradient.bg} z-0 overflow-hidden`}>
            {/* Rich multi-stop non-linear mesh radial glows */}
            <div className={`absolute -top-[20%] -left-[20%] w-[90%] h-[90%] rounded-full ${gradient.blobs[0]} blur-[90px] animate-pulse`} style={{ animationDuration: '8s' }} />
            <div className={`absolute -bottom-[20%] -right-[20%] w-[90%] h-[90%] rounded-full ${gradient.blobs[1]} blur-[90px] animate-pulse`} style={{ animationDuration: '10s' }} />
            <div className={`absolute top-[20%] left-[20%] w-[70%] h-[70%] rounded-full ${gradient.blobs[2]} blur-[110px]`} />
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-row items-end px-4 pb-6 sm:px-12 sm:pb-8 pt-24 w-full h-full">
        
        {/* Article Text Section */}
        <div className="flex-1 max-w-2xl sm:max-w-3xl md:max-w-full space-y-3 sm:space-y-4 animate-fade-in mr-16 sm:mr-24 md:mr-0 pb-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight select-text">
            {article.title}
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-white/80 leading-relaxed font-light overflow-y-auto max-h-[35vh] no-scrollbar select-text">
            {article.extract}
          </p>
        </div>
      </div>
    </div>
  );
}

