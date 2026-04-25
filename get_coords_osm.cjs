const fs = require('fs');
const https = require('https');
const { execSync } = require('child_process');

function fetchNominatim(temple) {
    return new Promise((resolve) => {
        // Build a search query: "Temple Name, State, India"
        const query = encodeURIComponent(`${temple.name}, ${temple.state}, India`);
        const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;
        
        https.get(url, { headers: { 'User-Agent': 'CrowdRakshak-Bot/1.0 (test@example.com)' } }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    if (result && result.length > 0) {
                        resolve({ lat: parseFloat(result[0].lat), lon: parseFloat(result[0].lon) });
                    } else {
                        resolve(null);
                    }
                } catch(e) {
                    resolve(null);
                }
            });
        }).on('error', () => resolve(null));
    });
}

async function run() {
    const scraped = JSON.parse(fs.readFileSync('scraped_temples.json'));
    const temples = Object.values(scraped);
    
    // Filter temples that still have the default fallback coordinate (lat: 20.5937)
    const missingCoords = temples.filter(t => t.lat === 20.5937);
    console.log(`Need to fetch coordinates for ${missingCoords.length} temples using OSM Nominatim...`);
    
    let foundCount = 0;
    let processed = 0;

    for (const temple of missingCoords) {
        processed++;
        const coords = await fetchNominatim(temple);
        
        if (coords) {
            scraped[temple.id].lat = coords.lat;
            scraped[temple.id].lng = coords.lon;
            foundCount++;
        }
        
        if (processed % 10 === 0) {
            console.log(`Processed ${processed}/${missingCoords.length}... Found ${foundCount} coordinates.`);
            // Save progress and update temples.js every 10 temples
            fs.writeFileSync('scraped_temples.json', JSON.stringify(scraped, null, 2));
            execSync('node format.cjs', { stdio: 'ignore' });
        }
        
        // Strict 1.2 second delay to respect OSM TOS
        await new Promise(r => setTimeout(r, 1200));
    }
    
    console.log(`Finished OSM! Successfully pulled GPS coordinates for ${foundCount} temples!`);
    fs.writeFileSync('scraped_temples.json', JSON.stringify(scraped, null, 2));
    execSync('node format.cjs', { stdio: 'ignore' });
}

run();
