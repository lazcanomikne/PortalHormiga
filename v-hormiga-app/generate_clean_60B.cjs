
const fs = require('fs');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');

// Load Data
const folioData = JSON.parse(fs.readFileSync('folio_60B.json', 'utf8'));

// Helper for case-insensitive access
const get = (obj, path) => {
    if (!obj) return undefined;
    const parts = path.split('.');
    let current = obj;
    for (const part of parts) {
        if (current === null || current === undefined) return undefined;
        if (current[part] !== undefined) {
            current = current[part];
        } else {
            const key = Object.keys(current).find(k => k.toLowerCase() === part.toLowerCase());
            if (key) {
                current = current[key];
            } else {
                return undefined;
            }
        }
    }
    return current;
};

const mapData = (src) => {
    const enc = src.encabezado || src.Encabezado || {};
    const address = enc.direccionEntrega || enc.DireccionEntrega || "";
    const values = address.split(",");
    const ciudad = values.length >= 4 ? values[3].trim() : "";
    const estado = values.length >= 5 ? values[4].trim() : "";

    const products = src.productos || src.Productos || [];
    const prod = products[0] || {};
    const p = prod.definiciones || prod.Definiciones || {};

    const Oferta = {
        Cliente: { 'Nombre del Cliente': enc.clientNombre || enc.clienteNombre || enc.ClienteNombre },
        'Direccion de Entrega': {
            toString: () => address,
            Ciudad: {
                toString: () => ciudad,
                Estado: { toString: () => estado }
            }
        },
        'Persona de Contacto': enc.personaContacto || enc.PersonaContacto,
        Referencia: enc.referencia || enc.Referencia,
        'Folio Sap': enc.folioSap || enc.FolioSap || "",
        'Folio Portal': enc.folioPortal || enc.FolioPortal || enc.id || enc.Id,
        'Vendedor principal': enc.vendedor ? {
            toString: () => enc.vendedor.slpName || enc.vendedor.SlpName || "",
            A: { Telephone: enc.vendedor.telephone || enc.vendedor.Telephone || "", Mobil: enc.vendedor.mobil || enc.vendedor.Mobil || "" }
        } : { toString: () => "", A: { Telephone: "", Mobil: "" } },
        'Vendedor Secundario': enc.vendedorSec ? {
            toString: () => enc.vendedorSec.slpName || enc.vendedorSec.SlpName || "",
            A: { Telephone: enc.vendedorSec.telephone || enc.vendedorSec.Telephone || "", Mobil: enc.vendedorSec.mobil || enc.vendedorSec.Mobil || "" }
        } : { toString: () => "", A: { Telephone: "", Mobil: "" } },
        'Vendedor secundario': { A: { Mobil: enc.vendedorSec ? (enc.vendedorSec.mobil || enc.vendedorSec.Mobil || "") : "" } },
        'Nombre de Grúa': prod.itemName || prod.ItemName || "",
        'Código de Grúa': prod.itemCode || prod.ItemCode || "",
        'Términos de Entrega': enc.terminosEntrega || enc.TerminosEntrega || "",
        Cantidad: {
            'Suma de Cantidad de Gruas de la misma Capacidad': products.length,
            'Suma de Cantidad de Gruas de la misma Capacidad.Diferentes a las primeras': ""
        },
        Resumen: {
            Capacidad: { 'Diferentes a las primeras': "" }
        }
    };

    const db = p.datosBasicos || p.DatosBasicos || {};
    const cp = p.puente || p.Puente || {};
    const cc = p.carro || p.Carro || {};
    const ci = p.izaje || p.Izaje || {};
    const polipastos = ci.polipastos || ci.Polipastos || [];
    const pol1 = polipastos[0] || {};

    const ArticuloDefiniciones = {
        'Datos Basicos': {
            'Capacidad de la(s) grúa(s)': db.capacidadGruaToneladas || db.CapacidadGruaToneladas || db.capacidadGrua || db.CapacidadGrua,
            'Claro': db.claroM || db.ClaroM || db.claro || db.Claro,
            'FEM9.511/CMAA/ISO': {
                CMAA: db.equivalenteFemValue || db.EquivalenteFemValue,
                'FEM9.511': db.equivalenteFemValue || db.EquivalenteFemValue,
                ISO: db.equivalenteFemValue || db.EquivalenteFemValue
            },
            'Gancho(s)': { 'Cantidad de ganchos': db.cantidadGanchos || db.CantidadGanchos },
            'Peso muerto de la grúa': db.pesoMuertoGrua || db.PesoMuertoGrua,
            'Reacción máxima por rueda': db.reaccionMaximaRueda || db.ReacciónMaximaRueda,
            'Tipo de Control': {
                'Control 1': { 'Tipo de control': get(db, 'controles.0.tipoControl') || get(db, 'Controles.0.TipoControl') || "" },
                'Control 2': { 'Tipo de control': get(db, 'controles.1.tipoControl') || get(db, 'Controles.1.TipoControl') || "" }
            }
        },
        Carro: {
            'Cantidad de carros': cc.cantidadCarros || cc.CantidadCarros,
            'Carro 1': {
                'Control de carro': get(cc, 'carros.0.control') || get(cc, 'Carros.0.Control') || "",
                'Velocidad de carro': get(cc, 'carros.0.velocidadTraslacion') || get(cc, 'Carros.0.VelocidadTraslacion') || "",
                'Cantidad de ruedas traslacion': get(cc, 'carros.0.cantidadRuedasTraslacion') || get(cc, 'Carros.0.CantidadRuedasTraslacion') || "",
                'Diametro de rueda (mm)': get(cc, 'carros.0.diametroRuedas') || get(cc, 'Carros.0.DiametroRuedas') || "",
                'Velocidad de traslación en m/min': get(cc, 'carros.0.velocidadTraslacion') || get(cc, 'Carros.0.VelocidadTraslacion') || ""
            }
        },
        Gancho: {
            'Gancho 1': {
                'Control Gancho': pol1.control || pol1.Control || "",
                'Codigo de construcción': pol1.codigoContruccion1 || pol1.CodigoContruccion1 || pol1.codigoContruccion || pol1.CodigoContruccion || "",
                'Geometría de ramales': pol1.geometriaRamales || pol1.GeometriaRamales || "",
                'Izaje Gancho': pol1.izajeGancho || pol1.IzajeGancho || "",
                'Velocidad de Izaje Gancho': pol1.velIzaje2 || pol1.VelIzaje2 || "",
                'Motor/modelo': pol1.motorModeloGanchoPrincipal || pol1.MotorModeloGanchoPrincipal || "",
                'Tipo de freno': pol1.tipoFreno || pol1.TipoFreno || "",
                'Freno emergencia': (pol1.frenoEmergencia || pol1.FrenoEmergencia) === true ? "Si" : "No"
            },
            'Gancho 2': { 'Izaje Gancho': get(ci, 'polipastos.1.izajeGancho') || get(ci, 'Polipastos.1.IzajeGancho') || 0 },
            'Gancho 3': { 'Izaje Gancho': get(ci, 'polipastos.2.izajeGancho') || get(ci, 'Polipastos.2.IzajeGancho') || 0 },
            'Voltaje de operación trifásico': db.tensionServicio || db.TensionServicio || db.voltajeOperacion || db.VoltajeOperacion,
            'Voltaje de Control': db.voltajeControl || db.VoltajeControl
        },
        Puente: {
            'Control de puente': cp.controlPuente || cp.ControlPuente,
            'Material de ruedas': get(cp, 'ruedasMotrices.materialRuedas') || get(cp, 'RuedasMotrices.MaterialRuedas') || "",
            'Cantidad de motorreductores': cp.cantidadMotorreductores || cp.CantidadMotorreductores,
            'Reductor': cp.reductor || cp.Reductor,
            'Motor/Modelo': cp.motorModeloPuente || cp.MotorModeloPuente,
            'Motor/Potencia(Kw)': cp.motorPotenciaKw1 || cp.MotorPotenciaKw1,
            'Tope hidraulico': (cp.topeHidraulico || cp.TopeHidraulico) === true ? "Si" : "No",
            'Velocidad de puente': cp.especifiqueVelocidadTraslacionPuente || cp.EspecifiqueVelocidadTraslacionPuente || cp.velocidadTraslacionPuente || cp.VelocidadTraslacionPuente,
            'Total de ruedas (pzas)': (get(cp, 'ruedasMotrices.cantidadRuedas') || 0) + (get(cp, 'ruedasLocas.cantidadRuedas') || 0),
            'Ruedas motrices': {
                'Diametro de ruedas(mm)': get(cp, 'ruedasMotrices.diametroRuedas') || get(cp, 'RuedasMotrices.DiametroRuedas') || "",
                'Material de ruedas': get(cp, 'ruedasMotrices.materialRuedas') || get(cp, 'RuedasMotrices.MaterialRuedas') || ""
            },
            'Tipo de alimentacion': cp.tipoAlimentacion || cp.TipoAlimentacion,
            'Interruptor limite de 2 pasos delantero': (cp.switchLimFinCarrDel || cp.SwitchLimFinCarrDel) === true ? "Si" : "No",
            'Interruptor limite de 2 pasos trasero': (cp.interLimFinCarrTras || cp.InterLimFinCarrTras) === true ? "Si" : "No",
            'Sistema anticolicion delantero': (cp.sisAnticolisionDel || cp.SisAnticolisionDel) === true ? "Si" : "No",
            'Sistema anticolicion Trasero': (cp.sisAnticolisionTras || cp.SisAnticolisionTras) === true ? "Si" : "No",
            'Observaciones': cp.observaciones || cp.Observaciones
        },
        'Montaje': get(p, 'montaje.gruaMontaje') || get(p, 'Montaje.GruaMontaje') ? "Incluye montaje" : "No incluido"
    };

    const bahias = src.bahias || src.Bahias || [];
    const b = bahias[0] ? (bahias[0].definiciones || bahias[0].Definiciones || {}) : {};
    const b_ali = b.alimentacion || b.Alimentacion || {};
    const b_riel = b.riel || b.Riel || {};

    const BahiaDefiniciones = {
        Alimentacion: {
            'Longitud del sistema (m)': b_ali.longitudSistema || b_ali.LongitudSistema,
            'Amperaje (amp)': b_ali.amperaje || b_ali.Amperaje,
            'Localizacion de acometida': b_ali.localAcometida || b_ali.LocalAcometida
        },
        Riel: {
            'Metros lineales de riel': b_riel.metrosLinealesRiel || b_riel.MetrosLinealesRiel,
            'Tipo de riel(m)': {
                toString: () => b_riel.tipoRiel || b_riel.TipoRiel || "",
                Burbach: b_riel.tipoRiel || b_riel.TipoRiel || ""
            },
            'Calidad/Material riel según EN10025': b_riel.calidadMaterialRiel || b_riel.CalidadMaterialRiel,
            'Observaciones.': b_riel.observaciones || b_riel.Observaciones
        }
    };

    const fp_global = src.FormacionPreciosGlobal || src.formacionPreciosGlobal || {};
    const conf_global = src.ConfiguracionesGlobales || src.configuracionesGlobales || {};
    const events = conf_global.eventosPago || conf_global.EventosPago || [];

    const FormacionPrecios = {
        'Tiempo de garantía': fp_global.tiempoGarantia || fp_global.TiempoGarantia || "N/A",
        Cotizacion: {
            Global: "$" + (enc.total || enc.Total || 0).toLocaleString(),
            Desglosada: "Detalle de costos..."
        },
        'Eventos de Pago': {
            'Eventos de Pago 1': {
                'Porcentaje': events[0] ? (events[0].porcentaje || events[0].Porcentaje) : "N/A",
                'Condicion de pago': events[0] ? (events[0].condicion || events[0].Condicion) : "N/A"
            }
        }
    };

    return { Oferta, ArticuloDefiniciones, BahiaDefiniciones, FormacionPrecios };
};

