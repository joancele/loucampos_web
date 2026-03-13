import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, '../src/data');
const filesToProcess = ['painting.json', 'photography.json'];

function generateId(title, year) {
    const hash = crypto.createHash('sha256');
    hash.update(`${title.toLowerCase().trim()}|${year.trim()}`);
    return hash.digest('hex').substring(0, 10).toUpperCase();
}

for (const file of filesToProcess) {
    const filePath = path.join(dataDir, file);
    if (!fs.existsSync(filePath)) {
        console.error(`File ${file} not found.`);
        continue;
    }

    const rawData = fs.readFileSync(filePath, 'utf-8');
    let jsonData;
    try {
        jsonData = JSON.parse(rawData);
    } catch (e) {
        console.error(`Error parsing ${file}:`, e);
        continue;
    }

    let modified = false;

    for (const [series, artworks] of Object.entries(jsonData)) {
        for (const artwork of artworks) {
            if (!artwork.id) {
                // Create a new object with ID as the first property to keep it clean, or just add it
                // We will just add it, but since JS objects maintain insertion order for string keys,
                // it will appear at the end. To put it at the beginning we would need to reconstruct it.
                // Reconstructing to put id at the top:
                const { title, year, description, image, alt, ...rest } = artwork;
                const newArtwork = {
                    id: generateId(title, year),
                    title,
                    year,
                    description,
                    image,
                    alt,
                    ...rest
                };

                // Replace in array
                const index = artworks.indexOf(artwork);
                artworks[index] = newArtwork;

                modified = true;
                console.log(`Generated ID ${newArtwork.id} for ${title} (${year}) in ${series}`);
            }
        }
    }

    if (modified) {
        fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2), 'utf-8');
        console.log(`Updated ${file} with new IDs.`);
    } else {
        console.log(`No new IDs generated for ${file}.`);
    }
}
