import React, { useState } from 'react';
import { 
  Users, AlertTriangle, Clock, Car, Map as MapIcon, 
  TrendingUp, Activity, BarChart2, Bell, ShieldAlert,
  Sparkles, Globe, Ticket, Siren, Flame, HeartPulse
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline, Marker } from 'react-leaflet';
import L from 'leaflet';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useSearchParams } from 'react-router-dom';
import { templesDatabase } from '../data/temples';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
let genAI = null;
if (API_KEY) {
  genAI = new GoogleGenerativeAI(API_KEY);
}

const templeIcon = L.divIcon({
  html: `<div style="font-size: 36px; filter: drop-shadow(0 0 10px rgba(255,255,255,0.8)); text-shadow: 0 0 5px black;">🛕</div>`,
  className: 'custom-temple-icon',
  iconSize: [36, 36],
  iconAnchor: [18, 36]
});

const predictionData = [
  { time: '18:00', visitors: 4000 },
  { time: '18:15', visitors: 5200 },
  { time: '18:30', visitors: 8100 },
  { time: '18:45', visitors: 9500 },
  { time: '19:00', visitors: 11200 },
  { time: '19:15', visitors: 12500 },
  { time: '19:30', visitors: 11000 },
];

// Highly realistic multi-segment traffic mapping to trace road curvature
const realisticTrafficData = [
  // Tumkur Road (North-West Approach)
  { path: [[13.030, 77.525], [13.026, 77.530], [13.022, 77.535]], color: '#22c55e', state: 'Clear' },
  { path: [[13.022, 77.535], [13.018, 77.540], [13.015, 77.543]], color: '#f97316', state: 'Moderate' },
  { path: [[13.015, 77.543], [13.012, 77.546]], color: '#ef4444', state: 'Heavy' },
  { path: [[13.012, 77.546], [13.010, 77.549], [13.0094, 77.5511]], color: '#7f1d1d', state: 'Severe' },
  
  // Chord Road (South Approach)
  { path: [[12.980, 77.543], [12.985, 77.544], [12.990, 77.546]], color: '#22c55e', state: 'Clear' },
  { path: [[12.990, 77.546], [12.995, 77.548]], color: '#ef4444', state: 'Heavy' },
  { path: [[12.995, 77.548], [13.002, 77.549], [13.005, 77.550]], color: '#7f1d1d', state: 'Severe' },
  { path: [[13.005, 77.550], [13.007, 77.551], [13.0094, 77.5511]], color: '#ef4444', state: 'Heavy' },

  // Malleshwaram / Margosa Road (East Approach)
  { path: [[13.000, 77.565], [13.002, 77.560], [13.005, 77.555]], color: '#22c55e', state: 'Clear' },
  { path: [[13.005, 77.555], [13.008, 77.552]], color: '#f97316', state: 'Moderate' },
  { path: [[13.008, 77.552], [13.0094, 77.5511]], color: '#ef4444', state: 'Heavy' },
  
  // Outer Ring Road (North Approach)
  { path: [[13.025, 77.565], [13.020, 77.560], [13.015, 77.555]], color: '#22c55e', state: 'Clear' },
  { path: [[13.015, 77.555], [13.012, 77.552]], color: '#f97316', state: 'Moderate' },
  { path: [[13.012, 77.552], [13.0094, 77.5511]], color: '#ef4444', state: 'Heavy' }
];

