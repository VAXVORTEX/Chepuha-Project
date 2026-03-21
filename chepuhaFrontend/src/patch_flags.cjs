const fs = require('fs');
const path = require('path');

const scssPath = path.join(__dirname, 'App.scss');
let css = fs.readFileSync(scssPath, 'utf8');

// 1. ADD MISSING COUNTRY FLAGS WITH SHARP GRADIENTS
const missingFlags = `
/* --- MISSING COUNTRY FLAGS --- */
.flag-de-text { background: linear-gradient(to bottom, #000000 33.33%, #FF0000 33.33%, #FF0000 66.66%, #FFcc00 66.66%); }
.flag-fr-text { background: linear-gradient(to right, #0055A4 33.33%, #FFFFFF 33.33%, #FFFFFF 66.66%, #EF4135 66.66%); }
.flag-jp-text { background: radial-gradient(circle at center, #BC002D 25%, #FFFFFF 25%); }
.flag-pl-text { background: linear-gradient(to bottom, #FFFFFF 50%, #DC143C 50%); }
.flag-it-text { background: linear-gradient(to right, #009246 33.33%, #FFFFFF 33.33%, #FFFFFF 66.66%, #CE2B37 66.66%); }
.flag-es-text { background: linear-gradient(to bottom, #AA151B 25%, #F1BF00 25%, #F1BF00 75%, #AA151B 75%); }
.flag-br-text { background: linear-gradient(to right, #009C3B 20%, #FFDF00 20%, #FFDF00 50%, #002776 50%, #002776 75%, #009C3B 75%); }
.flag-ca-text { background: linear-gradient(to right, #FF0000 25%, #FFFFFF 25%, #FFFFFF 75%, #FF0000 75%); }
.flag-cn-text { background: linear-gradient(to right, #EE1C25 15%, #FFFF00 15%, #EE1C25 20%, #EE1C25 80%, #FFFF00 80%, #EE1C25 85%); }
.flag-kr-text { background: linear-gradient(to right, #FFFFFF 25%, #CD2E3A 25%, #CD2E3A 50%, #0F64CD 50%, #0F64CD 75%, #000000 75%); }
.flag-au-text { background: linear-gradient(to right, #00008B 30%, #FF0000 30%, #FF0000 40%, #00008B 40%, #00008B 60%, #FFFFFF 60%, #FFFFFF 70%, #00008B 70%); }
`;

if (!css.includes('.flag-it-text')) {
    css += '\n' + missingFlags + '\n';
}

// Ensure all flag-*-text missing rules have the background-clip text stuff
['de', 'fr', 'jp', 'pl', 'it', 'es', 'br', 'ca', 'cn', 'kr', 'au'].forEach(cc => {
    let cls = `.flag-${cc}-text`;
    if (!css.includes(`${cls} { background`)) return;
    css = css.replace(new RegExp(`(\\\\.flag-${cc}-text\\\\s*\\\\{\\\\s*background:[^;]+;)`), `$1\n  -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent !important; color: transparent !important; display: inline-block; font-weight: bold; padding: 2px;`);
});

