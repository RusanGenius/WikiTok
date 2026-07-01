import { useState } from 'react';
import { useAppContext } from '../store/AppContext';
import { ArrowLeft, Heart, History, Trash2, User, Star } from 'lucide-react';
import { Article } from '../types';

const PREDEFINED_INTERESTS = [
  'Science', 'History', 'Technology', 'Art', 'Geography', 'Space', 'Literature', 'Movies', 'Music', 'Nature', 
  'Astronomy', 'Biology', 'Philosophy', 'Physics', 'Chemistry', 'Mathematics', 'Medicine', 'Archaeology', 
  'Mythology', 'Psychology', 'Sociology', 'Architecture', 'Design', 'Photography', 'Gaming', 'Anime', 
  'Sports', 'Cooking', 'Fashion', 'Finance', 'Economics', 'Politics', 'Linguistics', 'Aviation', 
  'Automotive', 'Cybersecurity', 'Inventions'
];

export default function Profile() {
  const { profile, setCurrentView, clearHistory, toggleInterest } = useAppContext();
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
          <div className="pb-20">
            <h2 className="text-xl font-bold mb-4">Select Your Interests</h2>
            <p className="text-sm text-white/60 mb-6">We will use these topics to recommend Wikipedia articles in your feed.</p>
            <div className="flex flex-wrap gap-3">
              {PREDEFINED_INTERESTS.map(interest => {
                const isSelected = profile.interests?.includes(interest);
                return (
                  <button
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-colors border ${
                      isSelected 
                        ? 'bg-indigo-600 text-white border-indigo-500' 
                        : 'bg-white/5 text-white/60 border-white/10 hover:border-white/30 hover:text-white'
                    }`}
                  >
                    {interest}
                  </button>
                );
              })}
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