export default function OperatorDashboard() {
  const [searchParams] = useSearchParams();
  const templeId = searchParams.get('temple') || 'iskcon';
  const temple = templesDatabase[templeId] || templesDatabase['iskcon'];

  const [llmPrompt, setLlmPrompt] = useState('');
  const [llmResponse, setLlmResponse] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Emergency State
  const [emergencyMode, setEmergencyMode] = useState(null);

  const triggerEmergency = async (type) => {
    setEmergencyMode(type);
    if (!type) {
      setLlmResponse('');
      return;
    }

    if (!genAI) {
      if (type === 'FIRE') {
        setLlmResponse("CRITICAL: Fire detected near South Wing. Initiating immediate evacuation protocol. Redirecting all devotees to East and West emergency exits. Auto-dispatching fire department to GPS coordinates 13.0094, 77.5511.");
      } else if (type === 'MEDICAL') {
        setLlmResponse("MEDICAL SOS: Cardiac event reported at Main Darshan Hall. Dispatching on-site medical team. Holding crowd flow at Gate 3 to clear path for ambulance access via VIP entrance.");
      } else if (type === 'STAMPEDE') {
        setLlmResponse("WARNING: Crowd density at Prasadam Hall exceeded 95%. High stampede risk. Auto-locking ingress gates. Opening secondary overflow exits. Broadcasting 'Move Slowly' audio alerts in Kannada and Hindi.");
      }
      return;
    }

    setLlmResponse(`[GEMINI AI] Generating live crisis mitigation protocol for ${type} emergency...`);
    setIsGenerating(true);
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const prompt = `You are the AI Crisis Manager for ${temple.name}. A ${type} emergency has just been triggered. Provide a highly specific, 3-sentence action plan to mitigate the crisis. Format it like an automated alert system.`;
      const result = await model.generateContent(prompt);
      setLlmResponse(result.response.text());
    } catch (e) {
      if (type === 'FIRE') {
        setLlmResponse(`CRITICAL [FALLBACK AI]: Fire detected near South Wing of ${temple.name}. Initiating immediate evacuation protocol. Redirecting all devotees to East and West emergency exits. Auto-dispatching fire department to GPS coordinates ${temple.lat}, ${temple.lng}.`);
      } else if (type === 'MEDICAL') {
        setLlmResponse(`MEDICAL SOS [FALLBACK AI]: Cardiac event reported at Main Darshan Hall of ${temple.name}. Dispatching on-site medical team. Holding crowd flow at Gate 3 to clear path for ambulance access via VIP entrance.`);
      } else if (type === 'STAMPEDE') {
        setLlmResponse(`WARNING [FALLBACK AI]: Crowd density at ${temple.name} exceeded 95%. High stampede risk. Auto-locking ingress gates. Opening secondary overflow exits. Broadcasting 'Move Slowly' audio alerts.`);
      } else {
        setLlmResponse(`ERROR: Failed to reach Gemini API. ${e.message}`);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const askGeminiAI = async (e) => {
    e.preventDefault();
    if (!llmPrompt) return;
    
    setIsGenerating(true);
    if (!genAI) {
       setTimeout(() => {
          setLlmResponse("Please add your VITE_GEMINI_API_KEY to the .env file and restart your local dev server to use the real AI!");
          setIsGenerating(false);
       }, 1000);
       return;
    }

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const context = `Context: You are the AI manager for ${temple.name}. Current status: ${temple.baseCrowd} total devotees. Darshan wait time: ${temple.waitTimes.free}. Parking available: ${temple.parkingSpots} spots. The user is asking a question based on this data.`;
      const result = await model.generateContent(`${context}\n\nQuestion: ${llmPrompt}\n\nKeep the answer concise (under 3 sentences) and highly professional.`);
      setLlmResponse(result.response.text());
      setLlmPrompt('');
    } catch (e) {
      setLlmResponse(`[FALLBACK AI] Based on the current heatmaps at ${temple.name}, the Main Hall is experiencing a 35% surge over the last 15 minutes. It is highly recommended to redirect incoming devotees to prevent a bottleneck near the exit.`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={`flex flex-col min-h-[calc(100vh-64px)] p-4 font-sans text-white lg:overflow-hidden overflow-y-auto transition-colors duration-500 ${emergencyMode ? 'bg-[#2a0505] border-[6px] border-red-600/50' : 'bg-[#050505]'}`}>
      
      {emergencyMode && (
        <div className="bg-red-600 text-white font-bold text-center py-2 mb-4 animate-pulse uppercase tracking-widest text-lg">
          CRITICAL ALERT: {emergencyMode} PROTOCOL INITIATED. STAND BY FOR AI DIRECTIVES.
        </div>
      )}

      {/* 1. Top Stats Bar & Global Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 flex-grow">
          {[
            { label: 'Total Devotees Today', value: temple.baseCrowd.toLocaleString(), icon: Users, color: 'text-signal-blue' },
            { label: `${temple.name.split(' ')[0]} Crowd Risk`, value: emergencyMode ? 'CRITICAL' : 'MEDIUM', icon: Activity, color: emergencyMode ? 'text-red-500' : 'text-yellow-500' },
            { label: 'Active Alerts', value: emergencyMode ? '4' : '3', icon: AlertTriangle, color: 'text-red-500' },
            { label: 'Avg Darshan Wait', value: temple.waitTimes.free, icon: Clock, color: 'text-signal-blue' },
            { label: 'Parking Free', value: temple.parkingSpots.toString(), icon: Car, color: 'text-green-500' },
          ].map((stat, i) => (
            <div key={i} className={`flex items-center gap-4 border p-4 rounded-xl backdrop-blur-xl shadow-lg transition-all ${emergencyMode ? 'bg-red-950/40 border-red-500/30' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
              <div className={`p-3 rounded-full ${emergencyMode ? 'bg-red-500/10' : 'bg-white/10'} ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-mono text-neutral-400">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Language Selector */}
        <div className="relative shrink-0 flex">
          <button className={`border text-xs font-bold px-4 py-4 rounded-sm flex items-center gap-2 pointer-events-none w-full h-full justify-center transition-colors ${emergencyMode ? 'bg-red-500/10 text-red-500 border-red-500/50' : 'bg-signal-blue/10 border-signal-blue/50 text-signal-blue'}`}>
            <Globe className="w-5 h-5" /> CHANGE LANGUAGE
          </button>
          <select className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" title="Change Language">
            <option value="en">EN - English</option>
            <option value="hi">HI - हिंदी (Hindi)</option>
            <option value="kn">KN - ಕನ್ನಡ (Kannada)</option>
            <option value="te">TE - తెలుగు (Telugu)</option>
            <option value="ta">TA - தமிழ் (Tamil)</option>
            <option value="ml">ML - മലയാളം (Malayalam)</option>
          </select>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-grow lg:overflow-hidden overflow-visible">
        
        {/* LEFT COLUMN (3 cols) */}
        <div className="col-span-1 lg:col-span-3 flex flex-col gap-4 lg:overflow-y-auto lg:pr-2 custom-scrollbar">
          
          {/* Alert Center */}
          <div className={`border p-5 rounded-2xl flex flex-col gap-3 backdrop-blur-xl shadow-lg transition-all ${emergencyMode ? 'bg-red-950/40 border-red-500/30' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
            <h3 className="text-xs font-mono text-neutral-400 flex items-center gap-2">
              <ShieldAlert className={`w-4 h-4 ${emergencyMode ? 'text-red-500' : 'text-signal-blue'}`} />
              ALERT CENTER
            </h3>
            <div className="flex flex-col gap-2">
              {emergencyMode && (
                <div className="border-l-2 border-red-500 bg-red-500/20 p-2 text-sm animate-pulse">
                  <span className="font-bold text-red-500">CRITICAL:</span> {emergencyMode} EMERGENCY ACTIVATED.
                </div>
              )}
              <div className="border-l-2 border-red-500 bg-red-500/10 p-2 text-sm">
                <span className="font-bold text-red-500">CRITICAL:</span> Main Darshan Hall overcrowded.
              </div>
              <div className="border-l-2 border-yellow-500 bg-yellow-500/10 p-2 text-sm">
                <span className="font-bold text-yellow-500">WARNING:</span> South Parking at 90%.
              </div>
              <div className="border-l-2 border-green-500 bg-green-500/10 p-2 text-sm">
                <span className="font-bold text-green-500">SAFE:</span> Prasadam Queue flowing well.
              </div>
            </div>
          </div>

          {/* Queue Management & Digital Tokens */}
          <div className={`border p-5 rounded-2xl flex-grow flex flex-col backdrop-blur-xl shadow-lg transition-all ${emergencyMode ? 'bg-red-950/40 border-red-500/30 opacity-50 pointer-events-none' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
            <h3 className="text-xs font-mono text-neutral-400 flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 text-signal-blue" />
              WAIT TIMES & DIGITAL TOKENS
            </h3>
            <div className="flex flex-col gap-3 flex-grow">
              {[
                { gate: 'Free Darshan', wait: temple.waitTimes.free, color: 'text-red-500' },
                { gate: 'Special Entry (₹300)', wait: temple.waitTimes.special, color: 'text-yellow-500' },
                { gate: 'VIP Access', wait: temple.waitTimes.vip, color: 'text-green-500' },
              ].map((q, i) => (
                <div key={i} className="flex justify-between items-center bg-[#111] p-3 rounded border border-white/5">
                  <div className="font-medium text-sm">{q.gate}</div>
                  <div className={`font-mono text-lg font-bold ${q.color}`}>{q.wait}</div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 bg-signal-blue text-white py-3 rounded-sm text-sm font-bold tracking-wider hover:bg-blue-600 transition-colors flex items-center justify-center gap-2">
              <Ticket className="w-4 h-4" /> GENERATE E-TOKEN
            </button>
          </div>

        </div>

        {/* CENTER COLUMN (6 cols) */}
        <div className="col-span-1 lg:col-span-6 flex flex-col gap-4">
          
          {/* Live Smart Map (Temple Interior) */}
          <div className={`border p-5 rounded-2xl flex-1 flex flex-col z-0 backdrop-blur-xl shadow-lg transition-all ${emergencyMode ? 'bg-red-950/40 border-red-500/30' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-2 mb-4">
              <h3 className="text-xs font-mono text-neutral-400 flex items-center gap-2">
                 <MapIcon className={`w-4 h-4 ${emergencyMode ? 'text-red-500' : 'text-signal-blue'}`} /> TEMPLE TRAFFIC OR CROWD
              </h3>
              <div className="flex gap-4 text-xs font-mono">
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> Crowded</div>
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-yellow-500"></span> Moderate</div>
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500"></span> Clear</div>
              </div>
            </div>
            
            <div className={`min-h-[300px] lg:min-h-0 flex-grow relative overflow-hidden rounded border ${emergencyMode ? 'border-red-500/50' : 'border-white/5'}`}>
              <MapContainer 
                key={temple.id}
                center={[temple.lat, temple.lng]} 
                zoom={17} 
                className="w-full h-full absolute inset-0"
                zoomControl={false}
              >
                <TileLayer
                  attribution='&copy; <a href="https://carto.com/">Carto</a>'
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
              {/* Heatmap Gradient for Main Darshan Hall (Red/Overcrowded) */}
              <CircleMarker center={[temple.lat, temple.lng]} radius={60} pathOptions={{ color: 'transparent', fillColor: '#ef4444', fillOpacity: 0.1 }} />
              <CircleMarker center={[temple.lat, temple.lng]} radius={40} pathOptions={{ color: 'transparent', fillColor: '#ef4444', fillOpacity: 0.25 }} />
              <CircleMarker center={[temple.lat, temple.lng]} radius={20} pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.6 }}>
                <Popup className="bg-black text-white font-bold">Main Darshan Hall (Overcrowded)</Popup>
              </CircleMarker>

              {/* Heatmap Gradient for Prasadam Distribution (Yellow/Moderate) */}
              <CircleMarker center={[temple.lat + 0.0004, temple.lng - 0.0006]} radius={45} pathOptions={{ color: 'transparent', fillColor: '#eab308', fillOpacity: 0.15 }} />
              <CircleMarker center={[temple.lat + 0.0004, temple.lng - 0.0006]} radius={25} pathOptions={{ color: 'transparent', fillColor: '#eab308', fillOpacity: 0.3 }} />
              <CircleMarker center={[temple.lat + 0.0004, temple.lng - 0.0006]} radius={15} pathOptions={{ color: '#eab308', fillColor: '#eab308', fillOpacity: 0.6 }}>
                <Popup className="font-bold text-black">Prasadam Distribution (Moderate)</Popup>
              </CircleMarker>

              {/* Heatmap Gradient for South Parking (Green/Clear) */}
              <CircleMarker center={[temple.lat - 0.0009, temple.lng + 0.0004]} radius={50} pathOptions={{ color: 'transparent', fillColor: '#22c55e', fillOpacity: 0.1 }} />
              <CircleMarker center={[temple.lat - 0.0009, temple.lng + 0.0004]} radius={25} pathOptions={{ color: '#22c55e', fillColor: '#22c55e', fillOpacity: 0.5 }}>
                <Popup className="font-bold text-black">South Parking (Clear)</Popup>
              </CircleMarker>

              {/* Temple Symbol Marker */}
              <Marker position={[temple.lat, temple.lng]} icon={templeIcon}>
                <Popup className="font-bold text-black">{temple.name}</Popup>
              </Marker>

              {/* Emergency Evacuation Routes */}
              {emergencyMode && (
                <>
                  <Polyline positions={[[temple.lat, temple.lng], [temple.lat - 0.0014, temple.lng + 0.0019]]} pathOptions={{ color: '#22c55e', weight: 4, dashArray: '10, 10' }} />
                  <Polyline positions={[[temple.lat, temple.lng], [temple.lat + 0.0016, temple.lng - 0.0021]]} pathOptions={{ color: '#22c55e', weight: 4, dashArray: '10, 10' }} />
                </>
              )}
            </MapContainer>
            </div>
          </div>

          {/* OpenStreetMap Traffic Simulation */}
          <div className={`border p-5 rounded-2xl flex-1 flex flex-col z-0 backdrop-blur-xl shadow-lg transition-all ${emergencyMode ? 'bg-[#1a0505] border-red-500/30' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
            <h3 className="text-xs font-mono text-neutral-400 flex items-center gap-2 mb-4">
               <Car className={`w-4 h-4 ${emergencyMode ? 'text-red-500' : 'text-signal-blue'}`} /> BEST ROAD TO ENTER THE TEMPLE
            </h3>
            
            <div className={`min-h-[300px] lg:min-h-0 flex-grow relative overflow-hidden rounded border ${emergencyMode ? 'border-red-500/50' : 'border-white/5'}`}>
              <MapContainer 
                key={`${temple.id}-traffic`}
                center={[temple.lat, temple.lng]} 
                zoom={14} 
                className="w-full h-full absolute inset-0"
                zoomControl={false}
              >
                <TileLayer
                  attribution='&copy; <a href="https://carto.com/">Carto</a>'
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
              
              {/* Simulated Realistic Traffic Segments */}
              {realisticTrafficData.map((segment, i) => {
                const adjustedPath = segment.path.map(p => [
                  temple.lat + (p[0] - 13.0094),
                  temple.lng + (p[1] - 77.5511)
                ]);
                return (
                <Polyline 
                  key={i}
                  positions={adjustedPath} 
                  pathOptions={{ color: segment.color, weight: 5, opacity: 0.9, lineCap: 'round', lineJoin: 'round' }} 
                >
                  <Popup>
                    <div className="text-xs font-mono">Traffic Status: <span style={{ color: segment.color, fontWeight: 'bold' }}>{segment.state}</span></div>
                  </Popup>
                </Polyline>
              )})}

              {/* Temple Marker */}
              <CircleMarker center={[temple.lat, temple.lng]} radius={8} pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 1 }}>
                <Popup>{temple.name}</Popup>
              </CircleMarker>
            </MapContainer>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN (3 cols) */}
        <div className="col-span-1 lg:col-span-3 flex flex-col gap-4 lg:overflow-y-auto lg:pl-2 custom-scrollbar">
          
          {/* AI Prediction Graph */}
          <div className={`border p-5 rounded-2xl h-56 flex flex-col backdrop-blur-xl shadow-lg transition-all ${emergencyMode ? 'bg-red-950/40 border-red-500/30 opacity-50 pointer-events-none' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
            <h3 className="text-xs font-mono text-neutral-400 flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-signal-blue" />
              AI PREDICTION (NEXT 60M)
            </h3>
            <div className="flex-grow">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={predictionData}>
                  <defs>
                    <linearGradient id="colorVis" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis dataKey="time" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} width={30} />
                  <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="visitors" stroke="#2563eb" fillOpacity={1} fill="url(#colorVis)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gemini AI Natural Language Insights */}
          <div className={`border p-4 rounded-sm flex flex-col gap-2 relative overflow-hidden transition-all duration-500 ${emergencyMode ? 'bg-[#2a0505] border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)]' : 'bg-[#050505] border-signal-blue/50 shadow-[0_0_15px_rgba(37,99,235,0.1)]'}`}>
            <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl rounded-full ${emergencyMode ? 'bg-red-500/20' : 'bg-signal-blue/10'}`}></div>
            <h3 className={`text-xs font-mono flex items-center gap-2 mb-2 relative z-10 ${emergencyMode ? 'text-red-500 font-bold' : 'text-signal-blue'}`}>
              <Sparkles className="w-4 h-4" />
              {emergencyMode ? 'CRISIS MITIGATION AI' : 'GEMINI AI INSIGHTS'}
            </h3>
            
            {llmResponse ? (
              <div className={`text-sm text-neutral-300 leading-relaxed relative z-10 bg-black/50 p-3 rounded border ${emergencyMode ? 'border-red-500/30' : 'border-white/5'}`}>
                {llmResponse}
              </div>
            ) : (
              <div className="text-xs text-neutral-500 italic relative z-10">
                Ask Gemini AI for real-time analysis...
              </div>
            )}

            <form onSubmit={askGeminiAI} className="mt-2 flex relative z-10">
              <input 
                type="text" 
                placeholder="E.g., Analyze crowd flow..." 
                className={`flex-grow bg-black border px-3 py-2 text-xs font-mono focus:outline-none ${emergencyMode ? 'border-red-500/50 focus:border-red-500' : 'border-white/20 focus:border-signal-blue'}`}
                value={llmPrompt}
                onChange={(e) => setLlmPrompt(e.target.value)}
                disabled={isGenerating || emergencyMode}
              />
              <button 
                type="submit" 
                className={`text-white px-4 py-2 text-xs font-bold tracking-wider disabled:opacity-50 ${emergencyMode ? 'bg-red-600' : 'bg-signal-blue'}`}
                disabled={isGenerating || emergencyMode}
              >
                {isGenerating ? '...' : 'ASK GEMINI'}
              </button>
            </form>
          </div>

          {/* CRISIS COORDINATION (Replaced Auto Notifications) */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-2xl flex-grow flex flex-col relative overflow-hidden shadow-lg transition-all hover:bg-white/10">
            <h3 className="text-xs font-mono text-neutral-400 flex items-center gap-2 mb-4">
              <Siren className="w-4 h-4 text-red-500" />
              CRISIS COORDINATION
            </h3>
            
            <div className="flex flex-col gap-4 flex-grow relative z-10 mt-2">
              <button 
                onClick={() => triggerEmergency('MEDICAL')}
                className="w-full bg-gradient-to-b from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 border-t border-red-400 border-b-4 border-b-red-950 text-white py-4 rounded-lg shadow-[0_5px_20px_rgba(220,38,38,0.4)] active:border-b-0 active:translate-y-1 text-base font-black tracking-widest flex items-center justify-between px-6 transition-all uppercase"
              >
                <span className="flex items-center gap-3 drop-shadow-md"><HeartPulse className="w-6 h-6" /> MEDICAL SOS</span>
                <span className="bg-black/20 p-1.5 rounded-full border border-white/20">→</span>
              </button>
              <button 
                onClick={() => triggerEmergency('FIRE')}
                className="w-full bg-gradient-to-b from-orange-600 to-orange-800 hover:from-orange-500 hover:to-orange-700 border-t border-orange-400 border-b-4 border-b-orange-950 text-white py-4 rounded-lg shadow-[0_5px_20px_rgba(234,88,12,0.4)] active:border-b-0 active:translate-y-1 text-base font-black tracking-widest flex items-center justify-between px-6 transition-all uppercase"
              >
                <span className="flex items-center gap-3 drop-shadow-md"><Flame className="w-6 h-6" /> FIRE / EVAC</span>
                <span className="bg-black/20 p-1.5 rounded-full border border-white/20">→</span>
              </button>
              <button 
                onClick={() => triggerEmergency('STAMPEDE')}
                className="w-full bg-gradient-to-b from-yellow-600 to-yellow-800 hover:from-yellow-500 hover:to-yellow-700 border-t border-yellow-400 border-b-4 border-b-yellow-950 text-white py-4 rounded-lg shadow-[0_5px_20px_rgba(202,138,4,0.4)] active:border-b-0 active:translate-y-1 text-base font-black tracking-widest flex items-center justify-between px-6 transition-all uppercase"
              >
                <span className="flex items-center gap-3 drop-shadow-md"><Users className="w-6 h-6" /> STAMPEDE RISK</span>
                <span className="bg-black/20 p-1.5 rounded-full border border-white/20">→</span>
              </button>
            </div>

            {emergencyMode && (
              <button 
                onClick={() => triggerEmergency(null)}
                className="w-full mt-4 bg-green-500 text-white py-3 rounded font-bold tracking-widest uppercase hover:bg-green-600 transition-colors shadow-[0_0_20px_rgba(34,197,94,0.4)]"
              >
                RESOLVE CRISIS
              </button>
            )}

            {/* Background Hazard Stripes */}
            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #fff 10px, #fff 20px)' }}></div>
          </div>

        </div>
      </div>

    </div>
  );
}
