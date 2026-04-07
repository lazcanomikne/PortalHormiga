const PizZip = require('pizzip');
const fs = require('fs');
const path = require('path');

// Minimal document.xml structure
const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p><w:pPr><w:jc w:val="center"/><w:rPr><w:b/><w:sz w:val="36"/></w:rPr></w:pPr><w:r><w:t>UNIVERSO DE ETIQUETAS - PORTAL HORMIGA</w:t></w:r></w:p>
    
    <w:p><w:r><w:b/><w:t>--- SECCIÓN 1: ENCABEZADO (DENTRO DE #encabezado) ---</w:t></w:r></w:p>
    <w:p><w:r><w:t>{#encabezado}</w:t></w:r></w:p>
    <w:p><w:r><w:t>ID Cotización: {id}</w:t></w:r></w:p>
    <w:p><w:r><w:t>Folio Portal: {folioPortal}</w:t></w:r></w:p>
    <w:p><w:r><w:t>Cliente: {clienteNombre} ({cliente})</w:t></w:r></w:p>
    <w:p><w:r><w:t>Atención a: {personaContacto}</w:t></w:r></w:p>
    <w:p><w:r><w:t>Dirección Fiscal: {direccionFiscal}</w:t></w:r></w:p>
    <w:p><w:r><w:t>Dirección Entrega: {direccionEntrega}</w:t></w:r></w:p>
    <w:p><w:r><w:t>Referencia del Proyecto: {referencia}</w:t></w:r></w:p>
    <w:p><w:r><w:t>Resumen Técnico: {SuReferenciaProductos}</w:t></w:r></w:p>
    <w:p><w:r><w:t>Fecha: {fecha} | Vencimiento: {vencimiento}</w:t></w:r></w:p>
    <w:p><w:r><w:t>Moneda: {moneda}</w:t></w:r></w:p>
    <w:p><w:r><w:t>{/encabezado}</w:t></w:r></w:p>

    <w:p><w:pPr><w:spacing w:before="240"/></w:pPr><w:r><w:b/><w:t>--- SECCIÓN 2: LISTADO DE PRODUCTOS ---</w:t></w:r></w:p>
    <w:p><w:r><w:t>{#productos}</w:t></w:r></w:p>
    <w:p><w:r><w:t>• [{itemCode}] {itemName}</w:t></w:r></w:p>
    <w:p><w:r><w:t>  Cantidad: {qty} | Precio Unitario: {price | currency}</w:t></w:r></w:p>
    <w:p><w:r><w:t>  Ubicación (Bahía): {bahia}</w:t></w:r></w:p>
    <w:p><w:r><w:t>  Controles: {controles}</w:t></w:r></w:p>
    <w:p><w:r><w:t>  {textoMontaje}</w:t></w:r></w:p>
    <w:p><w:r><w:t>{/productos}</w:t></w:r></w:p>

    <w:p><w:pPr><w:spacing w:before="240"/></w:pPr><w:r><w:b/><w:t>--- SECCIÓN 3: EVENTOS DE PAGO ---</w:t></w:r></w:p>
    <w:p><w:r><w:t>{#formacionPrecios.configuraciones.eventosPago}</w:t></w:r></w:p>
    <w:p><w:r><w:t>- Evento: {terminoPago} ({porcentaje}%) - Condición: {condicion}</w:t></w:r></w:p>
    <w:p><w:r><w:t>{/formacionPrecios.configuraciones.eventosPago}</w:t></w:r></w:p>

    <w:p><w:pPr><w:spacing w:before="240"/></w:pPr><w:r><w:b/><w:t>--- SECCIÓN 4: VENDEDORES (DENTRO DE #encabezado) ---</w:t></w:r></w:p>
    <w:p><w:r><w:t>{#encabezado}</w:t></w:r></w:p>
    <w:p><w:r><w:b/><w:t>Vendedor Principal:</w:t></w:r></w:p>
    <w:p><w:r><w:t>Nombre: {vendedorNombre}</w:t></w:r></w:p>
    <w:p><w:r><w:t>Email: {vendedorEmail} | Tel: {vendedorTelefono} | Cel: {vendedorMobil}</w:t></w:r></w:p>
    <w:p><w:r><w:t></w:t></w:r></w:p>
    <w:p><w:r><w:b/><w:t>Vendedor Secundario:</w:t></w:r></w:p>
    <w:p><w:r><w:t>Nombre: {vendedorSecNombre}</w:t></w:r></w:p>
    <w:p><w:r><w:t>Email: {vendedorSecEmail} | Tel: {vendedorSecTelefono} | Cel: {vendedorSecMobil}</w:t></w:r></w:p>
    <w:p><w:r><w:t>{/encabezado}</w:t></w:r></w:p>

    <w:p><w:pPr><w:spacing w:before="480"/><w:jc w:val="right"/></w:pPr><w:r><w:t>Fin del Universo de Etiquetas.</w:t></w:r></w:p>
  </w:body>
</w:document>`;

const zip = new PizZip();
zip.file("word/document.xml", documentXml);
zip.file("_rels/.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`);
zip.file("word/_rels/document.xml.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/relationships"></Relationships>`);
zip.file("[Content_Types].xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`);

const buffer = zip.generate({ type: "nodebuffer" });
const targetPath = 'c:/mikne/PortalHormiga/v-hormiga-app/public/assets/demo_etiquetas.docx';
fs.writeFileSync(targetPath, buffer);
console.log(`Demo template created at: ${targetPath}`);
