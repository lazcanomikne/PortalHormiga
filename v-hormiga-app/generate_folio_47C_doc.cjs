
const fs = require('fs');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');

// Load Fetch Data
const folioData = JSON.parse(fs.readFileSync('folio_47C.json', 'utf8'));

// Helper for mapping (simplified version of pdfGenerator.js logic)
const mapData = (src) => {
    const enc = src.encabezado;
    const address = enc.direccionEntrega || "";
    const values = address.split(",");
    const ciudad = values.length >= 4 ? values[3].trim() : "";
    const estado = values.length >= 5 ? values[4].trim() : "";

    const Oferta = {
        Cliente: { 'Nombre del Cliente': enc.clientNombre || enc.clienteNombre },
        'Direccion de Entrega': {
            toString: () => address,
            Ciudad: {
                toString: () => ciudad,
                Estado: { toString: () => estado }
            }
        },
        'Persona de Contacto': enc.personaContacto,
        Referencia: enc.referencia,
        'Folio Sap': enc.folioSap || "",
        'Folio Portal': enc.folioPortal || enc.id,
        'Vendedor principal': enc.vendedor ? {
            toString: () => enc.vendedor.slpName,
            A: { Telephone: enc.vendedor.telephone, Mobil: enc.vendedor.mobil }
        } : { toString: () => "", A: { Telephone: "", Mobil: "" } },
        'Vendedor Secundario': enc.vendedorSec ? {
            toString: () => enc.vendedorSec.slpName,
            A: { Telephone: enc.vendedorSec.telephone, Mobil: enc.vendedorSec.mobil }
        } : { toString: () => "", A: { Telephone: "", Mobil: "" } },
        'Vendedor secundario': { A: { Mobil: enc.vendedorSec ? enc.vendedorSec.mobil : "" } },
        Cantidad: {
            'Suma de Cantidad de Gruas de la misma Capacidad': src.productos.length,
            'Suma de Cantidad de Gruas de la misma Capacidad.Diferentes a las primeras': ""
        },
        Resumen: {
            Capacidad: { 'Diferentes a las primeras': "" }
        },
        'Nombre de Grúa': src.productos[0] ? src.productos[0].itemName : "",
        'Código de Grúa': src.productos[0] ? src.productos[0].itemCode : "",
        'Términos de Entrega': enc.terminosEntrega
    };

    // Assuming first product for deep technical details as per template context
    const prod = src.productos[0] || { definiciones: { datosBasicos: {}, carro: { carros: [] }, izaje: { polipastos: [] }, puente: {} } };
    const p = prod.definiciones;

    const ArticuloDefiniciones = {
        'Datos Basicos': {
            'Capacidad de la(s) grúa(s)': p.datosBasicos.capacidadGrua,
            'Claro': p.datosBasicos.claroM || p.datosBasicos.claro,
            'FEM9.511/CMAA/ISO': {
                CMAA: p.datosBasicos.equivalenteFemValue,
                'FEM9.511': p.datosBasicos.equivalenteFemValue,
                ISO: p.datosBasicos.equivalenteFemValue
            },
            'Gancho(s)': { 'Cantidad de ganchos': p.datosBasicos.cantidadGanchos },
            'Peso muerto de la grúa': p.datosBasicos.pesoMuertoGrua,
            'Reacción máxima por rueda': p.datosBasicos.reaccionMaximaRueda,
            'Tipo de Control': {
                'Control 1': { 'Tipo de control': p.datosBasicos.controles && p.datosBasicos.controles[0] ? p.datosBasicos.controles[0].tipoControl : "" },
                'Control 2': { 'Tipo de control': p.datosBasicos.controles && p.datosBasicos.controles[1] ? p.datosBasicos.controles[1].tipoControl : "" }
            }
        },
        Carro: {
            'Cantidad de carros': p.carro.cantidadCarros,
            'Carro 1': {
                'Control de carro': p.carro.carros && p.carro.carros[0] ? p.carro.carros[0].control : "",
                'Velocidad de carro': p.carro.carros && p.carro.carros[0] ? p.carro.carros[0].velocidadTraslacion : "",
                'Cantidad de ruedas traslacion': p.carro.carros && p.carro.carros[0] ? p.carro.carros[0].cantidadRuedasTraslacion : "",
                'Diametro de rueda (mm)': p.carro.carros && p.carro.carros[0] ? p.carro.carros[0].diametroRuedas : "",
                'Velocidad de traslación en m/min': p.carro.carros && p.carro.carros[0] ? p.carro.carros[0].velocidadTraslacion : ""
            }
        },
        Gancho: {
            'Gancho 1': {
                'Control Gancho': p.izaje.polipastos && p.izaje.polipastos[0] ? p.izaje.polipastos[0].control : "",
                'Codigo de construcción': p.izaje.polipastos && p.izaje.polipastos[0] ? p.izaje.polipastos[0].codigoContruccion1 : "",
                'Geometría de ramales': "",
                'Izaje Gancho': p.izaje.polipastos && p.izaje.polipastos[0] ? p.izaje.polipastos[0].izajeGancho : "",
                'Velocidad de Izaje Gancho': p.izaje.polipastos && p.izaje.polipastos[0] ? p.izaje.polipastos[0].velIzaje2 : "",
                'Motor/modelo': p.izaje.polipastos && p.izaje.polipastos[0] ? p.izaje.polipastos[0].motorModeloGanchoPrincipal : "",
                'Tipo de freno': p.izaje.polipastos && p.izaje.polipastos[0] ? p.izaje.polipastos[0].tipoFreno : "",
                'Freno emergencia': p.izaje.polipastos && p.izaje.polipastos[0] ? (p.izaje.polipastos[0].frenoEmergencia ? "Si" : "No") : ""
            },
            'Gancho 2': { 'Izaje Gancho': p.izaje.polipastos && p.izaje.polipastos[1] ? p.izaje.polipastos[1].izajeGancho : 0 },
            'Gancho 3': { 'Izaje Gancho': p.izaje.polipastos && p.izaje.polipastos[2] ? p.izaje.polipastos[2].izajeGancho : 0 },
            'Voltaje de operación trifásico': p.datosBasicos.tensionServicio,
            'Voltaje de Control': p.datosBasicos.voltajeControl
        },
        Puente: {
            'Control de puente': p.puente.controlPuente,
            'Material de ruedas': p.puente.ruedasMotrices ? p.puente.ruedasMotrices.materialRuedas : "",
            'Cantidad de motorreductores': p.puente.cantidadMotorreductores,
            'Reductor': p.puente.reductor,
            'Motor/Modelo': p.puente.motorModeloPuente,
            'Motor/Potencia(Kw)': p.puente.motorPotenciaKw1,
            'Tope hidraulico': p.puente.topeHidraulico ? "Si" : "No",
            'Velocidad de puente': p.puente.especifiqueVelocidadTraslacionPuente || p.puente.velocidadTraslacionPuente,
            'Total de ruedas (pzas)': (p.puente.ruedasMotrices ? p.puente.ruedasMotrices.cantidadRuedas : 0) + (p.puente.ruedasLocas ? p.puente.ruedasLocas.cantidadRuedas : 0),
            'Ruedas motrices': {
                'Diametro de ruedas(mm)': p.puente.ruedasMotrices ? p.puente.ruedasMotrices.diametroRuedas : "",
                'Material de ruedas': p.puente.ruedasMotrices ? p.puente.ruedasMotrices.materialRuedas : ""
            },
            'Tipo de alimentacion': p.puente.tipoAlimentacion,
            'Interruptor limite de 2 pasos delantero': p.puente.switchLimFinCarrDel ? "Si" : "No",
            'Interruptor limite de 2 pasos trasero': p.puente.interLimFinCarrTras ? "Si" : "No",
            'Sistema anticolicion delantero': p.puente.sisAnticolisionDel ? "Si" : "No",
            'Sistema anticolicion Trasero': p.puente.sisAnticolisionTras ? "Si" : "No",
            'Observaciones': p.puente.observaciones
        },
        'Montaje': p.montaje && p.montaje.gruaMontaje ? "Incluye montaje..." : "No incluido"
    };

    // Bahia logic
    const b = src.bahias && src.bahias[0] ? src.bahias[0].definiciones : { alimentacion: {}, riel: {} };
    const BahiaDefiniciones = {
        Alimentacion: {
            'Longitud del sistema (m)': b.alimentacion.longitudSistema,
            'Amperaje (amp)': b.alimentacion.amperaje,
            'Localizacion de acometida': b.alimentacion.localAcometida
        },
        Riel: {
            'Metros lineales de riel': b.riel.metrosLinealesRiel,
            'Tipo de riel(m)': {
                toString: () => b.riel.tipoRiel,
                Burbach: b.riel.tipoRiel
            },
            'Calidad/Material riel según EN10025': b.riel.calidadMaterialRiel,
            'Observaciones.': b.riel.observaciones
        }
    };

    // Formacion de Precios logic
    const FormacionPrecios = {
        'Tiempo de garantía': "12 meses",
        Cotizacion: {
            Global: "$" + enc.total.toLocaleString(),
            Desglosada: "Detalle de costos..."
        },
        'Eventos de Pago': {
            'Eventos de Pago 1': {
                'Porcentaje': 50,
                'Condicion de pago': "Anticipo"
            }
        }
    };

    return { Oferta, ArticuloDefiniciones, BahiaDefiniciones, FormacionPrecios };
};

