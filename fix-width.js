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
            let changed = false;

            // Fix the chaotic CSS line output created by multiple script runs
            if (content.includes('/* let flex: 1 take over */')) {
                // Completely swap main { ... flex: 1; ... } to perfectly clean styling
                content = content.replace(/ \/\* min-\/\* width: auto; - removed for true flex \*\/ width: auto; \/\* let flex: 1 take over \*\/ \*\//g, ' /* min-width: auto; */');
                content = content.replace(/ \/\* width: auto; - removed for true flex \*\/ width: auto; \/\* let flex: 1 take over \*\//g, ' width: auto; ');
                content = content.replace(/\/\* min-width: 75%; \*\//g, '/* min-width: auto; */');
                content = content.replace(/width: 75%;/g, 'width: auto;');
                
                // Extra cleanup for nested messes
                content = content.replace(/\/\* min-\/\* width: auto;.*?over \*\/ \*\//g, '');
                content = content.replace(/\/\* width: auto; -.*?over \*\//g, 'width: auto;');

                changed = true;
            }
            
            // Just normal width: 75%; fallback handling
            if (content.includes('width: 75%;')) {
                content = content.replace(/width: 75%;/g, 'width: auto;');
                content = content.replace(/\/\* min-width: 75%; \*\//g, '/* min-width: auto; */');
                changed = true;
            }

            if (changed) {
                fs.writeFileSync(fullPath, content);
                console.log('Fixed lines in ' + fullPath);
            }
        }
    }
}

processDir(cssDir);
