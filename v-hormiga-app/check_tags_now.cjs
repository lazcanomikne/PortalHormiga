
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
    let idx;
    while ((idx = plainText.indexOf(fragment, lastIdx)) !== -1) {
        console.log(`\nFound instance at plain index ${idx}:`);
        console.log(`"${plainText.substring(idx, idx + 200)}"`);
        lastIdx = idx + 1;
    }

} catch (e) {
    console.error("Error diagnosticating:", e);
}
