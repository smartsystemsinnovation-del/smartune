const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('c:/Users/lagsu/OneDrive/Escritorio/Smartune/web/src/app', function(filePath) {
  if (filePath.endsWith('.tsx') && !filePath.includes('layout.tsx') && !filePath.includes('page.tsx')) {
    // wait, we want to check all .tsx files EXCEPT layout.tsx
    // actually page.tsx is fine to check.
  }
  if (filePath.endsWith('.tsx') && !filePath.includes('layout.tsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Remove Navigation import
    content = content.replace(/import Navigation from ['"].*Navigation['"];?\n?/g, '');
    
    // Remove <Navigation /> component
    content = content.replace(/<Navigation\s*\/>\n?/g, '');
    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Cleaned:', filePath);
    }
  }
});
