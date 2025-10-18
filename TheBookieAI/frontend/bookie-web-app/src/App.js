import React, { useState, useEffect } from 'react';
import { Search, Moon, Sun, Sparkles, ExternalLink, BookOpen, Zap } from 'lucide-react';

export default function BookieSearch() {
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [bookieMessage, setBookieMessage] = useState("Hey there! I'm Bookie 📚 Ready to find your next great read?");
  const [showResults, setShowResults] = useState(false);

  // Telegram Web App Integration
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      
      // Get user data from Telegram
      const user = tg.initDataUnsafe?.user;
      if (user) {
        setBookieMessage(`Hey ${user.first_name}! 👋 Ready to find your next great read?`);
      }
      
      // Match Telegram theme
      if (tg.colorScheme === 'dark') {
        setDarkMode(true);
      }
    }
  }, []);

  const bookieMessages = [
    "Ooh, interesting choice! Let me find that for you! 🔍",
    "Book hunting mode activated! 🚀",
    "Searching through my magical library... ✨",
    "Let me dig through the shelves! 📖",
    "On it! Finding the best books for you! 🎯"
  ];

  const searchBooks = (query) => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    setBookieMessage(bookieMessages[Math.floor(Math.random() * bookieMessages.length)]);
    setShowResults(false);
    
    setTimeout(() => {
      const mockResults = [
        {
          title: query,
          author: "Various Authors",
          link: `https://www.google.com/search?q=${encodeURIComponent(query + " book")}`,
          cover: "📕"
        },
        {
          title: `${query} - Amazon`,
          author: "Shop & Read",
          link: `https://www.amazon.com/s?k=${encodeURIComponent(query)}`,
          cover: "📗"
        },
        {
          title: `${query} - Goodreads`,
          author: "Community Reviews",
          link: `https://www.goodreads.com/search?q=${encodeURIComponent(query)}`,
          cover: "📘"
        },
        {
          title: `${query} - Google Books`,
          author: "Preview & Buy",
          link: `https://books.google.com/books?q=${encodeURIComponent(query)}`,
          cover: "📙"
        }
      ];
      
      setSearchResults(mockResults);
      setIsSearching(false);
      setShowResults(true);
      setBookieMessage("Found some great options! Pick your favorite! 🎉");
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchBooks(searchQuery);
    }
  };

  const FloatingBook = ({ delay, duration, index }) => (
    <div 
      className="absolute text-4xl opacity-20 animate-float"
      style={{
        animation: `float ${duration}s ease-in-out ${delay}s infinite`,
        top: `${(index * 13) % 80}%`,
        left: `${(index * 17) % 90}%`
      }}
    >
      📚
    </div>
  );

  return (
  <>
    <div className={`min-h-screen transition-all duration-500 ${darkMode ? 'bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-900' : 'bg-gradient-to-br from-pink-200 via-purple-200 to-indigo-300'}`}>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes wiggle {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-bounce { animation: bounce 2s ease-in-out infinite; }
        .animate-wiggle { animation: wiggle 1s ease-in-out infinite; }
        .animate-slideUp { animation: slideUp 0.5s ease-out forwards; }
        .animate-pulse { animation: pulse 2s ease-in-out infinite; }
        .glass { 
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .glass-dark {
          background: rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
      `}</style>

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <FloatingBook key={i} index={i} delay={i * 0.5} duration={3 + i * 0.3} />
        ))}
      </div>

      <div className="relative z-10 p-6">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <img src="https://i.imgur.com/9KCtYod.png" alt="Bookie Bot" className="w-16 h-16 animate-wiggle" />
            <div>
              <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-purple-900'}`}>
                Bookie AI
              </h1>
              <p className={`text-sm ${darkMode ? 'text-purple-200' : 'text-purple-700'}`}>
                Your Friendly Book Finder
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-4 rounded-full transition-all duration-300 hover:scale-110 ${darkMode ? 'glass-dark text-yellow-300' : 'glass text-purple-700'} shadow-lg`}
          >
            {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center px-6 py-12">
        <div className={`${darkMode ? 'glass-dark' : 'glass'} rounded-3xl p-8 mb-8 max-w-2xl w-full shadow-2xl`}>
          <div className="flex items-center gap-4 mb-4">
            <img src="https://i.imgur.com/9KCtYod.png" alt="Bookie Bot" className="w-24 h-24 animate-bounce" />
            <div className={`flex-1 ${darkMode ? 'bg-indigo-900/50' : 'bg-white/50'} rounded-2xl p-4 relative`}>
              <div className="absolute -left-3 top-5 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8" 
                   style={{ borderRightColor: darkMode ? 'rgba(49, 46, 129, 0.5)' : 'rgba(255, 255, 255, 0.5)' }}>
              </div>
              <p className={`${darkMode ? 'text-white' : 'text-purple-900'} text-lg font-medium`}>
                {bookieMessage}
              </p>
            </div>
          </div>
        </div>

        <div className="w-full max-w-2xl mb-8">
          <div className={`${darkMode ? 'glass-dark' : 'glass'} rounded-full p-3 shadow-2xl flex items-center gap-3 transition-all duration-300 hover:scale-105`}>
            <Sparkles className={`w-6 h-6 ml-3 ${darkMode ? 'text-yellow-300' : 'text-purple-600'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a book name... ✨"
              className={`flex-1 bg-transparent outline-none text-lg px-2 ${darkMode ? 'text-white placeholder-purple-300' : 'text-purple-900 placeholder-purple-600'}`}
            />
            <button
              onClick={() => searchBooks(searchQuery)}
              disabled={isSearching}
              className={`${darkMode ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'bg-gradient-to-r from-purple-500 to-pink-500'} text-white rounded-full p-4 transition-all duration-300 hover:scale-110 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isSearching ? (
                <Zap className="w-6 h-6 animate-spin" />
              ) : (
                <Search className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {showResults && (
          <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
            {searchResults.map((result, index) => (
              <div
                key={index}
                className={`${darkMode ? 'glass-dark' : 'glass'} rounded-2xl p-6 shadow-xl hover:scale-105 transition-all duration-300 animate-slideUp`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start gap-4">
                  <div className="text-5xl">{result.cover}</div>
                  <div className="flex-1">
                    <h3 className={`font-bold text-lg mb-1 ${darkMode ? 'text-white' : 'text-purple-900'}`}>
                      {result.title}
                    </h3>
                    <p className={`text-sm mb-3 ${darkMode ? 'text-purple-200' : 'text-purple-700'}`}>
                      {result.author}
                    </p>
                    <a
                      href={result.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-2 ${darkMode ? 'bg-purple-600 hover:bg-purple-500' : 'bg-purple-500 hover:bg-purple-600'} text-white px-4 py-2 rounded-full transition-all duration-300 hover:shadow-lg`}
                    >
                      <BookOpen className="w-4 h-4" />
                      View Book
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!showResults && !isSearching && (
          <div className={`${darkMode ? 'glass-dark' : 'glass'} rounded-3xl p-12 max-w-2xl text-center shadow-2xl`}>
            <div className="text-8xl mb-4 animate-bounce">📚</div>
            <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-purple-900'}`}>
              Ready to Explore?
            </h2>
            <p className={`${darkMode ? 'text-purple-200' : 'text-purple-700'}`}>
              Type any book name above and I'll help you find it instantly!
            </p>
          </div>
        )}
      </div>

      <div className={`relative z-10 text-center py-8 ${darkMode ? 'text-purple-300' : 'text-purple-800'}`}>
        <p className="flex items-center justify-center gap-2">
          Made with <span className="text-red-500 animate-pulse">❤️</span> by Ridhi Rajput
        </p>
      </div>
    </div>
  </>
);
}