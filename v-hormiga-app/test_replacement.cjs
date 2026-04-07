const Docxtemplater = require("docxtemplater");
const PizZip = require("pizzip");
const fs = require("fs");

// Mock zip with a simple document
const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r><w:t>9.- {etiqueta}</w:t></w:r>
    </w:p>
  </w:body>
</w:document>`;

const zip = new PizZip();
zip.file("word/document.xml", xml);

const customParser = (tag) => {
    return {
        get: (scope) => {
            if (tag === "etiqueta") return "Contenido de etiqueta";
            return "";
        }
    };
};

try {
    const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        parser: customParser
    });

    doc.setData({});
    doc.render();

    const resultXml = doc.getZip().file("word/document.xml").asText();
    console.log("Result XML:", resultXml);

    if (resultXml.includes("9.- Contenido de etiqueta")) {
        console.log("SUCCESS: Inline replacement works.");
    } else {
        console.log("FAILURE: Line was likely replaced.");
    }
} catch (e) {
    console.error(e);
}
