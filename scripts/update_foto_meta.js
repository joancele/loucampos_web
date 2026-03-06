import fs from 'fs';

let content = fs.readFileSync('src/pages/works/fotografia.astro', 'utf8');

const regex = /const ugokunokaArtworks = \[([\s\S]*?)\];/;

const match = content.match(regex);
if (match) {
    let inner = match[1];

    // Note: Astro objects might be formatted slightly differently, let's just do a string replace per block
    // A simpler Regex to match each object in the array
    const objRegex = /\{\s*title:\s*"[^"]*",\s*year:\s*"[^"]*",\s*description:\s*"[^"]*",\s*image:\s*"([^"]+)",\s*alt:\s*"[^"]*"\s*,?\s*\}/g;

    inner = inner.replace(objRegex, (match, image) => {
        // Extract filename from URL
        let urlObj;
        let filename = image;
        try {
            urlObj = new URL(image);
            filename = urlObj.pathname.split('/').pop();
        } catch {
            // If not a valid URL just split by /
            filename = image.split('/').pop().split('?')[0];
        }

        filename = decodeURIComponent(filename);
        let name = filename.replace(/\.[^/.]+$/, ""); // Remove extension
        let title = name.charAt(0).toUpperCase() + name.slice(1); // Capitalize

        return `{
    title: "${title}",
    year: "2020",
    description: "Fotografía digital.",
    image:
      "${image}",
    alt: "${title}",
  }`;
    });

    content = content.replace(regex, `const ugokunokaArtworks = [${inner}];`);
    fs.writeFileSync('src/pages/works/fotografia.astro', content);
    console.log('Update successful');
} else {
    console.log('Array not found.');
}
