
const fs = require('fs');
const PizZip = require('pizzip');

const path = 'c:/mikne/PortalHormiga/v-hormiga-app/public/assets/Cotizacion_Nueva_Con_Etiquetas.docx';

try {
    const content = fs.readFileSync(path);
    const zip = new PizZip(content);
    let docXml = zip.file('word/document.xml').asText();

    let plainText = "";
    let inTag = false;
    for (let i = 0; i < docXml.length; i++) {
        if (docXml[i] === '<') inTag = true;
        if (!inTag) {
            plainText += docXml[i];
        }
        if (docXml[i] === '>') inTag = false;
    }

    let unclosed = [];
    let lastIdx = 0;
    while (true) {
        let openIdx = plainText.indexOf('{', lastIdx);
        if (openIdx === -1) break;

        let closeIdx = plainText.indexOf('}', openIdx);
        let nextOpenIdx = plainText.indexOf('{', openIdx + 1);

        if (closeIdx === -1 || (nextOpenIdx !== -1 && closeIdx > nextOpenIdx)) {
            unclosed.push({
                index: openIdx,
                content: plainText.substring(openIdx, openIdx + 100)
            });
        }
        lastIdx = openIdx + 1;
    }

    if (unclosed.length === 0) {
        console.log("SUCCESS: All tags are closed in plain text.");
    } else {
        console.log(`FAILURE: Found ${unclosed.length} unclosed tags:`);
        unclosed.forEach(u => console.log(`- At ${u.index}: "${u.content}..."`));
    }

} catch (e) {
    console.error("Error verifying:", e);
}
