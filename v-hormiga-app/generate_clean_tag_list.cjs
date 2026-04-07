
const fs = require('fs');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');

// Load Data
const folioData = JSON.parse(fs.readFileSync('folio_47C.json', 'utf8'));

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

    const prod = src.productos[0] || { definiciones: { datosBasicos: {}, carro: { carros: [] }, izaje: { polipastos: [] }, puente: {} } };
    const p = prod.definiciones;

    const ArticuloDefiniciones = {
        'Datos Basicos': {
            'Capacidad de la(s) grúa(s)': p.datosBasicos.capacidadGruaToneladas || p.datosBasicos.capacidadGrua,
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

const tagsToRender = [
    { name: "{Oferta.Cliente.Nombre del Cliente}", val: mapped.Oferta.Cliente['Nombre del Cliente'] },
    { name: "{Oferta.Direccion de Entrega}", val: mapped.Oferta['Direccion de Entrega'].toString() },
    { name: "{Oferta.Persona de Contacto}", val: mapped.Oferta['Persona de Contacto'] },
    { name: "{Oferta.Referencia}", val: mapped.Oferta.Referencia },
    { name: "{Oferta.Cantidad.Suma de Cantidad de Gruas de la misma Capacidad}", val: mapped.Oferta.Cantidad['Suma de Cantidad de Gruas de la misma Capacidad'] },
    { name: "{ArticuloDefiniciones.Datos Basicos. Capacidad de la(s) grúa(s)}", val: mapped.ArticuloDefiniciones['Datos Basicos']['Capacidad de la(s) grúa(s)'] },
    { name: "{Oferta.Cantidad.Suma de Cantidad de Gruas de la misma Capacidad.Diferentes a las primeras}", val: mapped.Oferta.Cantidad['Suma de Cantidad de Gruas de la misma Capacidad.Diferentes a las primeras'] },
    { name: "{Oferta.Resumen.Capacidad. Diferentes a las primeras}", val: mapped.Oferta.Resumen.Capacidad['Diferentes a las primeras'] },
    { name: "{ArticuloDefiniciones.Datos Basicos.FEM9.511/CMAA/ISO.CMAA}", val: mapped.ArticuloDefiniciones['Datos Basicos']['FEM9.511/CMAA/ISO'].CMAA },
    { name: "{Oferta.Folio Sap}", val: mapped.Oferta['Folio Sap'] },
    { name: "{Oferta.Folio Portal}", val: mapped.Oferta['Folio Portal'] },
    { name: "{Oferta.Direccion de Entrega.Ciudad}", val: mapped.Oferta['Direccion de Entrega'].Ciudad.toString() },
    { name: "{Oferta.Vendedor principal}", val: mapped.Oferta['Vendedor principal'].toString() },
    { name: "{Oferta.Vendedor Secundario}", val: mapped.Oferta['Vendedor Secundario'].toString() },
    { name: "{Oferta.Vendedor principal. A.Telephone}", val: mapped.Oferta['Vendedor principal'].A.Telephone },
    { name: "{Oferta.Vendedor Secundario. A.Telephone}", val: mapped.Oferta['Vendedor Secundario'].A.Telephone },
    { name: "{Oferta.Vendedor principal. A.Mobil}", val: mapped.Oferta['Vendedor principal'].A.Mobil },
    { name: "{Oferta.Vendedor secundario. A.Mobil}", val: mapped.Oferta['Vendedor secundario'].A.Mobil },
    { name: "{ArticuloDefiniciones.Gancho.Gancho 1.Control Gancho}", val: mapped.ArticuloDefiniciones.Gancho['Gancho 1']['Control Gancho'] },
    { name: "{ArticuloDefiniciones.Puente.Control de puente}", val: mapped.ArticuloDefiniciones.Puente['Control de puente'] },
    { name: "{Oferta.Direccion de Entrega.Ciudad.Estado}", val: mapped.Oferta['Direccion de Entrega'].Ciudad.Estado.toString() },
    { name: "{ArticuloDefiniciones.Datos Basicos.Claro}", val: mapped.ArticuloDefiniciones['Datos Basicos'].Claro },
    { name: "{Oferta.Nombre de Grúa}", val: mapped.Oferta['Nombre de Grúa'] },
    { name: "{Oferta.Código de Grúa}", val: mapped.Oferta['Código de Grúa'] },
    { name: "{ArticuloDefiniciones.Datos Basicos.Gancho(s).Cantidad de ganchos}", val: mapped.ArticuloDefiniciones['Datos Basicos']['Gancho(s)']['Cantidad de ganchos'] },
    { name: "{ArticuloDefiniciones.Gancho.Gancho 1.Codigo de construcción}", val: mapped.ArticuloDefiniciones.Gancho['Gancho 1']['Codigo de construcción'] },
    { name: "{ArticuloDefiniciones.Gancho.Gancho 1. Geometría de ramales}", val: mapped.ArticuloDefiniciones.Gancho['Gancho 1']['Geometría de ramales'] },
    { name: "{ArticuloDefiniciones.Gancho.Gancho 1. Izaje Gancho}", val: mapped.ArticuloDefiniciones.Gancho['Gancho 1']['Izaje Gancho'] },
    { name: "{ArticuloDefiniciones.Gancho.Gancho 1. Velocidad de Izaje Gancho}", val: mapped.ArticuloDefiniciones.Gancho['Gancho 1']['Velocidad de Izaje Gancho'] },
    { name: "{ArticuloDefiniciones.Gancho.Gancho 1.Motor/modelo}", val: mapped.ArticuloDefiniciones.Gancho['Gancho 1']['Motor/modelo'] },
    { name: "{ArticuloDefiniciones.Gancho.Gancho 1.Tipo de freno}", val: mapped.ArticuloDefiniciones.Gancho['Gancho 1']['Tipo de freno'] },
    { name: "{ArticuloDefiniciones.Gancho.Gancho 1.Freno emergencia}", val: mapped.ArticuloDefiniciones.Gancho['Gancho 1']['Freno emergencia'] },
    { name: "{ArticuloDefiniciones.Datos Basicos.FEM9.511/CMAA/ISO. FEM9.511}", val: mapped.ArticuloDefiniciones['Datos Basicos']['FEM9.511/CMAA/ISO']['FEM9.511'] },
    { name: "{ArticuloDefiniciones.Datos Basicos.FEM9.511/CMAA/ISO.ISO}", val: mapped.ArticuloDefiniciones['Datos Basicos']['FEM9.511/CMAA/ISO'].ISO },
    { name: "{ArticuloDefiniciones.Carro.Cantidad de carros}", val: mapped.ArticuloDefiniciones.Carro['Cantidad de carros'] },
    { name: "{ArticuloDefiniciones.Carro.Carro 1.Velocidad de carro}", val: mapped.ArticuloDefiniciones.Carro['Carro 1']['Velocidad de carro'] },
    { name: "{ArticuloDefiniciones.Carro.Carro 1.Diametro de rueda (mm)}", val: mapped.ArticuloDefiniciones.Carro['Carro 1']['Diametro de rueda (mm)'] },
    { name: "{ArticuloDefiniciones.Puente.Material de ruedas}", val: mapped.ArticuloDefiniciones.Puente['Material de ruedas'] },
    { name: "{ArticuloDefiniciones.Puente.Cantidad de motorreductores}", val: mapped.ArticuloDefiniciones.Puente['Cantidad de motorreductores'] },
    { name: "{ArticuloDefiniciones.Puente.Reductor}", val: mapped.ArticuloDefiniciones.Puente.Reductor },
    { name: "{ArticuloDefiniciones.Puente.Motor/Modelo}", val: mapped.ArticuloDefiniciones.Puente['Motor/Modelo'] },
    { name: "{ArticuloDefiniciones.Puente.Motor/Potencia(Kw)}", val: mapped.ArticuloDefiniciones.Puente['Motor/Potencia(Kw)'] },
    { name: "{ArticuloDefiniciones.Puente.Tope hidraulico}", val: mapped.ArticuloDefiniciones.Puente['Tope hidraulico'] },
    { name: "{ArticuloDefiniciones.Puente.Velocidad de puente}", val: mapped.ArticuloDefiniciones.Puente['Velocidad de puente'] },
    { name: "{ArticuloDefiniciones.Puente.Total de ruedas (pzas)}", val: mapped.ArticuloDefiniciones.Puente['Total de ruedas (pzas)'] },
    { name: "{ArticuloDefiniciones.Puente.Observaciones}", val: mapped.ArticuloDefiniciones.Puente.Observaciones },
    { name: "{ArticuloDefiniciones.Datos Basicos.Tipo de Control.Control 1.Tipo de control}", val: mapped.ArticuloDefiniciones['Datos Basicos']['Tipo de Control']['Control 1']['Tipo de control'] },
    { name: "{ArticuloDefiniciones.Datos Basicos.Tipo de Control.Control 2.Tipo de control}", val: mapped.ArticuloDefiniciones['Datos Basicos']['Tipo de Control']['Control 2']['Tipo de control'] },
    { name: "{ArticuloDefiniciones.Puente.Tipo de alimentacion}", val: mapped.ArticuloDefiniciones.Puente['Tipo de alimentacion'] },
    { name: "{ArticuloDefiniciones.Gancho. Voltaje de operación trifásico}", val: mapped.ArticuloDefiniciones.Gancho['Voltaje de operación trifásico'] },
    { name: "{ArticuloDefiniciones.Gancho. Voltaje de Control}", val: mapped.ArticuloDefiniciones.Gancho['Voltaje de Control'] },
    { name: "{ArticuloDefiniciones.Puente.Sistema anticolicion delantero}", val: mapped.ArticuloDefiniciones.Puente['Sistema anticolicion delantero'] },
    { name: "{ArticuloDefiniciones.Puente.Sistema anticolicion Trasero}", val: mapped.ArticuloDefiniciones.Puente['Sistema anticolicion Trasero'] },
    { name: "{ArticuloDefiniciones.Datos Basicos.Peso muerto de la grúa}", val: mapped.ArticuloDefiniciones['Datos Basicos']['Peso muerto de la grúa'] },
    { name: "{ArticuloDefiniciones.Datos Basicos.Reacción máxima por rueda}", val: mapped.ArticuloDefiniciones['Datos Basicos']['Reacción máxima por rueda'] },
    { name: "{BahiaDefiniciones.Alimentacion.Longitud del sistema (m)}", val: mapped.BahiaDefiniciones.Alimentacion['Longitud del sistema (m)'] },
    { name: "{BahiaDefiniciones.Alimentacion.Amperaje (amp)}", val: mapped.BahiaDefiniciones.Alimentacion['Amperaje (amp)'] },
    { name: "{BahiaDefiniciones.Alimentacion.Localizacion de acometida}", val: mapped.BahiaDefiniciones.Alimentacion['Localizacion de acometida'] },
    { name: "{BahiaDefiniciones.Riel.Metros lineales de riel}", val: mapped.BahiaDefiniciones.Riel['Metros lineales de riel'] },
    { name: "{BahiaDefiniciones.Riel.Tipo de riel(m)}", val: mapped.BahiaDefiniciones.Riel['Tipo de riel(m)'].toString() },
    { name: "{BahiaDefiniciones.Riel. Calidad/Material riel según EN10025}", val: mapped.BahiaDefiniciones.Riel['Calidad/Material riel según EN10025'] },
    { name: "{BahiaDefiniciones.Riel.Tipo de riel(m).Burbach}", val: mapped.BahiaDefiniciones.Riel['Tipo de riel(m)'].Burbach },
    { name: "{BahiaDefiniciones.Riel.Observaciones.}", val: mapped.BahiaDefiniciones.Riel['Observaciones.'] },
    { name: "{FormacionPrecios.Tiempo de garantía}", val: mapped.FormacionPrecios['Tiempo de garantía'] },
    { name: "{ArticuloDefiniciones.Carro.Carro 1.Velocidad de traslación en m/min}", val: mapped.ArticuloDefiniciones.Carro['Carro 1']['Velocidad de traslación en m/min'] },
    { name: "{Oferta.Términos de Entrega}", val: mapped.Oferta['Términos de Entrega'] },
    { name: "{ArticuloDefiniciones.Montaje}", val: mapped.ArticuloDefiniciones.Montaje },
    { name: "{FormacionPrecios.Cotizacion.Global}", val: mapped.FormacionPrecios.Cotizacion.Global },
    { name: "{FormacionPrecios.Cotizacion.Desglosada}", val: mapped.FormacionPrecios.Cotizacion.Desglosada },
    { name: "{FormacionPrecios.Eventos de Pago. Eventos de Pago 1. Porcentaje}", val: mapped.FormacionPrecios['Eventos de Pago']['Eventos de Pago 1'].Porcentaje },
    { name: "{FormacionPrecios.Eventos de Pago. Eventos de Pago 1. Condicion de pago}", val: mapped.FormacionPrecios['Eventos de Pago']['Eventos de Pago 1']['Condicion de pago'] }
];

const templatePath = 'c:/mikne/PortalHormiga/v-hormiga-app/public/assets/cotizacion_hormiga.docx';
const outputPath = 'c:/mikne/PortalHormiga/v-hormiga-app/public/assets/Folio_47C_Limpio.docx';

try {
    const content = fs.readFileSync(templatePath);
    const zip = new PizZip(content);

    // Inject plain list via XML injection
    let xml = zip.file('word/document.xml').asText();

    let listXml = '<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/></w:rPr><w:t>LISTADO LIMPIO DE ETIQUETAS - FOLIO 47 C</w:t></w:r></w:p>';

    tagsToRender.forEach(t => {
        const val = (t.val === undefined || t.val === null || t.val === "") ? "N/A" : t.val;
        listXml += `<w:p><w:r><w:t>${t.name}: </w:t></w:r><w:r><w:rPr><w:color w:val="0000FF"/></w:rPr><w:t>${val}</w:t></w:r></w:p>`;
    });

    // Replace body content with our list
    xml = xml.replace(/<w:body>[\s\S]*<\/w:body>/, '<w:body>' + listXml + '<w:sectPr/></w:body>');
    zip.file('word/document.xml', xml);

    const zipResult = zip.generate({ type: "nodebuffer", compression: "DEFLATE" });
    fs.writeFileSync(outputPath, zipResult);
    console.log(`Clean Word generated: ${outputPath}`);
} catch (e) {
    console.error(e);
}