const mapped = mapData(folioData);

const tagsRequested = [
    { tag: "{Oferta.Cliente.Nombre del Cliente}", val: mapped.Oferta.Cliente['Nombre del Cliente'] },
    { tag: "{Oferta.Direccion de Entrega}", val: mapped.Oferta['Direccion de Entrega'].toString() },
    { tag: "{Oferta.Persona de Contacto}", val: mapped.Oferta['Persona de Contacto'] },
    { tag: "{Oferta.Referencia}", val: mapped.Oferta.Referencia },
    { tag: "{Oferta.Cantidad.Suma de Cantidad de Gruas de la misma Capacidad}", val: mapped.Oferta.Cantidad['Suma de Cantidad de Gruas de la misma Capacidad'] },
    { tag: "{ArticuloDefiniciones.Datos Basicos. Capacidad de la(s) grúa(s)}", val: mapped.ArticuloDefiniciones['Datos Basicos']['Capacidad de la(s) grúa(s)'] },
    { tag: "{ArticuloDefiniciones.Datos Basicos.FEM9.511/CMAA/ISO.CMAA}", val: mapped.ArticuloDefiniciones['Datos Basicos']['FEM9.511/CMAA/ISO'].CMAA },
    { tag: "{Oferta.Folio Sap}", val: mapped.Oferta['Folio Sap'] },
    { tag: "{Oferta.Folio Portal}", val: mapped.Oferta['Folio Portal'] },
    { tag: "{Oferta.Direccion de Entrega.Ciudad}", val: mapped.Oferta['Direccion de Entrega'].Ciudad.toString() },
    { tag: "{Oferta.Vendedor principal}", val: mapped.Oferta['Vendedor principal'].toString() },
    { tag: "{Oferta.Vendedor Secundario}", val: mapped.Oferta['Vendedor Secundario'].toString() },
    { tag: "{Oferta.Vendedor principal. A.Telephone}", val: mapped.Oferta['Vendedor principal'].A.Telephone },
    { tag: "{Oferta.Vendedor Secundario. A.Telephone}", val: mapped.Oferta['Vendedor Secundario'].A.Telephone },
    { tag: "{Oferta.Vendedor principal. A.Mobil}", val: mapped.Oferta['Vendedor principal'].A.Mobil },
    { tag: "{Oferta.Vendedor secundario. A.Mobil}", val: mapped.Oferta['Vendedor secundario'].A.Mobil },
    { tag: "{ArticuloDefiniciones.Gancho.Gancho 1.Control Gancho}", val: mapped.ArticuloDefiniciones.Gancho['Gancho 1']['Control Gancho'] },
    { tag: "{ArticuloDefiniciones.Puente.Control de puente}", val: mapped.ArticuloDefiniciones.Puente['Control de puente'] },
    { tag: "{Oferta.Direccion de Entrega.Ciudad.Estado}", val: mapped.Oferta['Direccion de Entrega'].Ciudad.Estado.toString() },
    { tag: "{ArticuloDefiniciones.Datos Basicos.Claro}", val: mapped.ArticuloDefiniciones['Datos Basicos'].Claro },
    { tag: "{Oferta.Nombre de Grúa}", val: mapped.Oferta['Nombre de Grúa'] },
    { tag: "{Oferta.Código de Grúa}", val: mapped.Oferta['Código de Grúa'] },
    { tag: "{ArticuloDefiniciones.Datos Basicos.Gancho(s).Cantidad de ganchos}", val: mapped.ArticuloDefiniciones['Datos Basicos']['Gancho(s)']['Cantidad de ganchos'] },
    { tag: "{ArticuloDefiniciones.Gancho.Gancho 1.Codigo de construcción}", val: mapped.ArticuloDefiniciones.Gancho['Gancho 1']['Codigo de construcción'] },
    { tag: "{ArticuloDefiniciones.Gancho.Gancho 1. Geometría de ramales}", val: mapped.ArticuloDefiniciones.Gancho['Gancho 1']['Geometría de ramales'] },
    { tag: "{ArticuloDefiniciones.Gancho.Gancho 1. Izaje Gancho}", val: mapped.ArticuloDefiniciones.Gancho['Gancho 1']['Izaje Gancho'] },
    { tag: "{ArticuloDefiniciones.Gancho.Gancho 2. Izaje Gancho}", val: mapped.ArticuloDefiniciones.Gancho['Gancho 2']['Izaje Gancho'] },
    { tag: "{ArticuloDefiniciones.Gancho.Gancho 3. Izaje Gancho}", val: mapped.ArticuloDefiniciones.Gancho['Gancho 3']['Izaje Gancho'] },
    { tag: "{ArticuloDefiniciones.Gancho.Gancho 1. Velocidad de Izaje Gancho}", val: mapped.ArticuloDefiniciones.Gancho['Gancho 1']['Velocidad de Izaje Gancho'] },
    { tag: "{ArticuloDefiniciones.Gancho.Gancho 1.Motor/modelo}", val: mapped.ArticuloDefiniciones.Gancho['Gancho 1']['Motor/modelo'] },
    { tag: "{ArticuloDefiniciones.Gancho.Gancho 1.Tipo de freno}", val: mapped.ArticuloDefiniciones.Gancho['Gancho 1']['Tipo de freno'] },
    { tag: "{ArticuloDefiniciones.Gancho.Gancho 1.Freno emergencia}", val: mapped.ArticuloDefiniciones.Gancho['Gancho 1']['Freno emergencia'] },
    { tag: "{ArticuloDefiniciones.Datos Basicos.FEM9.511/CMAA/ISO. FEM9.511}", val: mapped.ArticuloDefiniciones['Datos Basicos']['FEM9.511/CMAA/ISO']['FEM9.511'] },
    { tag: "{ArticuloDefiniciones.Datos Basicos.FEM9.511/CMAA/ISO.ISO}", val: mapped.ArticuloDefiniciones['Datos Basicos']['FEM9.511/CMAA/ISO'].ISO },
    { tag: "{ ArticuloDefiniciones.Carro.Cantidad de carros}", val: mapped.ArticuloDefiniciones.Carro['Cantidad de carros'] },
    { tag: "{ ArticuloDefiniciones.Carro.Carro 1.Velocidad de carro}", val: mapped.ArticuloDefiniciones.Carro['Carro 1']['Velocidad de carro'] },
    { tag: "{ ArticuloDefiniciones.Carro.Carro 1.Diameter de rueda (mm)}", val: mapped.ArticuloDefiniciones.Carro['Carro 1']['Diametro de rueda (mm)'] },
    { tag: "{ArticuloDefiniciones.Puente.Material de ruedas}", val: mapped.ArticuloDefiniciones.Puente['Material de ruedas'] },
    { tag: "{ArticuloDefiniciones.Puente.Motor/Modelo}", val: mapped.ArticuloDefiniciones.Puente['Motor/Modelo'] },
    { tag: "{ ArticuloDefiniciones.Puente.Motor/Potencia(Kw)}", val: mapped.ArticuloDefiniciones.Puente['Motor/Potencia(Kw)'] },
    { tag: "{ArticuloDefiniciones.Puente.Tope hidraulico}", val: mapped.ArticuloDefiniciones.Puente['Tope hidraulico'] },
    { tag: "{ArticuloDefiniciones.Puente.Velocidad de puente}", val: mapped.ArticuloDefiniciones.Puente['Velocidad de puente'] },
    { tag: "{ArticuloDefiniciones.Puente.Total de ruedas (pzas)}", val: mapped.ArticuloDefiniciones.Puente['Total de ruedas (pzas)'] },
    { tag: "{ArticuloDefiniciones.Puente.Observaciones}", val: mapped.ArticuloDefiniciones.Puente.Observaciones },
    { tag: "{BahiaDefiniciones.Alimentacion.Longitud del sistema (m)}", val: mapped.BahiaDefiniciones.Alimentacion['Longitud del sistema (m)'] },
    { tag: "{FormacionPrecios.Cotizacion.Global}", val: mapped.FormacionPrecios.Cotizacion.Global },
    { tag: "{FormacionPrecios.Cotizacion.Desglosada}", val: mapped.FormacionPrecios.Cotizacion.Desglosada }
];

