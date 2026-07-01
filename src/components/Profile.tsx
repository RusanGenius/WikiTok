import { useState } from 'react';
import { useAppContext } from '../store/AppContext';
import { ArrowLeft, Heart, History, Trash2, User, Star, Globe, ThumbsUp, VolumeX } from 'lucide-react';
import { Article } from '../types';

const PREDEFINED_INTERESTS = [
  'Science', 'History', 'Technology', 'Art', 'Geography', 'Space', 'Literature', 'Movies', 'Music', 'Nature', 
  'Astronomy', 'Biology', 'Philosophy', 'Physics', 'Chemistry', 'Mathematics', 'Medicine', 'Archaeology', 
  'Mythology', 'Psychology', 'Sociology', 'Architecture', 'Design', 'Photography', 'Gaming', 'Anime', 
  'Sports', 'Cooking', 'Fashion', 'Finance', 'Economics', 'Politics', 'Linguistics', 'Aviation', 
  'Automotive', 'Cybersecurity', 'Inventions'
];

export default function Profile() {
  const { 
    profile, 
    setCurrentView, 
    clearHistory, 
    cycleInterest,
    preferredLang,
    setPreferredLang 
  } = useAppContext();
  const [activeTab, setActiveTab] = useState<'likes' | 'history' | 'interests'>('likes');

  const getArticles = () => {
    switch (activeTab) {
      case 'likes': return profile.likes;
      case 'history': return profile.history;
      default: return [];
    }
  };

  const articles = getArticles();

  return (
    <div className="w-full h-full bg-black text-white flex flex-col overflow-hidden relative">
      {/* Background Effect */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/20 via-black to-black"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-4 sm:px-8 py-6 bg-gradient-to-b from-black/80 to-transparent">
        <button 
          onClick={() => setCurrentView('feed')}
          className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 active:scale-90 hover:scale-105 transition-all duration-150 cursor-pointer"
        >
          <ArrowLeft size={20} className="text-white" />
        </button>
        <div className="flex items-center space-x-2">
           <User size={28} className="text-white/90" />
           <span className="text-2xl font-light tracking-tighter">My <span className="font-bold">Profile</span></span>
        </div>
        <div className="w-10"></div> {/* Spacer for centering */}
      </header>

      {/* Tabs */}
      <div className="relative z-10 flex justify-center space-x-4 sm:space-x-8 p-4 border-b border-white/10 shrink-0">
        <button 
          onClick={() => setActiveTab('likes')}
          className={`flex flex-col items-center gap-1 p-2 transition-all duration-150 active:scale-95 hover:scale-105 ${activeTab === 'likes' ? 'text-white' : 'text-white/40 hover:text-white/80'}`}
        >
          <Heart size={24} className={activeTab === 'likes' ? 'fill-current' : ''} />
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest">Likes ({profile.likes.length})</span>
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center gap-1 p-2 transition-all duration-150 active:scale-95 hover:scale-105 ${activeTab === 'history' ? 'text-white' : 'text-white/40 hover:text-white/80'}`}
        >
          <History size={24} />
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest">History ({profile.history.length})</span>
        </button>
        <button 
          onClick={() => setActiveTab('interests')}
          className={`flex flex-col items-center gap-1 p-2 transition-all duration-150 active:scale-95 hover:scale-105 ${activeTab === 'interests' ? 'text-white' : 'text-white/40 hover:text-white/80'}`}
        >
          <Star size={24} className={activeTab === 'interests' ? 'fill-current' : ''} />
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest">Interests</span>
        </button>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 overflow-y-auto px-4 py-6 sm:px-12 hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {activeTab === 'interests' && (
          <div className="pb-20 space-y-8">
            {/* Language Selector */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Globe size={18} className="text-indigo-400" />
                <h3 className="text-base font-bold">Language Preferences / Язык статей</h3>
              </div>
              <p className="text-xs text-white/60 mb-4">Choose the language for your Wikipedia article recommendations.</p>
              <div className="flex flex-wrap gap-2.5">
                {[
                  { code: 'en', label: 'English', flag: '🇬🇧' },
                  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
                  { code: 'es', label: 'Español', flag: '🇪🇸' },
                  { code: 'fr', label: 'Français', flag: '🇫🇷' },
                  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
                ].map(l => (
                  <button
                    key={l.code}
                    onClick={() => setPreferredLang(l.code)}
                    className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all border cursor-pointer ${
                      preferredLang === l.code
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/25 scale-[1.03]'
                        : 'bg-white/5 text-white/60 border-white/10 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    <span>{l.flag}</span>
                    <span>{l.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Interests & Anti-topics */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Star size={18} className="text-indigo-400" />
                <h3 className="text-base font-bold">Topics and Preferences / Темы и фильтры</h3>
              </div>
              <p className="text-xs text-white/60 mb-6 leading-relaxed">
                Click a topic to cycle / Нажмите для изменения статуса:<br />
                <span className="text-white font-medium">Neutral (Neutral)</span> ➔{' '}
                <span className="text-emerald-400 font-bold">Like (Нравится)</span> ➔{' '}
                <span className="text-rose-400 font-bold">Mute (Скрыть)</span> ➔{' '}
                <span className="text-white font-medium">Neutral</span>
              </p>
              <div className="flex flex-wrap gap-2.5">
                {PREDEFINED_INTERESTS.map(interest => {
                  const isLiked = profile.interests?.includes(interest);
                  const isDisliked = (profile.dislikedInterests || [])?.includes(interest);
                  return (
                    <button
                      key={interest}
                      onClick={() => cycleInterest(interest)}
                      className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all duration-150 border cursor-pointer active:scale-95 ${
                        isLiked 
                          ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 font-bold shadow-md shadow-emerald-500/5 scale-[1.02]' 
                          : isDisliked 
                          ? 'bg-rose-500/10 border-rose-500/40 text-rose-400 font-bold shadow-md shadow-rose-500/5 scale-[1.02]' 
                          : 'bg-white/5 border-white/10 text-white/50 hover:border-white/20 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {isLiked && <ThumbsUp size={13} className="shrink-0 text-emerald-400" />}
                      {isDisliked && <VolumeX size={13} className="shrink-0 text-rose-400" />}
                      <span>{interest}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && profile.history.length > 0 && (
          <div className="flex justify-end mb-4">
            <button 
              onClick={clearHistory}
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40 hover:text-red-400 transition"
            >
              <Trash2 size={16} /> Clear History
            </button>
          </div>
        )}

        {activeTab !== 'interests' && articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-white/40">
            <p className="text-xl font-light">Nothing here yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-20">
            {articles.map((article, i) => (
              <a 
                key={`${article.id}-${i}`}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="relative aspect-[3/4] bg-white/5 border border-white/10 rounded-xl overflow-hidden group block hover:border-white/30 transition-colors"
              >
                {article.imageUrl && (
                  <img 
                    src={article.imageUrl} 
                    alt="" 
                    className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-80 transition-opacity duration-300"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent p-4 flex flex-col justify-end">
                  <h3 className="text-sm sm:text-lg font-bold line-clamp-3 leading-tight">{article.title}</h3>
                  <span className="text-[10px] font-bold text-indigo-400 uppercase mt-2">{article.lang}</span>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
