
const fs = require('fs');
const PizZip = require('pizzip');

const path = 'c:/mikne/PortalHormiga/v-hormiga-app/public/assets/Cotizacion_Nueva_Con_Etiquetas.docx';

try {
    const content = fs.readFileSync(path);
    const zip = new PizZip(content);
    const docXml = zip.file('word/document.xml').asText();

    // Simple regex to find content between { and }
    // Note: This is rudimentary. Word often splits tags into multiple <w:t> elements. 
    // Docxtemplater handles that, but a raw regex might miss them or see XML inside.
    // However, if the user typed {Tag Name}, it might appear as {Tag Name} in XML text if not split.

    // Better: Remove all XML tags first? No, that loses context.
    // Let's just Regex for curly braces including XML tags in between.

    const tagRegex = /\{[^}]+\}/g;
    const matches = docXml.match(tagRegex);

    console.log("--- Raw Tag Matches (Sample) ---");
    if (matches) {
        console.log(`Found ${matches.length} potential matches.`);
        matches.slice(0, 50).forEach(m => console.log(m.replace(/<[^>]+>/g, '')));
    } else {
        console.log("No simple tags found. Tags might be heavily fragmented.");
    }

    // Also look for "Nombre del Cliente" specifically
    const specificCheck = "Nombre del Cliente";
    if (docXml.includes(specificCheck)) {
        console.log(`\nFOUND literal text: "${specificCheck}"`);
    } else {
        console.log(`\nDid NOT find literal text: "${specificCheck}"`);
    }

} catch (e) {
    console.error("Error reading file:", e);
}
