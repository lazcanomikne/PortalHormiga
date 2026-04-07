
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

    const fragment = "{ArticuloDefiniciones.Datos";
    let lastIdx = 0;
    let found = 0;
    while (true) {
        let idx = plainText.indexOf(fragment, lastIdx);
        if (idx === -1) break;
        found++;
        console.log(`\n--- Instance #${found} at plain index ${idx} ---`);
        console.log(`"${plainText.substring(idx, idx + 300)}"`);
        lastIdx = idx + 1;
    }
    console.log(`\nFound ${found} total instances.`);

} catch (e) {
    console.error("Error diagnosticating:", e);
}
