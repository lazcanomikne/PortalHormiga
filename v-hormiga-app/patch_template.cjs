
const fs = require('fs');
const PizZip = require('pizzip');

const path = 'c:/mikne/PortalHormiga/v-hormiga-app/public/assets/Cotizacion_Nueva_Con_Etiquetas.docx';

try {
    const content = fs.readFileSync(path);
    const zip = new PizZip(content);
    let docXml = zip.file('word/document.xml').asText();

    function fixAllUnclosed(xml, searchString) {
        let currentXml = xml;
        let offsetShift = 0;

        // We need to re-scan plain text after each fix because indices change
        // OR we can find all indices first and work backwards.

        function getPlainTextAndMapping(targetXml) {
            let plainText = "";
            let mapping = [];
            let inTag = false;
            for (let i = 0; i < targetXml.length; i++) {
                if (targetXml[i] === '<') inTag = true;
                if (!inTag) {
                    plainText += targetXml[i];
                    mapping.push(i);
                }
                if (targetXml[i] === '>') inTag = false;
            }
            return { plainText, mapping };
        }

        let { plainText, mapping } = getPlainTextAndMapping(currentXml);
        let lastIdx = 0;
        let indicesToFix = [];

        while (true) {
            let idx = plainText.indexOf(searchString, lastIdx);
            if (idx === -1) break;

            // Check if closed
            if (plainText[idx + searchString.length] !== '}') {
                console.log(`Found unclosed instance at plain index ${idx}`);
                indicesToFix.push(idx);
            }
            lastIdx = idx + 1;
        }

        // Work backwards to maintain index validity
        for (let i = indicesToFix.length - 1; i >= 0; i--) {
            const idx = indicesToFix[i];
            const originalEndPos = mapping[idx + searchString.length - 1] + 1;
            console.log(`Fixing instance at original position ${originalEndPos}`);
            currentXml = currentXml.substring(0, originalEndPos) + "}" + currentXml.substring(originalEndPos);
        }

        return currentXml;
    }

    const target = "{ArticuloDefiniciones.Datos Basicos.FEM9.511/CMAA/ISO.CMAA";
    docXml = fixAllUnclosed(docXml, target);

    zip.file('word/document.xml', docXml);
    const out = zip.generate({ type: 'nodebuffer', compression: 'DEFLATE' });
    fs.writeFileSync(path, out);
    console.log("Template patched (global surgical) successfully.");

} catch (e) {
    console.error("Error patching template:", e);
}
