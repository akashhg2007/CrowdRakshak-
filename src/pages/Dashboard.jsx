import React, { useState } from 'react';
import { Building2, Plus, Trash2, MapPin } from 'lucide-react';

export default function Dashboard() {
  const [temples, setTemples] = useState([
    { id: 1, name: 'ISKCON Temple Bangalore', location: 'Bangalore, Karnataka' },
    { id: 2, name: 'Tirumala Venkateswara Temple', location: 'Tirupati, Andhra Pradesh' },
    { id: 3, name: 'Bull Temple', location: 'Bangalore, Karnataka' }
  ]);
  
  const [newTempleName, setNewTempleName] = useState('');
  const [newTempleLocation, setNewTempleLocation] = useState('');

  const handleAddTemple = (e) => {
    e.preventDefault();
    if (!newTempleName.trim() || !newTempleLocation.trim()) return;
    
    const newTemple = {
      id: Date.now(),
      name: newTempleName,
      location: newTempleLocation
    };
    
    setTemples([...temples, newTemple]);
    setNewTempleName('');
    setNewTempleLocation('');
  };

  const handleRemoveTemple = (id) => {
    setTemples(temples.filter(temple => temple.id !== id));
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] bg-[#050505] p-6 font-sans text-white overflow-y-auto custom-scrollbar">
      <div className="max-w-4xl mx-auto w-full">
        
        <div className="flex items-center gap-3 mb-8 border-b border-white/10 pb-4">
          <Building2 className="w-8 h-8 text-signal-blue" />
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-widest text-white">Temple Management</h1>
            <p className="text-xs text-neutral-500 font-mono">ADMINISTRATOR ACCESS ONLY</p>
          </div>
        </div>

        {/* Add Temple Form */}
        <div className="bg-black border border-white/10 p-6 rounded-sm mb-8">
          <h2 className="text-sm font-mono text-signal-blue mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4" /> ADD NEW TEMPLE
          </h2>
          <form onSubmit={handleAddTemple} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input 
                type="text" 
                placeholder="Temple Name (e.g. Meenakshi Temple)" 
                value={newTempleName}
                onChange={(e) => setNewTempleName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-signal-blue font-mono"
              />
            </div>
            <div className="flex-1">
              <input 
                type="text" 
                placeholder="Location (e.g. Madurai, TN)" 
                value={newTempleLocation}
                onChange={(e) => setNewTempleLocation(e.target.value)}
                className="w-full bg-white/5 border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-signal-blue font-mono"
              />
            </div>
            <button 
              type="submit"
              className="bg-signal-blue hover:bg-blue-600 text-white px-6 py-3 text-sm font-bold uppercase tracking-wider transition-colors shrink-0"
            >
              Add Temple
            </button>
          </form>
        </div>

        {/* Managed Temples List */}
        <div className="bg-black border border-white/10 p-6 rounded-sm">
          <h2 className="text-sm font-mono text-neutral-400 mb-4 uppercase tracking-widest">
            Currently Managed Temples
          </h2>
          
          {temples.length === 0 ? (
            <div className="text-neutral-500 text-sm font-mono py-8 text-center border border-dashed border-white/10">
              No temples managed currently. Add one above.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {temples.map((temple) => (
                <div key={temple.id} className="flex items-center justify-between p-4 border border-white/5 bg-[#0a0a0a] hover:border-signal-blue/30 transition-colors">
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-lg">{temple.name}</span>
                    <span className="text-xs text-neutral-500 font-mono flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {temple.location}
                    </span>
                  </div>
                  <button 
                    onClick={() => handleRemoveTemple(temple.id)}
                    className="p-2 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white transition-colors rounded"
                    title="Remove Temple"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
