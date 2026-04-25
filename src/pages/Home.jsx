import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin } from 'lucide-react';
import { searchTemple, templesDatabase } from '../data/temples';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  const suggestions = searchQuery 
    ? Object.values(templesDatabase).filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const handleSelect = (templeId) => {
    navigate(`/operator?temple=${templeId}`);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    
    setIsSearching(true);
    // Simulate API call and redirect
    setTimeout(() => {
      const templeId = searchTemple(searchQuery);
      navigate(`/operator?temple=${templeId}`);
    }, 1200);
  };

  return (
    <div className="bg-[#050505] min-h-[calc(100vh-64px)] text-white font-sans overflow-x-hidden relative">
      
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-signal-blue/10 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="max-w-4xl mx-auto px-6 pt-20 pb-24 relative z-10 flex flex-col items-center">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 border border-signal-blue/30 bg-signal-blue/10 px-4 py-1.5 rounded-full text-xs font-mono font-bold text-signal-blue mb-6">
            <span className="w-2 h-2 rounded-full bg-signal-blue animate-pulse"></span>
            DEVOTEE SMART PORTAL
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tighter mb-4">
            Plan your divine visit.
          </h1>
          <p className="text-neutral-400 text-lg max-w-xl mx-auto">
            Get live crowd updates, book instant digital tokens, and find the fastest low-traffic routes to temples across India.
          </p>
        </div>

        {/* Search Bar */}
        <div className="w-full max-w-2xl relative mb-16">
          <form onSubmit={handleSearch} className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-neutral-500" />
            </div>
            <input
              type="text"
              className="w-full bg-[#111] border border-white/20 text-white text-lg rounded-full py-5 pl-14 pr-32 focus:outline-none focus:border-signal-blue focus:ring-1 focus:ring-signal-blue transition-all shadow-[0_0_30px_rgba(37,99,235,0.1)]"
              placeholder="Search for a temple (e.g. ISKCON Bangalore)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button 
              type="submit"
              disabled={isSearching}
              className="absolute right-2 top-2 bottom-2 bg-signal-blue text-white font-bold px-6 rounded-full hover:bg-blue-600 transition-colors flex items-center justify-center min-w-[120px]"
            >
              {isSearching ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'SEARCH'
              )}
            </button>
          </form>

          {/* Autocomplete Dropdown */}
          {searchQuery && suggestions.length > 0 && (
            <div className="absolute top-full mt-2 w-full bg-[#111] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50">
              {suggestions.map((temple) => (
                <button
                  key={temple.id}
                  type="button"
                  onClick={() => handleSelect(temple.id)}
                  className="w-full text-left px-6 py-4 border-b border-white/5 hover:bg-white/5 flex items-center gap-4 transition-colors last:border-0"
                >
                  <div className="p-2 bg-signal-blue/10 rounded-full text-signal-blue shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-lg">{temple.name}</div>
                    <div className="text-sm text-neutral-400">{temple.location}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
