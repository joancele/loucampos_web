import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, '../src/data');
const publicDir = path.join(__dirname, '../public');
const filesToProcess = ['painting.json', 'photography.json'];

// Se asegura de que exista la carpeta public
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
}

const redirectsFile = path.join(publicDir, '_redirects');
let redirectsContent = '# Redirecciones Automáticas para los enlaces de obras (Short-links)\n\n';

for (const file of filesToProcess) {
    const filePath = path.join(dataDir, file);
    if (!fs.existsSync(filePath)) {
        console.error(`Archivo ${file} no encontrado.`);
        continue;
    }

    const rawData = fs.readFileSync(filePath, 'utf-8');
    let jsonData;
    try {
        jsonData = JSON.parse(rawData);
    } catch (e) {
        console.error(`Error parseando ${file}:`, e);
        continue;
    }

    const seriesType = file.replace('.json', ''); // 'painting' o 'photography'

    for (const [series, artworks] of Object.entries(jsonData)) {
        for (const artwork of artworks) {
            if (artwork.id) {
                // Formato Cloudflare _redirects:
                // /D4EA0273B5 /works/photography?artwork=D4EA0273B5 302
                redirectsContent += `/${artwork.id} /works/${seriesType}?artwork=${artwork.id} 302\n`;
            }
        }
    }
}

// Escribir el archivo
fs.writeFileSync(redirectsFile, redirectsContent, 'utf-8');
console.log('✅ Archivo _redirects generado correctamente en la carpeta public.');
