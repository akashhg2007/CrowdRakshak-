const fs = require('fs');
const https = require('https');

function fetchWikitext() {
    return new Promise((resolve, reject) => {
        https.get('https://en.wikipedia.org/w/api.php?action=parse&page=List_of_Hindu_temples_in_India&prop=wikitext&format=json', {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(JSON.parse(data).parse.wikitext['*']));
        }).on('error', reject);
    });
}

async function scrapeTemples() {
    console.log("Fetching Wikipedia data...");
    const wikitext = await fetchWikitext();
    
    const lines = wikitext.split('\n');
    let currentState = '';
    const temples = {};
    let idCounter = 1;

    for (const line of lines) {
        // States are usually in level 2 or 3 headers: == Andhra Pradesh == or === Tamil Nadu ===
        const stateMatch = line.match(/^==+([^=]+)==+$/);
        if (stateMatch) {
            let stateName = stateMatch[1].trim();
            // Ignore non-state headers
            if (stateName.toLowerCase().includes('see also') || stateName.toLowerCase().includes('references') || stateName.toLowerCase().includes('external links')) {
                continue;
            }
            currentState = stateName.replace(/\[\[|\]\]/g, '').split('|')[0]; // Clean wiki links
        }

        // Temples are usually listed with asterisks: * [[Temple Name]]
        const templeMatch = line.match(/^\*\s*\[\[([^\]]+)\]\]/);
        if (templeMatch && currentState) {
            let rawName = templeMatch[1].split('|')[0].trim();
            
            // Filter out empty or meta-wiki names
            if (rawName && !rawName.includes('File:')) {
                let id = rawName.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + idCounter++;
                temples[id] = {
                    id: id,
                    name: rawName,
                    state: currentState,
                    location: `${currentState}, India`, // Fallback location
                    lat: 20.5937, // Default center of India
                    lng: 78.9629,
                    baseCrowd: 5000,
                    parkingSpots: 100,
                    waitTimes: { free: 'TBD', special: 'TBD', vip: 'TBD' }
                };
            }
        }
    }

    console.log(`Extracted ${Object.keys(temples).length} temples across India.`);
    
    // Write to a temporary JSON file to review
    fs.writeFileSync('scraped_temples.json', JSON.stringify(temples, null, 2));
    console.log("Saved to scraped_temples.json");
}

scrapeTemples();
