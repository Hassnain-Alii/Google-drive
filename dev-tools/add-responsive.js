const fs = require('fs');
const path = require('path');
const cssDir = path.join(__dirname, 'public', 'stylesheets');

// CSS append chunk
const responsiveCss = `
/* GLOBAL RESPONSIVE MEDIA QUERIES */
@media screen and (max-width: 1024px) {
  main {
    width: 100% !important;
    min-width: 100% !important;
    border-radius: 0 !important;
  }
}
@media screen and (max-width: 768px) {
  .file-item-container-owner,
  .file-owner-title,
  .file-item-container-date-modified,
  .file-date-modified-title,
  .file-item-container-size,
  .file-size-title,
  .file-container-sort,
  .file-item-container-reason-sugg,
  .file-reason-title,
  .file-item-container-location,
  .file-location-title {
    display: none !important;
  }
  .file-name-title, .file-item-container-header, .file-item-container-title { 
    width: 90% !important; 
    max-width: 90% !important; 
  }
  .file-container-header { 
    padding-left: 5px !important; 
    font-size: 0.8rem !important; 
    display: flex !important;
    justify-content: space-between !important;
  }
}
`;

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.css')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('main {') && !content.includes('GLOBAL RESPONSIVE MEDIA QUERIES')) {
                fs.appendFileSync(fullPath, '\n' + responsiveCss + '\n');
                console.log('Appended to ' + fullPath);
            }
        }
    }
}
processDir(cssDir);
