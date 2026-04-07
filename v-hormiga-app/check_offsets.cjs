
const fs = require('fs');
const PizZip = require('pizzip');

const path = 'c:/mikne/PortalHormiga/v-hormiga-app/public/assets/Cotizacion_Nueva_Con_Etiquetas.docx';

try {
    const content = fs.readFileSync(path);
    const zip = new PizZip(content);
    let docXml = zip.file('word/document.xml').asText();

    // Search for the problematic fragments in a way that shows more context
    const searchTerms = [
        "ArticuloDefiniciones.Datos Basicos.FEM9.511/CMAA/ISO.CMAA",
        "Si selecciona freno Electrohidrahulico",
        "FormacionPrecios-Productos y Opciones Seleccionadas"
    ];

    searchTerms.forEach(term => {
        console.log(`\n--- Searching for: "${term}" ---`);
        const regexStr = term.split('').join('(?:<[^>]+>)*').replace(/\//g, '\\/');
        const regex = new RegExp(regexStr, 'g');
        let match;
        while ((match = regex.exec(docXml)) !== null) {
            const start = Math.max(0, match.index - 50);
            const end = Math.min(docXml.length, match.index + match[0].length + 100);
            console.log(`Match at ${match.index}:`);
            console.log(docXml.substring(start, end));
        }
    });

} catch (e) {
    console.error("Error diagnosticating:", e);
}