const referenceData = {
    folio: "47 C",
    cliente: mapped.Oferta.Cliente['Nombre del Cliente'],
    demo: tagsRequested.map(t => ({ tag: t.tag, val: (t.val === undefined || t.val === null) ? "N/A" : t.val }))
};

const templatePath = 'c:/mikne/PortalHormiga/v-hormiga-app/public/assets/cotizacion_hormiga.docx';
const outputPath = 'c:/mikne/PortalHormiga/v-hormiga-app/public/assets/Cotizacion_Folio_47C_Final.docx';

try {
    const content = fs.readFileSync(templatePath);
    const zip = new PizZip(content);

    // Inject a summary table at the start via XML injection
    let xml = zip.file('word/document.xml').asText();
    let tableXml = '<w:p><w:r><w:t>RESUMEN DE ETIQUETAS - FOLIO 47 C</w:t></w:r></w:p>';
    tableXml += '<w:tbl><w:tblPr><w:tblW w:w="5000" w:type="pct"/><w:tblBorders><w:top w:val="single" w:sz="4" w:space="0" w:color="auto"/><w:left w:val="single" w:sz="4" w:space="0" w:color="auto"/><w:bottom w:val="single" w:sz="4" w:space="0" w:color="auto"/><w:right w:val="single" w:sz="4" w:space="0" w:color="auto"/><w:insideH w:val="single" w:sz="4" w:space="0" w:color="auto"/><w:insideV w:val="single" w:sz="4" w:space="0" w:color="auto"/></w:tblBorders></w:tblPr>';
    tableXml += '<w:tr><w:tc><w:p><w:r><w:t>ETIQUETA</w:t></w:r></w:p></w:tc><w:tc><w:p><w:r><w:t>VALOR REAL (47 C)</w:t></w:r></w:p></w:tc></w:tr>';
    tableXml += '{#demo}<w:tr><w:tc><w:p><w:r><w:t>{tag}</w:t></w:r></w:p></w:tc><w:tc><w:p><w:r><w:t>{val}</w:t></w:r></w:p></w:tc></w:tr>{/demo}';
    tableXml += '</w:tbl>';

    xml = xml.replace('<w:body>', '<w:body>' + tableXml);
    zip.file('word/document.xml', xml);

    const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });
    doc.setData(referenceData);
    doc.render();

    const buf = doc.getZip().generate({ type: "nodebuffer", compression: "DEFLATE" });
    fs.writeFileSync(outputPath, buf);
    console.log(`Word generated: ${outputPath}`);
} catch (e) {
    console.error(e);
}
