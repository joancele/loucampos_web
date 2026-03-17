const fs = require('fs');
const path = require('path');

const paintingFilePath = path.join(__dirname, '../src/data/painting.json');
const photographyFilePath = path.join(__dirname, '../src/data/photography.json');

const paintingColMap = {
  majikaru: "Majikaru",
  kyodai: "Kyodai",
  barokku: "Barokku",
  kachiku: "Kachiku",
  masuku: "Masuku",
  zu: "Zu",
  gazou: "Gazou"
};

const photoColMap = {
  ugokunoka: "Ugoku no ka, ugokanai no ka",
  kiseki: "Kiseki",
  inorinobokyaku: "Inori no Boukyaku"
};

function updateFile(filePath, typeStr, colMap) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      const artworks = data[key];
      const collectionName = colMap[key] || key;
      for (const item of artworks) {
        item.alt = `${item.title} ${typeStr} de Lou Campos de la colección ${collectionName}`;
      }
    }
  }
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", 'utf8');
}

updateFile(paintingFilePath, "pintura", paintingColMap);
updateFile(photographyFilePath, "fotografía", photoColMap);

console.log('All alt tags updated successfully!');
