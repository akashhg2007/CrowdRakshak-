const fs = require('fs');
const scraped = JSON.parse(fs.readFileSync('scraped_temples.json'));

let output = 'export const templesDatabase = {\n';
for(let id in scraped) {
    output += `  '${id}': ${JSON.stringify(scraped[id])},\n`;
}
output += '};\n\n';

output += `export const searchTemple = (query) => {
  const q = query.toLowerCase();
  const match = Object.values(templesDatabase).find(t => t.name.toLowerCase().includes(q) || t.location.toLowerCase().includes(q));
  return match ? match.id : 'iskcon';
};\n`;

fs.writeFileSync('src/data/temples.js', output);
