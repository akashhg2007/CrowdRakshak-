const fs = require('fs');
const https = require('https');
const { execSync } = require('child_process');

function fetchNominatim(url) {
    return new Promise((resolve) => {
        https.get(url, { headers: { 'User-Agent': 'CrowdRakshak-Bot/1.0' } }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    resolve(result);
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
    
    // First pass: Reverse geocode the 171 temples that already have exact coordinates
    const knownTemples = temples.filter(t => t.lat !== 20.5937 && !t.location.includes('District'));
    console.log(`Enriching ${knownTemples.length} temples with known coordinates...`);
    
    let processed = 0;
    let found = 0;

    for (const temple of knownTemples) {
        processed++;
        const url = `https://nominatim.openstreetmap.org/reverse?lat=${temple.lat}&lon=${temple.lng}&format=json`;
        const res = await fetchNominatim(url);
        
        if (res && res.address) {
            const district = res.address.state_district || res.address.county || res.address.city;
            if (district) {
                scraped[temple.id].location = `${district}, ${temple.state}, India`;
                found++;
            }
        }
        
        if (processed % 10 === 0) {
            console.log(`Processed ${processed}/${knownTemples.length} reverse geocodes... Found ${found} districts.`);
            fs.writeFileSync('scraped_temples.json', JSON.stringify(scraped, null, 2));
            execSync('node format.cjs', { stdio: 'ignore' });
        }
        
        await new Promise(r => setTimeout(r, 1200));
    }
    
    console.log(`Finished Reverse Geocoding! Added districts to ${found} temples.`);
    fs.writeFileSync('scraped_temples.json', JSON.stringify(scraped, null, 2));
    execSync('node format.cjs', { stdio: 'ignore' });
}

run();
