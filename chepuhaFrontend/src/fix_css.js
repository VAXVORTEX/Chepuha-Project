const fs = require('fs');

// 1. App.tsx: remove flag-pirates-2 and flag-pirates-3
let tsx = fs.readFileSync('App.tsx', 'utf8');
tsx = tsx.replace(/'special:flag-pirates-2',\s*/g, '');
tsx = tsx.replace(/'special:flag-pirates-3',\s*/g, '');
fs.writeFileSync('App.tsx', tsx);

// 2. App.scss: revert grayscale and fix flags & gradients
let css = fs.readFileSync('App.scss', 'utf8');

// Revert grayscale from pirate swatches
css = css.replace(/filter:\s*grayscale\(1\);\s*/g, '');

// Fix Ukraine flag text explicitly
css = css.replace(/\.flag-ua-text\s*\{[\s\S]*?\}/, `.flag-ua-text {
  background: linear-gradient(to bottom, #0057b7 50%, #ffd700 50%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent !important;
  color: transparent !important;
  display: inline-block;
  text-shadow: none !important;
  font-weight: bold;
}`);
  
// Fix LGBT trans flag
css = css.replace(/(\.gender-trans-text\s*\{[\s\S]*?background:\s*linear-gradient\().*?(\)(?: !important)?;)/, '$1to bottom, #5bcefa 18%, #f5a9b8 18%, #f5a9b8 40%, #ffffff 40%, #ffffff 60%, #f5a9b8 60%, #f5a9b8 82%, #5bcefa 82%$2');

// 3. Generate robust animations
const keyframes = `
@keyframes rainbow-text-animation {
  0% { background-position: 0% 50%; }
  100% { background-position: -200% 50%; }
}
@keyframes rainbow-text-animation-up {
  0% { background-position: 50% 0%; }
  100% { background-position: 50% -200%; }
}
@keyframes rainbow-text-animation-down {
  0% { background-position: 50% 0%; }
  100% { background-position: 50% 200%; }
}
@keyframes rainbow-text-animation-diagonal {
  0% { background-position: 0% 0%; }
  100% { background-position: -200% -200%; }
}
`;

if (!css.includes('rainbow-text-animation-up')) {
  css = css.replace(/@keyframes rainbow-text-animation\s*\{[\s\S]*?100%\s*\{[^}]+\}\s*\}/g, keyframes);
}

// Update ALL classes that have rainbow-text-animation
css = css.replace(/(\.[a-zA-Z0-9_-]+-text\s*\{[^}]*?background:\s*linear-gradient\()([^)]+)(\)[^}]*?animation:\s*rainbow-text-animation.*?[^}]*?\})/g, 
(match, prefix, colorsStr, suffix) => {
    let parts = colorsStr.split(/,\s*(?![^()]*\))/);
    let direction = '';
    
    let originalDirection = parts[0].trim();
    if (originalDirection.includes('deg') || originalDirection.includes('to ') || originalDirection.includes('circle')) {
        direction = parts.shift() + ', ';
    }
    
    // Check if we already duplicated colors (if there are many colors and the first half matches the second half loosely)
    // To be safe, let's just do it. If there's 20 colors, it multiplies to 40, which is perfectly fine in CSS.
    let baseFirst = parts[0];
    let newColors = [...parts, ...parts, baseFirst].join(', ');
    
    let bgSize = '200% auto';
    let animUpdate = suffix;
    
    if (originalDirection === 'to bottom' || originalDirection === 'to top' || originalDirection === '180deg' || originalDirection === '0deg') {
        bgSize = 'auto 200%';
        animUpdate = animUpdate.replace('rainbow-text-animation', 'rainbow-text-animation-down');
    } else if (originalDirection !== '' && originalDirection.includes('deg') && originalDirection !== '90deg' && originalDirection !== '270deg') {
        bgSize = '200% 200%';
        animUpdate = animUpdate.replace('rainbow-text-animation', 'rainbow-text-animation-diagonal');
    } else if (originalDirection.includes('circle')) {
        bgSize = '200% 200%';
        animUpdate = animUpdate.replace('rainbow-text-animation', 'rainbow-text-animation-diagonal');
    }
    
    // Safe replace background-size
    if (!animUpdate.includes('background-size')) {
        animUpdate = animUpdate.replace(/(animation:[^;]+;)/, '$1\n  background-size: ' + bgSize + ';');
    } else {
        animUpdate = animUpdate.replace(/background-size:\s*[^;]+;/, 'background-size: ' + bgSize + ';');
    }

    return prefix + direction + newColors + animUpdate;
});

fs.writeFileSync('App.scss', css);
console.log('Success');
