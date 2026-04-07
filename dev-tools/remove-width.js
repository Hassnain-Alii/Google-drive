const fs = require('fs');
const path = require('path');
const cssDir = path.join(__dirname, 'public', 'stylesheets');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.css')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            
            // Search inside 'main {' blocks roughly or simply replace all exact instances in the CSS
            if (content.includes('width: 75%;')) {
                // We're replacing it with 'width: auto;' within main structures so flex: 1 gracefully takes over.
                // It ensures the gap is fluid.
                content = content.replace(/width:\s*75%;/g, 'width: auto;');
                
                fs.writeFileSync(fullPath, content);
                console.log('Replaced 75% width in ' + fullPath);
            }
        }
    }
}

processDir(cssDir);