const mapped = mapData(folioData);

const tagsToRender = [
    { name: "{Oferta.Cliente.Nombre del Cliente}", val: get(mapped, 'Oferta.Cliente.Nombre del Cliente') },
    { name: "{Oferta.Direccion de Entrega}", val: mapped.Oferta['Direccion de Entrega'].toString() },
    { name: "{Oferta.Persona de Contacto}", val: mapped.Oferta['Persona de Contacto'] },
    { name: "{Oferta.Referencia}", val: mapped.Oferta.Referencia },
    { name: "{Oferta.Cantidad.Suma de Cantidad de Gruas de la misma Capacidad}", val: get(mapped, 'Oferta.Cantidad.Suma de Cantidad de Gruas de la misma Capacidad') },
    { name: "{ArticuloDefiniciones.Datos Basicos. Capacidad de la(s) grúa(s)}", val: get(mapped, 'ArticuloDefiniciones.Datos Basicos.Capacidad de la(s) grúa(s)') },
    { name: "{Oferta.Cantidad.Suma de Cantidad de Gruas de la misma Capacidad.Diferentes a las primeras}", val: get(mapped, 'Oferta.Cantidad.Suma de Cantidad de Gruas de la misma Capacidad.Diferentes a las primeras') },
    { name: "{Oferta.Resumen.Capacidad. Diferentes a las primeras}", val: get(mapped, 'Oferta.Resumen.Capacidad.Diferentes a las primeras') },
    { name: "{ArticuloDefiniciones.Datos Basicos.FEM9.511/CMAA/ISO.CMAA}", val: get(mapped, 'ArticuloDefiniciones.Datos Basicos.FEM9.511/CMAA/ISO.CMAA') },
    { name: "{Oferta.Folio Sap}", val: mapped.Oferta['Folio Sap'] },
    { name: "{Oferta.Folio Portal}", val: mapped.Oferta['Folio Portal'] },
    { name: "{Oferta.Direccion de Entrega.Ciudad}", val: mapped.Oferta['Direccion de Entrega'].Ciudad.toString() },
    { name: "{Oferta.Vendedor principal}", val: mapped.Oferta['Vendedor principal'].toString() },
    { name: "{Oferta.Vendedor Secundario}", val: mapped.Oferta['Vendedor Secundario'].toString() },
    { name: "{Oferta.Vendedor principal. A.Telephone}", val: get(mapped, 'Oferta.Vendedor principal.A.Telephone') },
    { name: "{Oferta.Vendedor Secundario. A.Telephone}", val: get(mapped, 'Oferta.Vendedor Secundario.A.Telephone') },
    { name: "{Oferta.Vendedor principal. A.Mobil}", val: get(mapped, 'Oferta.Vendedor principal.A.Mobil') },
    { name: "{Oferta.Vendedor secundario. A.Mobil}", val: get(mapped, 'Oferta.Vendedor secundario.A.Mobil') },
    { name: "{ArticuloDefiniciones.Gancho.Gancho 1.Control Gancho}", val: get(mapped, 'ArticuloDefiniciones.Gancho.Gancho 1.Control Gancho') },
    { name: "{ArticuloDefiniciones.Puente.Control de puente}", val: mapped.ArticuloDefiniciones.Puente['Control de puente'] },
    { name: "{Oferta.Direccion de Entrega.Ciudad.Estado}", val: mapped.Oferta['Direccion de Entrega'].Ciudad.Estado.toString() },
    { name: "{ArticuloDefiniciones.Datos Basicos.Claro}", val: get(mapped, 'ArticuloDefiniciones.Datos Basicos.Claro') },
    { name: "{Oferta.Nombre de Grúa}", val: mapped.Oferta['Nombre de Grúa'] },
    { name: "{Oferta.Código de Grúa}", val: mapped.Oferta['Código de Grúa'] },
    { name: "{ArticuloDefiniciones.Datos Basicos.Gancho(s).Cantidad de ganchos}", val: get(mapped, 'ArticuloDefiniciones.Datos Basicos.Gancho(s).Cantidad de ganchos') },
    { name: "{ArticuloDefiniciones.Gancho.Gancho 1.Codigo de construcción}", val: get(mapped, 'ArticuloDefiniciones.Gancho.Gancho 1.Codigo de construcción') },
    { name: "{ArticuloDefiniciones.Gancho.Gancho 1. Geometría de ramales}", val: get(mapped, 'ArticuloDefiniciones.Gancho.Gancho 1.Geometría de ramales') },
    { name: "{ArticuloDefiniciones.Gancho.Gancho 1. Izaje Gancho}", val: get(mapped, 'ArticuloDefiniciones.Gancho.Gancho 1.Izaje Gancho') },
    { name: "{ArticuloDefiniciones.Gancho.Gancho 1. Velocidad de Izaje Gancho}", val: get(mapped, 'ArticuloDefiniciones.Gancho.Gancho 1.Velocidad de Izaje Gancho') },
    { name: "{ArticuloDefiniciones.Gancho.Gancho 1.Motor/modelo}", val: get(mapped, 'ArticuloDefiniciones.Gancho.Gancho 1.Motor/modelo') },
    { name: "{ArticuloDefiniciones.Gancho.Gancho 1.Tipo de freno}", val: get(mapped, 'ArticuloDefiniciones.Gancho.Gancho 1.Tipo de freno') },
    { name: "{ArticuloDefiniciones.Gancho.Gancho 1.Freno emergencia}", val: get(mapped, 'ArticuloDefiniciones.Gancho.Gancho 1.Freno emergencia') },
    { name: "{ArticuloDefiniciones.Datos Basicos.FEM9.511/CMAA/ISO. FEM9.511}", val: get(mapped, 'ArticuloDefiniciones.Datos Basicos.FEM9.511/CMAA/ISO.FEM9.511') },
    { name: "{ArticuloDefiniciones.Datos Basicos.FEM9.511/CMAA/ISO.ISO}", val: get(mapped, 'ArticuloDefiniciones.Datos Basicos.FEM9.511/CMAA/ISO.ISO') },
    { name: "{ArticuloDefiniciones.Carro.Cantidad de carros}", val: mapped.ArticuloDefiniciones.Carro['Cantidad de carros'] },
    { name: "{ArticuloDefiniciones.Carro.Carro 1.Velocidad de carro}", val: get(mapped, 'ArticuloDefiniciones.Carro.Carro 1.Velocidad de carro') },
    { name: "{ArticuloDefiniciones.Carro.Carro 1.Diametro de rueda (mm)}", val: get(mapped, 'ArticuloDefiniciones.Carro.Carro 1.Diametro de rueda (mm)') },
    { name: "{ArticuloDefiniciones.Puente.Material de ruedas}", val: mapped.ArticuloDefiniciones.Puente['Material de ruedas'] },
    { name: "{ArticuloDefiniciones.Puente.Cantidad de motorreductores}", val: mapped.ArticuloDefiniciones.Puente['Cantidad de motorreductores'] },
    { name: "{ArticuloDefiniciones.Puente.Reductor}", val: mapped.ArticuloDefiniciones.Puente.Reductor },
    { name: "{ArticuloDefiniciones.Puente.Motor/Modelo}", val: mapped.ArticuloDefiniciones.Puente['Motor/Modelo'] },
    { name: "{ArticuloDefiniciones.Puente.Motor/Potencia(Kw)}", val: mapped.ArticuloDefiniciones.Puente['Motor/Potencia(Kw)'] },
    { name: "{ArticuloDefiniciones.Puente.Tope hidraulico}", val: mapped.ArticuloDefiniciones.Puente['Tope hidraulico'] },
    { name: "{ArticuloDefiniciones.Puente.Velocidad de puente}", val: mapped.ArticuloDefiniciones.Puente['Velocidad de puente'] },
    { name: "{ArticuloDefiniciones.Puente.Total de ruedas (pzas)}", val: mapped.ArticuloDefiniciones.Puente['Total de ruedas (pzas)'] },
    { name: "{ArticuloDefiniciones.Puente.Observaciones}", val: mapped.ArticuloDefiniciones.Puente.Observaciones },
    { name: "{ArticuloDefiniciones.Datos Basicos.Tipo de Control.Control 1.Tipo de control}", val: get(mapped, 'ArticuloDefiniciones.Datos Basicos.Tipo de Control.Control 1.Tipo de control') },
    { name: "{ArticuloDefiniciones.Datos Basicos.Tipo de Control.Control 2.Tipo de control}", val: get(mapped, 'ArticuloDefiniciones.Datos Basicos.Tipo de Control.Control 2.Tipo de control') },
    { name: "{ArticuloDefiniciones.Puente.Tipo de alimentacion}", val: mapped.ArticuloDefiniciones.Puente['Tipo de alimentacion'] },
    { name: "{ArticuloDefiniciones.Gancho. Voltaje de operación trifásico}", val: get(mapped, 'ArticuloDefiniciones.Gancho.Voltaje de operación trifásico') },
    { name: "{ArticuloDefiniciones.Gancho. Voltaje de Control}", val: get(mapped, 'ArticuloDefiniciones.Gancho.Voltaje de Control') },
    { name: "{ArticuloDefiniciones.Puente.Sistema anticolicion delantero}", val: mapped.ArticuloDefiniciones.Puente['Sistema anticolicion delantero'] },
    { name: "{ArticuloDefiniciones.Puente.Sistema anticolicion Trasero}", val: mapped.ArticuloDefiniciones.Puente['Sistema anticolicion Trasero'] },
    { name: "{ArticuloDefiniciones.Datos Basicos.Peso muerto de la grúa}", val: get(mapped, 'ArticuloDefiniciones.Datos Basicos.Peso muerto de la grúa') },
    { name: "{ArticuloDefiniciones.Datos Basicos.Reacción máxima por rueda}", val: get(mapped, 'ArticuloDefiniciones.Datos Basicos.Reacción máxima por rueda') },
    { name: "{BahiaDefiniciones.Alimentacion.Longitud del sistema (m)}", val: get(mapped, 'BahiaDefiniciones.Alimentacion.Longitud del sistema (m)') },
    { name: "{BahiaDefiniciones.Alimentacion.Amperaje (amp)}", val: get(mapped, 'BahiaDefiniciones.Alimentacion.Amperaje (amp)') },
    { name: "{BahiaDefiniciones.Alimentacion.Localizacion de acometida}", val: get(mapped, 'BahiaDefiniciones.Alimentacion.Localizacion de acometida') },
    { name: "{BahiaDefiniciones.Riel.Metros lineales de riel}", val: get(mapped, 'BahiaDefiniciones.Riel.Metros lineales de riel') },
    { name: "{BahiaDefiniciones.Riel.Tipo de riel(m)}", val: get(mapped, 'BahiaDefiniciones.Riel.Tipo de riel(m)').toString() },
    { name: "{BahiaDefiniciones.Riel. Calidad/Material riel según EN10025}", val: get(mapped, 'BahiaDefiniciones.Riel.Calidad/Material riel según EN10025') },
    { name: "{BahiaDefiniciones.Riel.Tipo de riel(m).Burbach}", val: get(mapped, 'BahiaDefiniciones.Riel.Tipo de riel(m).Burbach') },
    { name: "{BahiaDefiniciones.Riel.Observaciones.}", val: get(mapped, 'BahiaDefiniciones.Riel.Observaciones.') },
    { name: "{FormacionPrecios.Tiempo de garantía}", val: mapped.FormacionPrecios['Tiempo de garantía'] },
    { name: "{ArticuloDefiniciones.Carro.Carro 1.Velocidad de traslación en m/min}", val: get(mapped, 'ArticuloDefiniciones.Carro.Carro 1.Velocidad de traslación en m/min') },
    { name: "{Oferta.Términos de Entrega}", val: mapped.Oferta['Términos de Entrega'] },
    { name: "{ArticuloDefiniciones.Montaje}", val: mapped.ArticuloDefiniciones.Montaje },
    { name: "{FormacionPrecios.Cotizacion.Global}", val: mapped.FormacionPrecios.Cotizacion.Global },
    { name: "{FormacionPrecios.Cotizacion.Desglosada}", val: mapped.FormacionPrecios.Cotizacion.Desglosada },
    { name: "{FormacionPrecios.Eventos de Pago. Eventos de Pago 1. Porcentaje}", val: get(mapped, 'FormacionPrecios.Eventos de Pago.Eventos de Pago 1.Porcentaje') },
    { name: "{FormacionPrecios.Eventos de Pago. Eventos de Pago 1. Condicion de pago}", val: get(mapped, 'FormacionPrecios.Eventos de Pago.Eventos de Pago 1.Condicion de pago') }
];

