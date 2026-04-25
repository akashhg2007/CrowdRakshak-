import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, ChevronDown } from 'lucide-react';
import { searchTemple, templesDatabase } from '../data/temples';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [isStateDropdownOpen, setIsStateDropdownOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  const allStates = [...new Set(Object.values(templesDatabase).map(t => t.state))].filter(Boolean).sort();

  const suggestions = (searchQuery || selectedState) 
    ? Object.values(templesDatabase).filter(t => {
        const matchesSearch = searchQuery === '' || t.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesState = selectedState === '' || t.state === selectedState;
        return matchesSearch && matchesState;
      }).slice(0, 50) // Limit to 50 to prevent huge DOM if a state has hundreds
    : [];

  const handleSelect = (templeId) => {
    navigate(`/operator?temple=${templeId}`);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery && !selectedState) return;
    
    setIsSearching(true);
    // Simulate API call and redirect
    setTimeout(() => {
      // If they searched something, find it. If they only picked a state, go to the first temple in that state
      const templeId = searchQuery ? searchTemple(searchQuery) : suggestions[0]?.id;
      if (templeId) navigate(`/operator?temple=${templeId}`);
      else setIsSearching(false);
    }, 1200);
  };

  return (
    <div className="bg-[#050505] min-h-[calc(100vh-64px)] text-white font-sans overflow-x-hidden relative">
      
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-signal-blue/20 blur-[120px] rounded-full pointer-events-none mix-blend-screen"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-900/10 blur-[150px] rounded-full pointer-events-none mix-blend-screen"></div>

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

        {/* Search Bar & State Filter */}
        <div className="w-full max-w-2xl relative mb-16">
          <div className="flex flex-col md:flex-row gap-4 mb-4 relative z-20">
            <div className="relative w-full md:w-1/3 group">
              <button
                type="button"
                onClick={() => setIsStateDropdownOpen(!isStateDropdownOpen)}
                className="bg-[#111]/80 backdrop-blur-md border border-white/10 text-white rounded-2xl px-6 py-4 focus:outline-none focus:border-signal-blue focus:ring-1 focus:ring-signal-blue w-full shadow-[0_0_20px_rgba(37,99,235,0.05)] text-left hover:bg-[#1a1a1a] transition-all flex justify-between items-center z-30"
              >
                <span className="truncate">{selectedState ? selectedState : '🗺️ All States'}</span>
                <ChevronDown className={`h-5 w-5 text-neutral-400 group-hover:text-signal-blue transition-transform shrink-0 ${isStateDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isStateDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsStateDropdownOpen(false)}></div>
                  <div className="absolute top-[110%] left-0 w-full bg-[#111]/90 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50 max-h-[300px] overflow-y-auto custom-scrollbar flex flex-col">
                    <button
                      type="button"
                      onClick={() => { setSelectedState(''); setIsStateDropdownOpen(false); }}
                      className={`text-left px-6 py-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 text-white ${selectedState === '' ? 'bg-white/10 font-bold' : ''}`}
                    >
                      🗺️ All States
                    </button>
                    {allStates.map(state => (
                      <button
                        key={state}
                        type="button"
                        onClick={() => { setSelectedState(state); setIsStateDropdownOpen(false); }}
                        className={`text-left px-6 py-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 text-white ${selectedState === state ? 'bg-white/10 font-bold' : ''}`}
                      >
                        {state}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            
            <form onSubmit={handleSearch} className="relative flex-grow">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search className="h-6 w-6 text-neutral-500" />
              </div>
              <input
                type="text"
                className="w-full bg-[#111]/80 backdrop-blur-md border border-white/10 text-white text-lg rounded-2xl py-4 pl-14 pr-32 focus:outline-none focus:border-signal-blue focus:ring-1 focus:ring-signal-blue transition-all shadow-[0_0_20px_rgba(37,99,235,0.05)] hover:bg-[#1a1a1a]"
                placeholder="Search for a temple..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button 
                type="submit"
                disabled={isSearching || (!searchQuery && !selectedState)}
                className="absolute right-2 top-2 bottom-2 bg-signal-blue text-white font-bold px-6 rounded-full hover:bg-blue-600 disabled:opacity-50 transition-colors flex items-center justify-center min-w-[100px]"
              >
              {isSearching ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'SEARCH'
              )}
            </button>
          </form>
          </div>

          {/* Autocomplete Dropdown */}
          {(searchQuery || selectedState) && suggestions.length > 0 && (
            <div className="absolute top-[110%] w-full bg-[#111]/90 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50 max-h-[400px] overflow-y-auto custom-scrollbar">
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
