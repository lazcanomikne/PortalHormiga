const fs = require('fs');
const path = 'c:/mikne/PortalHormiga/v-hormiga-app/public/assets/temp_template/word/document.xml';
let content = fs.readFileSync(path, 'utf8');

console.log('--- Fixing curly quotes ---');
content = content.replace(/[‘]/g, "'").replace(/[’]/g, "'");

console.log('--- Fixing redundant {#encabezado} ---');
// Match {#encabezado} at 234681 area
const redundant1 = /\{#encabezado\}\{moneda\}(\{moneda\}|\{\/\})?/g;
content = content.replace(redundant1, '{moneda}');

let encabezadoCount = 0;
content = content.replace(/\{#encabezado\}/g, (match, offset) => {
    encabezadoCount++;
    if (offset < 5000) return match;
    console.log(`Removing extra {#encabezado} at ${offset}`);
    return '';
});

let closingCount = 0;
// First, count them
const allClosures = [];
let cIdx = content.indexOf('{/encabezado}');
while (cIdx !== -1) {
    allClosures.push(cIdx);
    cIdx = content.indexOf('{/encabezado}', cIdx + 1);
}
console.log(`Found ${allClosures.length} closing tags.`);

if (allClosures.length > 0) {
    const lastOne = allClosures[allClosures.length - 1];
    content = content.replace(/\{\/encabezado\}/g, (match, offset) => {
        if (offset === lastOne) return match;
        console.log(`Removing inner {/encabezado} at ${offset}`);
        return '';
    });
} else {
    // If none found, we might have a big problem or it was never there in this version
    console.log('No closing tag found! Attempting to add one before the end of body.');
    content = content.replace('</w:body>', '{/encabezado}</w:body>');
}

console.log('--- Fixing products loop ---');
// Fix {/productos} before opener
content = content.replace(/\{\/productos\}/g, '');

fs.writeFileSync(path, content);

// Final check and cleaning
console.log('--- Aggressive Tag Healing ---');

// This function will clean a single tag content
function healTag(content) {
    // 1. Remove all XML tags
    let cleaned = content.replace(/<[^>]+?>/g, '');
    // 2. Remove any weird control characters or line breaks
    cleaned = cleaned.replace(/[\n\r\t]/g, ' ');
    // 3. Trim and collapse spaces
    cleaned = cleaned.trim().replace(/\s+/g, ' ');

    // 4. Specific fix for known mangled tags observed in logs
    if (cleaned.startsWith('/encabezado')) return '/encabezado';
    if (cleaned.startsWith('encabezado')) return 'encabezado';
    if (cleaned.startsWith('#encabezado')) return '#encabezado';
    if (cleaned.includes('clienteNombre')) return 'clienteNombre';
    if (cleaned.includes('referencia')) return 'referencia';
    if (cleaned.includes('folioPortal')) return 'folioPortal';

    return cleaned;
}

// We look for { and find the next } ignoring nested ones (docxtemplater doesn't usually nest in a way that matters for raw XML)
content = content.replace(/\{([^{}]+?)\}/g, (match, p1) => {
    const healed = healTag(p1);
    console.log(`Healed: {${p1.substring(0, 20)}...} -> {${healed}}`);
    return `{${healed}}`;
});

// Fix common symbols
content = content.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

fs.writeFileSync(path, content);

fs.writeFileSync(path, content);

// Final check
const tagsToCheck = ['{#encabezado}', '{/encabezado}', "tipoAlimentacion != 'Otros'", "tipoAlimentacion == 'Otros'"];
tagsToCheck.forEach(p => {
    let count = 0;
    let idx = content.indexOf(p);
    while (idx !== -1) {
        count++;
        idx = content.indexOf(p, idx + 1);
    }
    console.log(`Result: ${p} -> ${count} matches`);
});