// 2. MAKE EXISTING FLAGS SHARP
const fixGradients = {
    '.flag-usa-text': `linear-gradient(to right, #002868 30%, #bf0a30 30%, #bf0a30 40%, #ffffff 40%, #ffffff 50%, #bf0a30 50%, #bf0a30 60%, #ffffff 60%, #ffffff 70%, #bf0a30 70%, #bf0a30 80%, #ffffff 80%, #ffffff 90%, #bf0a30 90%)`,
    '.flag-uk-text': `linear-gradient(to right, #012169 20%, #ffffff 20%, #ffffff 30%, #C8102E 30%, #C8102E 40%, #ffffff 40%, #ffffff 50%, #012169 50%, #012169 60%, #ffffff 60%, #ffffff 70%, #C8102E 70%, #C8102E 80%, #ffffff 80%, #ffffff 90%, #012169 90%)`,
    '.flag-bi-text': `linear-gradient(to bottom, #d60270 40%, #9b4f96 40%, #9b4f96 60%, #0038a8 60%)`,
    '.flag-pan-text': `linear-gradient(to bottom, #ff218c 33.33%, #ffd800 33.33%, #ffd800 66.66%, #21b1ff 66.66%)`,
    '.flag-ace-text': `linear-gradient(to bottom, #000000 25%, #a3a3a3 25%, #a3a3a3 50%, #ffffff 50%, #ffffff 75%, #800080 75%)`,
    '.flag-nonbinary-text': `linear-gradient(to bottom, #fcf434 25%, #ffffff 25%, #ffffff 50%, #9c59d1 50%, #9c59d1 75%, #2c2c2c 75%)`,
    '.gender-pride-text': `linear-gradient(to bottom, #e40303 16.66%, #ff8c00 16.66%, #ff8c00 33.33%, #ffed00 33.33%, #ffed00 50%, #008026 50%, #008026 66.66%, #24408e 66.66%, #24408e 83.33%, #732982 83.33%)`,
    '.flag-lesbian-text': `linear-gradient(to bottom, #d52d00 20%, #ff9a56 20%, #ff9a56 40%, #ffffff 40%, #ffffff 60%, #d362a4 60%, #d362a4 80%, #a30262 80%)`,
    '.flag-intersex-text': `linear-gradient(to right, #ffd800 20%, #7902aa 20%, #7902aa 40%, #ffd800 40%, #ffd800 60%, #7902aa 60%, #7902aa 80%, #ffd800 80%)`,
    '.flag-genderqueer-text': `linear-gradient(to bottom, #b57edc 33.33%, #ffffff 33.33%, #ffffff 66.66%, #4a8123 66.66%)`,
    '.flag-polysexual-text': `linear-gradient(to bottom, #f714ba 33.33%, #01d66a 33.33%, #01d66a 66.66%, #1594f6 66.66%)`
};

for (const [cls, grad] of Object.entries(fixGradients)) {
    const regex = new RegExp(`(\\\\` + cls + `\\\\s*\\\\{[^}]*?background:\\\\s*)(linear-gradient\\\\([a-zA-Z0-9 %.,#-]+\\\\)|radial-gradient\\\\([a-zA-Z0-9 %.,#-]+\\\\))`, 'g');
    css = css.replace(regex, `$1${grad}`);
}

// 3. FIX PIRATES TEXT BACKGROUND
// Original string: `background: linear-gradient(to right, #fff, #555, #fff, #555, #fff);` inside `.pirate-caribbean-text`
// Replace it safely with the Jack Sparrow GIF: `background: url('https://media.tenor.com/FwIe-jW9fVMAAAAd/pirates-of-the-caribbean-jack-sparrow.gif'); background-size: cover; background-position: center; filter: drop-shadow(1px 1px 1px rgba(0,0,0,0.8));`
css = css.replace(/(\.pirate-caribbean-text\s*\{[\s\S]*?)background:\s*linear-gradient\([^;]+;/, `$1background: url('https://media.tenor.com/FwIe-jW9fVMAAAAd/pirates-of-the-caribbean-jack-sparrow.gif');
  background-size: cover;
  background-position: center;
  filter: drop-shadow(1px 1px 1.5px rgba(0,0,0,0.8));
  -webkit-text-stroke: 0.5px black;`);

// Remove "animation: pirate-bw-anim 2s linear infinite;" since gif does the animation
css = css.replace(/(\.pirate-caribbean-text\s*\{[\s\S]*?)animation:\s*pirate-bw-anim[^;]+;/, '$1');

// 4. FIX CYBER SAMURAI TEXT
// It has `color: transparent !important;` but was unreadable.
css = css.replace(/(\.cyberpunk-samurai-text\s*\{[\s\S]*?\}|.*cyberpunk-samurai-text.*\{)/, (match) => {
    // Just replace the whole definition if we found it cleanly without nesting.
    // Actually simpler: just find `.cyberpunk-samurai-text {` and inject a filter directly
    return match;
});

// Let's inject drop-shadow to ALL background-clip texts
css = css.replace(/(-webkit-text-fill-color:\s*transparent\s*!important;\s*color:\s*transparent\s*!important;)/g, `$1\n  filter: drop-shadow(1px 1px 1.5px rgba(0,0,0,0.8));\n  -webkit-text-stroke: 1.5px rgba(0,0,0,0.6);`);

// Since we appended the missing country flags at the very end, we should drop their text-shadow: none !important so they get the stroke too.
css = css.replace(/text-shadow:\s*none\s*!important;/g, '');

// Also, the user previously said something about Pirates avatar text animation.
// I replaced the linear-gradient with the GIF, which is animated natively.

fs.writeFileSync(scssPath, css, 'utf8');
console.log('App.scss patched successfully');
