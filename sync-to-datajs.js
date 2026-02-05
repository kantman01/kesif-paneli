const fs = require('fs');
const path = require('path');

// ancient-sites.json'dan oku (BOM'u kaldır)
const jsonPath = path.join(__dirname, 'data', 'ancient-sites.json');
let jsonContent = fs.readFileSync(jsonPath, 'utf8');
// BOM karakterini kaldır
if (jsonContent.charCodeAt(0) === 0xFEFF) {
    jsonContent = jsonContent.slice(1);
}
const sites = JSON.parse(jsonContent);

console.log(`📚 Toplam ${sites.length} eser yüklendi`);

// data.js formatına çevir
const dataJsContent = `const ANCIENT_SITES = ${JSON.stringify(sites, null, 2)};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ANCIENT_SITES;
}
`;

// data.js'e yaz
const dataJsPath = path.join(__dirname, 'frontend', 'data.js');
fs.writeFileSync(dataJsPath, dataJsContent, 'utf8');

console.log(`✅ data.js güncellendi! Toplam ${sites.length} eser.`);

// Medeniyet dağılımını göster
const greekCount = sites.filter(s => s.type.includes('Greek')).length;
const romanCount = sites.filter(s => s.type.includes('Roman')).length;
const ottomanCount = sites.filter(s => s.type === 'Ottoman').length;

console.log(`\n📊 Medeniyet Dağılımı:`);
console.log(`   🏛️  Yunan: ${greekCount}`);
console.log(`   ⚔️  Roma: ${romanCount}`);
console.log(`   🏰 Osmanlı: ${ottomanCount}`);
