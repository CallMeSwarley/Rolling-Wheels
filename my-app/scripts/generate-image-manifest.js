const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '../public');
const eventsDir = path.join(publicDir, 'events');
const outputFile = path.join(__dirname, '../public/image-manifest.json');

function getImagesFromFolder(folderPath) {
  try {
    if (!fs.existsSync(folderPath)) {
      return [];
    }
    
    const files = fs.readdirSync(folderPath);
    return files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext);
    }).sort();
  } catch (error) {
    console.error(`Error reading folder ${folderPath}:`, error);
    return [];
  }
}

function generateManifest() {
  const manifest = {};
  
  if (!fs.existsSync(eventsDir)) {
    console.log('Events directory not found, creating empty manifest');
    fs.writeFileSync(outputFile, JSON.stringify(manifest, null, 2));
    return;
  }
  
  const eventFolders = fs.readdirSync(eventsDir).filter(item => {
    return fs.statSync(path.join(eventsDir, item)).isDirectory();
  });
  
  eventFolders.forEach(folder => {
    const folderPath = path.join(eventsDir, folder);
    const images = getImagesFromFolder(folderPath);
    manifest[folder] = images.map(img => `/events/${folder}/${img}`);
    console.log(`Found ${images.length} images in ${folder}`);
  });
  
  // Also scan leiter_bilder if it exists
  const leiterDir = path.join(publicDir, 'leiter_bilder');
  if (fs.existsSync(leiterDir)) {
    const images = getImagesFromFolder(leiterDir);
    manifest['leiter_bilder'] = images.map(img => `/leiter_bilder/${img}`);
    console.log(`Found ${images.length} images in leiter_bilder`);
  }
  
  fs.writeFileSync(outputFile, JSON.stringify(manifest, null, 2));
  console.log(`Image manifest generated at ${outputFile}`);
}

generateManifest();
