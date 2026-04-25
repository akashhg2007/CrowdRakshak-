const fs = require('fs');
const https = require('https');

function fetchCoordinates(titles) {
    return new Promise((resolve, reject) => {
        const titleQuery = encodeURIComponent(titles.join('|'));
        const url = `https://en.wikipedia.org/w/api.php?action=query&prop=coordinates&titles=${titleQuery}&format=json`;
        
        https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch(e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

async function run() {
    const scraped = JSON.parse(fs.readFileSync('scraped_temples.json'));
    const temples = Object.values(scraped);
    
    // Batch in groups of 50
    const BATCH_SIZE = 50;
    console.log(`Fetching coordinates for ${temples.length} temples...`);
    
    let foundCount = 0;

    for (let i = 0; i < temples.length; i += BATCH_SIZE) {
        const batch = temples.slice(i, i + BATCH_SIZE);
        const titles = batch.map(t => t.name);
        
        try {
            const result = await fetchCoordinates(titles);
            const pages = result.query.pages;
            
            // Map the results back
            // pages is an object with pageId as keys
            for (let pageId in pages) {
                const page = pages[pageId];
                if (page.coordinates && page.coordinates.length > 0) {
                    const lat = page.coordinates[0].lat;
                    const lon = page.coordinates[0].lon;
                    
                    // Find the temple that matches this title
                    const matchingTemple = temples.find(t => t.name.toLowerCase() === page.title.toLowerCase());
                    if (matchingTemple) {
                        scraped[matchingTemple.id].lat = lat;
                        scraped[matchingTemple.id].lng = lon;
                        foundCount++;
                    }
                }
            }
            console.log(`Processed batch ${i / BATCH_SIZE + 1}... Found ${foundCount} exact coordinates so far.`);
        } catch (e) {
            console.error("Error fetching batch:", e.message);
        }
        
        // Sleep for 500ms to avoid overwhelming Wikipedia API
        await new Promise(r => setTimeout(r, 500));
    }
    
    console.log(`Finished! Successfully pulled exact GPS coordinates for ${foundCount} temples!`);
    fs.writeFileSync('scraped_temples.json', JSON.stringify(scraped, null, 2));
}

run();