const templatePath = 'c:/mikne/PortalHormiga/v-hormiga-app/public/assets/cotizacion_hormiga.docx';
const outputPath = 'c:/mikne/PortalHormiga/v-hormiga-app/public/assets/Folio_60B_Limpio.docx';

try {
    const content = fs.readFileSync(templatePath);
    const zip = new PizZip(content);
    let xml = zip.file('word/document.xml').asText();
    let listXml = '<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/></w:rPr><w:t>LISTADO LIMPIO DE ETIQUETAS - FOLIO 60-B</w:t></w:r></w:p>';

    tagsToRender.forEach(t => {
        const val = (t.val === undefined || t.val === null || t.val === "") ? "N/A" : t.val;
        listXml += `<w:p><w:r><w:t>${t.name}: </w:t></w:r><w:r><w:rPr><w:color w:val="0000FF"/></w:rPr><w:t>${val}</w:t></w:r></w:p>`;
    });

    xml = xml.replace(/<w:body>[\s\S]*<\/w:body>/, '<w:body>' + listXml + '<w:sectPr/></w:body>');
    zip.file('word/document.xml', xml);

    const zipResult = zip.generate({ type: "nodebuffer", compression: "DEFLATE" });
    fs.writeFileSync(outputPath, zipResult);
    console.log(`Clean Word generated: ${outputPath}`);
} catch (e) {
    console.error(e);
}
