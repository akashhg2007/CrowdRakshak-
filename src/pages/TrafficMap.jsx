import React, { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, TrafficLayer, Marker, InfoWindow } from '@react-google-maps/api';
import { Map, AlertTriangle, Route, Activity } from 'lucide-react';

// You would replace this with a real API key in production.
// For the hackathon demo, we handle the lack of an API key gracefully.
const GOOGLE_MAPS_API_KEY = "AIzaSy_MOCK_HACKATHON_KEY_DEMO_ONLY"; 
const isMockKey = GOOGLE_MAPS_API_KEY === "AIzaSy_MOCK_HACKATHON_KEY_DEMO_ONLY";

const containerStyle = {
  width: '100%',
  height: '100%'
};

// Center on Bengaluru (specifically between ISKCON and major traffic hubs)
const center = {
  lat: 12.9716,
  lng: 77.5946
};

// Custom dark map style for "Premium" look
const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#212121" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#757575" }] },
  { featureType: "administrative.country", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
  { featureType: "administrative.land_parcel", stylers: [{ visibility: "off" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#bdbdbd" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#181818" }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { featureType: "poi.park", elementType: "labels.text.stroke", stylers: [{ color: "#1b1b1b" }] },
  { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#2c2c2c" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#8a8a8a" }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#373737" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#3c3c3c" }] },
  { featureType: "road.highway.controlled_access", elementType: "geometry", stylers: [{ color: "#4e4e4e" }] },
  { featureType: "road.local", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { featureType: "transit", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#3d3d3d" }] }
];

export default function TrafficMap() {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY
  });

  const [map, setMap] = useState(null);
  const [activeMarker, setActiveMarker] = useState(null);

  const onLoad = useCallback(function callback(map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback(map) {
    setMap(null);
  }, []);

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-64px)] bg-[#050505] font-sans text-white">
      
      {/* Left Sidebar: AI Traffic Predictions */}
      <div className="w-full md:w-96 border-r border-white/10 bg-black p-6 flex flex-col gap-6 shrink-0 custom-scrollbar overflow-y-auto">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-tight flex items-center gap-2 mb-2">
            <Activity className="text-signal-blue w-6 h-6" />
            Crowd & Traffic AI
          </h1>
          <p className="text-xs text-neutral-400 font-mono leading-relaxed">
            Correlating live Bengaluru traffic congestion with Temple event loads to predict bottlenecks.
          </p>
        </div>

        {/* Traffic Alert */}
        <div className="border border-red-500/50 bg-red-500/10 rounded-lg p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-red-500 font-bold text-sm uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" /> AI Prediction Alert
          </div>
          <p className="text-sm font-medium">Next congestion likely at Whitefield in 15 mins.</p>
          <div className="bg-black/50 p-3 rounded border border-red-500/20">
            <span className="text-xs font-mono text-neutral-400 block mb-1">Risk Factors:</span>
            <span className="text-xs text-red-400 block">• Evening Office Rush (6:00 PM)</span>
            <span className="text-xs text-red-400 block">• ISKCON Temple Event Spike (+12% flow)</span>
          </div>
        </div>

        {/* Route Suggestion */}
        <div className="border border-signal-blue/50 bg-signal-blue/5 rounded-lg p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-signal-blue font-bold text-sm uppercase tracking-wider">
            <Route className="w-4 h-4" /> Suggested Action
          </div>
          <p className="text-sm">Divert incoming temple crowd from Outer Ring Road to Old Madras Road.</p>
          <button className="w-full bg-signal-blue text-white font-bold text-xs py-2 mt-2 rounded transition hover:bg-blue-600">
            BROADCAST REROUTE
          </button>
        </div>

        <div className="mt-auto border-t border-white/10 pt-4">
          <p className="text-[10px] text-neutral-500 font-mono text-center">
            [ POWERED BY GOOGLE MAPS TRAFFIC API ]
          </p>
        </div>
      </div>

      {/* Right Content: Live Map */}
      <div className="flex-grow relative bg-[#111] overflow-hidden">
        {isMockKey ? (
          /* Premium Hackathon Mock View */
          <div className="absolute inset-0 w-full h-full">
            {/* Dark Map Background Grid */}
            <div className="absolute inset-0 bg-[#1a1a1a] bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
            
            {/* Fake Roads & Traffic Lines */}
            <svg className="absolute inset-0 w-full h-full opacity-60" xmlns="http://www.w3.org/2000/svg">
              <path d="M 100 800 Q 300 500 500 400 T 1200 200" stroke="#ef4444" strokeWidth="8" fill="none" className="animate-pulse" />
              <path d="M 0 300 Q 400 400 600 600 T 1000 800" stroke="#eab308" strokeWidth="6" fill="none" />
              <path d="M 800 0 L 800 1000" stroke="#22c55e" strokeWidth="6" fill="none" />
            </svg>

            <div className="absolute inset-0 flex items-center justify-center flex-col gap-4 text-center p-6 bg-black/60 backdrop-blur-sm z-10">
              <Map className="w-16 h-16 text-signal-blue animate-bounce" />
              <h2 className="text-2xl font-bold uppercase tracking-widest">Google Maps API Required</h2>
              <p className="text-sm text-neutral-400 max-w-md leading-relaxed">
                To view the live Traffic Layer, insert your Google Cloud API Key in <code className="text-signal-blue">src/pages/TrafficMap.jsx</code>. <br/><br/>
                For now, this premium mock view prevents the ugly gray error screen during your hackathon presentation!
              </p>
            </div>
            
            {/* Mock Markers */}
            <div className="absolute top-[40%] left-[40%] z-0">
              <div className="w-24 h-24 bg-red-500/20 rounded-full blur-xl absolute -inset-4 animate-pulse"></div>
              <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-black relative z-10 shadow-[0_0_15px_rgba(239,68,68,1)]"></div>
              <span className="text-xs font-bold mt-2 block text-red-500">ISKCON (High Crowd)</span>
            </div>
            <div className="absolute top-[20%] right-[30%] z-0">
              <div className="w-24 h-24 bg-yellow-500/20 rounded-full blur-xl absolute -inset-4"></div>
              <div className="w-4 h-4 bg-yellow-500 rounded-full border-2 border-black relative z-10 shadow-[0_0_15px_rgba(234,179,8,1)]"></div>
              <span className="text-xs font-bold mt-2 block text-yellow-500">Whitefield (+15m)</span>
            </div>
          </div>
        ) : loadError ? (
          <div className="absolute inset-0 flex items-center justify-center flex-col gap-4 text-center p-6">
            <Map className="w-12 h-12 text-red-500" />
            <h2 className="text-xl font-bold">Google Maps API Error</h2>
            <p className="text-sm text-neutral-400 max-w-md">
              A valid Google Maps API key is required.
            </p>
          </div>
        ) : isLoaded ? (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={12}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={{
              styles: darkMapStyle,
              disableDefaultUI: true,
              zoomControl: true,
            }}
          >
            <TrafficLayer />

            {/* Mock Temple Marker */}
            <Marker 
              position={{ lat: 13.0094, lng: 77.5511 }} // ISKCON
              onClick={() => setActiveMarker('iskcon')}
              icon={{
                path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
                fillColor: '#ef4444',
                fillOpacity: 1,
                strokeWeight: 0,
                scale: 1.5,
                anchor: { x: 12, y: 24 }
              }}
            />

            {/* Mock Congestion Marker */}
            <Marker 
              position={{ lat: 12.9698, lng: 77.7499 }} // Whitefield
              onClick={() => setActiveMarker('whitefield')}
              icon={{
                path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
                fillColor: '#eab308',
                fillOpacity: 1,
                strokeWeight: 0,
                scale: 1.5,
                anchor: { x: 12, y: 24 }
              }}
            />

            {activeMarker === 'iskcon' && (
              <InfoWindow position={{ lat: 13.0094, lng: 77.5511 }} onCloseClick={() => setActiveMarker(null)}>
                <div className="text-black font-sans p-1">
                  <h3 className="font-bold">ISKCON Temple</h3>
                  <p className="text-xs">High crowd. Exit routes congested.</p>
                </div>
              </InfoWindow>
            )}

            {activeMarker === 'whitefield' && (
              <InfoWindow position={{ lat: 12.9698, lng: 77.7499 }} onCloseClick={() => setActiveMarker(null)}>
                <div className="text-black font-sans p-1">
                  <h3 className="font-bold">Whitefield</h3>
                  <p className="text-xs">Predicted congestion in 15m.</p>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center flex-col gap-4">
            <div className="w-8 h-8 border-4 border-signal-blue border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-mono text-neutral-400">INITIALIZING GOOGLE MAPS TRAFFIC API...</p>
          </div>
        )}
      </div>

    </div>
  );
}
