export const templesDatabase = {
  iskcon: {
    id: "iskcon",
    name: "ISKCON Bangalore",
    location: "Hare Krishna Hill, Rajajinagar, Bengaluru",
    lat: 13.0094,
    lng: 77.5511,
    deity: "Sri Radha Krishna-Chandra",
    timings: "4:15 AM - 8:15 PM",
    baseCrowd: 12430,
    crowdStatus: "High (35% Surge)",
    waitTimes: { free: '45m', special: '15m', vip: '5m' },
    parkingSpots: 124,
    emergencyContacts: { fire: "Fire Dept (Rajajinagar)", medical: "On-site Medical Kiosk 1" }
  },
  udupi: {
    id: "udupi",
    name: "Udupi Sri Krishna Matha",
    location: "Car Street, Udupi, Karnataka",
    lat: 13.3414,
    lng: 74.7478,
    deity: "Bala Krishna",
    timings: "4:00 AM - 9:00 PM",
    baseCrowd: 8200,
    crowdStatus: "Moderate (Steady Flow)",
    waitTimes: { free: '20m', special: '10m', vip: 'Immediate' },
    parkingSpots: 45,
    emergencyContacts: { fire: "Udupi Fire Station", medical: "KMC Hospital" }
  },
  dharmasthala: {
    id: "dharmasthala",
    name: "Dharmasthala Manjunatha Temple",
    location: "Dharmasthala, Dakshina Kannada",
    lat: 12.9530,
    lng: 75.3855,
    deity: "Lord Shiva (Manjunatha)",
    timings: "6:30 AM - 8:30 PM",
    baseCrowd: 25600,
    crowdStatus: "Very High (Weekend Surge)",
    waitTimes: { free: '2h 15m', special: '45m', vip: '20m' },
    parkingSpots: 12, // Near full
    emergencyContacts: { fire: "Belthangady Fire Dept", medical: "SDM Hospital" }
  },
  murudeshwar: {
    id: "murudeshwar",
    name: "Murudeshwar Temple",
    location: "Murudeshwar, Uttara Kannada",
    lat: 14.0945,
    lng: 74.4849,
    deity: "Lord Shiva",
    timings: "3:00 AM - 8:00 PM",
    baseCrowd: 4100,
    crowdStatus: "Low (Clear)",
    waitTimes: { free: '10m', special: '5m', vip: 'Immediate' },
    parkingSpots: 310,
    emergencyContacts: { fire: "Bhatkal Fire Station", medical: "RNS Hospital" }
  },
  chamundeshwari: {
    id: "chamundeshwari",
    name: "Chamundeshwari Temple",
    location: "Chamundi Hills, Mysore",
    lat: 12.2740,
    lng: 76.6669,
    deity: "Goddess Chamundeshwari",
    timings: "7:30 AM - 9:00 PM",
    baseCrowd: 15300,
    crowdStatus: "High (Festive Rush)",
    waitTimes: { free: '1h 30m', special: '30m', vip: '10m' },
    parkingSpots: 0, // Full
    emergencyContacts: { fire: "Mysore Fire Brigade", medical: "Apollo BGS" }
  }
};

// Simple search function
export const searchTemple = (query) => {
  if (!query) return 'iskcon';
  const q = query.toLowerCase();
  
  if (q.includes('udupi') || q.includes('krishna math')) return 'udupi';
  if (q.includes('dharmasthala') || q.includes('manjunatha')) return 'dharmasthala';
  if (q.includes('murudeshwar') || q.includes('shiva')) return 'murudeshwar';
  if (q.includes('chamundi') || q.includes('mysore')) return 'chamundeshwari';
  
  // Default fallback
  return 'iskcon';
};
