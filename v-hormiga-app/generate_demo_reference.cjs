
const fs = require('fs');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');

const cotizacionCompleta = {
    id: 53,
    clienteNombre: "MANTENIMIENTO INDUSTRIAL KNE S.A. DE C.V.",
    direccionEntrega: "Calle 1, Col. Centro, Querétaro, Qro, 76000",
    personaContacto: "Ing. Juan Perez",
    referencia: "PROYECTO PLANTA 2",
    folioPortal: "53",
    folioSap: "SAP-53-2026",
    vendedor: { slpName: "Vendedor Principal", telephone: "12345678", mobil: "5551234567", email: "vendedor@mikne.com" },
    vendedorSec: { slpName: "Soporte Ventas", telephone: "87654321", mobil: "5557654321", email: "soporte@mikne.com" },
    terminosEntrega: "L.A.B Planta Queretaro",
    productos: [
        {
            itemCode: "GRU001",
            itemName: "Grúa Viajera 10T",
            qty: 2,
            definiciones: {
                datosBasicos: {
                    capacidadGrua: 10000, claro: 15.5, equivalenteFemValue: "2m", cantidadGanchos: 1,
                    controles: [{ tipoControl: "Radio Control" }, { tipoControl: "Botonera Aux" }],
                    pesoMuertoGrua: 8500, reaccionMaximaRueda: 12000, tensionServicio: "460V / 3F / 60Hz", tensionControl: "110V"
                },
                carro: {
                    cantidadCarros: 1,
                    carros: [{ control: "Variador", velocidad1: 20, cantidadRuedasTraslacion: 4, diametroRuedas: 250, velocidadTraslacion: 20 }]
                },
                izaje: {
                    polipastos: [
                        { control: "Dos velocidades", codigoConstruccion: "ASME HST-4", geometriaRamales: "4/1", izajeGancho: 6, velocidadIzaje1: 4, velocidadIzajeMotorModelo: "ABB-123", tipoFreno: "Electromagnético", frenoEmergencia: true },
                        { izajeGancho: 2 }, { izajeGancho: 0 }
                    ]
                },
                puente: {
                    controlPuente: "Variador", materialRuedas: "Acero Forjado", cantidadMotorreductores: 2, reductor: "Cofia", motorModelo: "Model-X", motorPotencia1: 5.5, topeHidraulico: true, velocidad1: 40, cantidadRuedas: 4, diametroRuedas: 315, tipoAlimentacion: "Barra Conductora", interruptorLimite2PasosDelantero: true, interruptorLimite2PasosTrasero: true, sistemaAnticolisionDelantero: true, sistemaAnticolisionTrasero: true, observaciones: "Puente reforzado"
                },
                montaje: "Incluye montaje y puesta en marcha..."
            }
        }
    ],
    bahias: [
        {
            definiciones: {
                alimentacion: { longitudSistema: 50, amperaje: 100, localAcometida: "Extremo Sur" },
                riel: { metrosLinealesRiel: 100, tipoRiel: "Burbach No. 1", calidadMaterialRiel: "S275JR", observaciones: "Riel existente" }
            }
        }
    ],
    formacionPrecios: {
        tiempoGarantia: "12 meses",
        precioFinal: 1500000,
        configuraciones: {
            eventosPago: [{ porcentaje: 30, condicion: "Anticipo al pedido" }]
        }
    }
};

const allTagsToDemo = [
    // Oferta
    { tag: "{Oferta.Cliente.Nombre del Cliente}", val: cotizacionCompleta.clienteNombre },
    { tag: "{Oferta.Direccion de Entrega}", val: cotizacionCompleta.direccionEntrega },
    { tag: "{Oferta.Persona de Contacto}", val: cotizacionCompleta.personaContacto },
    { tag: "{Oferta.Referencia}", val: cotizacionCompleta.referencia },
    { tag: "{Oferta.Cantidad.Suma de Cantidad de Gruas de la misma Capacidad}", val: 2 },
    { tag: "{Oferta.Folio Sap}", val: cotizacionCompleta.folioSap },
    { tag: "{Oferta.Folio Portal}", val: cotizacionCompleta.id },
    { tag: "{Oferta.Direccion de Entrega.Ciudad}", val: "Querétaro" },
    { tag: "{Oferta.Direccion de Entrega.Ciudad.Estado}", val: "Qro" },
    { tag: "{Oferta.Vendedor principal}", val: cotizacionCompleta.vendedor.slpName },
    { tag: "{Oferta.Vendedor Secundario}", val: cotizacionCompleta.vendedorSec.slpName },
    { tag: "{Oferta.Vendedor principal. A.Telephone}", val: cotizacionCompleta.vendedor.telephone },
    { tag: "{Oferta.Vendedor Secundario. A.Telephone}", val: cotizacionCompleta.vendedorSec.telephone },
    { tag: "{Oferta.Vendedor principal. A.Mobil}", val: cotizacionCompleta.vendedor.mobil },
    { tag: "{Oferta.Vendedor secundario. A.Mobil}", val: cotizacionCompleta.vendedorSec.mobil },
    { tag: "{Oferta.Nombre de Grúa}", val: cotizacionCompleta.productos[0].itemName },
    { tag: "{Oferta.Código de Grúa}", val: cotizacionCompleta.productos[0].itemCode },
    { tag: "{Oferta.Términos de Entrega}", val: cotizacionCompleta.terminosEntrega },

    // ArticuloDefiniciones - Datos Basicos
    { tag: "{ArticuloDefiniciones.Datos Basicos. Capacidad de la(s) grúa(s)}", val: 10000 },
    { tag: "{ArticuloDefiniciones.Datos Basicos.Claro}", val: 15.5 },
    { tag: "{ArticuloDefiniciones.Datos Basicos.FEM9.511/CMAA/ISO. FEM9.511}", val: "2m" },
    { tag: "{ArticuloDefiniciones.Datos Basicos.FEM9.511/CMAA/ISO.ISO}", val: "2m" },
    { tag: "{ArticuloDefiniciones.Datos Basicos.FEM9.511/CMAA/ISO.CMAA}", val: "2m" },
    { tag: "{ArticuloDefiniciones.Datos Basicos.Peso muerto de la grúa}", val: 8500 },
    { tag: "{ArticuloDefiniciones.Datos Basicos.Reacción máxima por rueda}", val: 12000 },
    { tag: "{ArticuloDefiniciones.Datos Basicos.Gancho(s).Cantidad de ganchos}", val: 1 },
    { tag: "{ArticuloDefiniciones.Datos Basicos.Tipo de Control.Control 1.Tipo de control}", val: "Radio Control" },
    { tag: "{ArticuloDefiniciones.Datos Basicos.Tipo de Control.Control 2.Tipo de control}", val: "Botonera Aux" },

    // ArticuloDefiniciones - Gancho
    { tag: "{ArticuloDefiniciones.Gancho.Gancho 1.Codigo de construcción}", val: "ASME HST-4" },
    { tag: "{ArticuloDefiniciones.Gancho.Gancho 1. Geometría de ramales}", val: "4/1" },
    { tag: "{ArticuloDefiniciones.Gancho.Gancho 1. Izaje Gancho}", val: 6 },
    { tag: "{ArticuloDefiniciones.Gancho.Gancho 2. Izaje Gancho}", val: 2 },
    { tag: "{ArticuloDefiniciones.Gancho.Gancho 3. Izaje Gancho}", val: 0 },
    { tag: "{ArticuloDefiniciones.Gancho.Gancho 1. Velocidad de Izaje Gancho}", val: 4 },
    { tag: "{ArticuloDefiniciones.Gancho.Gancho 1.Motor/modelo}", val: "ABB-123" },
    { tag: "{ArticuloDefiniciones.Gancho.Gancho 1.Tipo de freno}", val: "Electromagnético" },
    { tag: "{ArticuloDefiniciones.Gancho.Gancho 1.Freno emergencia}", val: "Si" },
    { tag: "{ArticuloDefiniciones.Gancho. Voltaje de operación trifásico}", val: "460V / 3F / 60Hz" },
    { tag: "{ArticuloDefiniciones.Gancho. Voltaje de Control}", val: "110V" },

    // ArticuloDefiniciones - Carro
    { tag: "{ ArticuloDefiniciones.Carro.Cantidad de carros}", val: 1 },
    { tag: "{ ArticuloDefiniciones.Carro.Carro 1.Control de carro}", val: "Variador" },
    { tag: "{ ArticuloDefiniciones.Carro.Carro 1.Velocidad de carro}", val: 20 },
    { tag: "{ ArticuloDefiniciones.Carro.Carro 1.Cantidad de ruedas traslacion}", val: 4 },
    { tag: "{ ArticuloDefiniciones.Carro.Carro 1.Diametro de rueda (mm)}", val: 250 },
    { tag: "{ArticuloDefiniciones.Carro.Carro 1.Velocidad de traslación en m/min}", val: 20 },

    // ArticuloDefiniciones - Puente
    { tag: "{ArticuloDefiniciones.Puente.Control de puente}", val: "Variador" },
    { tag: "{ArticuloDefiniciones.Puente.Material de ruedas}", val: "Acero Forjado" },
    { tag: "{ArticuloDefiniciones.Puente.Cantidad de motorreductores}", val: 2 },
    { tag: "{ArticuloDefiniciones.Puente.Reductor}", val: "Cofia" },
    { tag: "{ArticuloDefiniciones.Puente.Motor/Modelo}", val: "Model-X" },
    { tag: "{ ArticuloDefiniciones.Puente.Motor/Potencia(Kw)}", val: 5.5 },
    { tag: "{ArticuloDefiniciones.Puente.Tope hidraulico}", val: "Si" },
    { tag: "{ArticuloDefiniciones.Puente.Velocidad de puente}", val: 40 },
    { tag: "{ArticuloDefiniciones.Puente.Total de ruedas (pzas)}", val: 4 },
    { tag: "{ArticuloDefiniciones.Puente.Ruedas motrices.Diametro de ruedas(mm)}", val: 315 },
    { tag: "{ArticuloDefiniciones.Puente.Tipo de alimentacion}", val: "Barra Conductora" },
    { tag: "{ArticuloDefiniciones.Puente.Sistema anticolicion delantero}", val: "Si" },
    { tag: "{ArticuloDefiniciones.Puente.Sistema anticolicion Trasero}", val: "Si" },
    { tag: "{ArticuloDefiniciones.Puente.Interruptor limite de 2 pasos delantero}", val: "Si" },
    { tag: "{ArticuloDefiniciones.Puente.Interruptor limite de 2 pasos trasero}", val: "Si" },
    { tag: "{ArticuloDefiniciones.Puente.Observaciones}", val: "Puente reforzado" },

    // BahiaDefiniciones
    { tag: "{BahiaDefiniciones.Alimentacion.Longitud del sistema (m)}", val: 50 },
    { tag: "{BahiaDefiniciones.Alimentacion.Amperaje (amp)}", val: 100 },
    { tag: "{BahiaDefiniciones.Alimentacion.Localizacion de acometida}", val: "Extremo Sur" },
    { tag: "{BahiaDefiniciones.Riel.Metros lineales de riel}", val: 100 },
    { tag: "{BahiaDefiniciones.Riel.Tipo de riel(m)}", val: "Burbach No. 1" },
    { tag: "{BahiaDefiniciones.Riel. Calidad/Material riel según EN10025}", val: "S275JR" },
    { tag: "{BahiaDefiniciones.Riel.Tipo de riel(m).Burbach}", val: "Burbach No. 1" },
    { tag: "{BahiaDefiniciones.Riel.Observaciones.}", val: "Riel existente" },

    // FormacionPrecios
    { tag: "{FormacionPrecios.Tiempo de garantía}", val: "12 meses" },
    { tag: "{FormacionPrecios.Cotizacion.Global}", val: "$ 1,500,000.00" },
    { tag: "{FormacionPrecios.Eventos de Pago. Eventos de Pago 1. Porcentaje}", val: 30 },
    { tag: "{FormacionPrecios.Eventos de Pago. Eventos de Pago 1. Condicion de pago}", val: "Anticipo al pedido" },

    // Montaje
    { tag: "{ArticuloDefiniciones.Montaje}", val: "Incluye montaje y puesta en marcha..." }
];

const referenceData = {
    demo: allTagsToDemo.map(t => ({ tag: t.tag, val: t.val, src: "Database mapping in pdfGenerator.js" }))
};

const templatePath = 'c:/mikne/PortalHormiga/v-hormiga-app/public/assets/demo_etiquetas.docx';
const outputPath = 'c:/mikne/PortalHormiga/v-hormiga-app/public/assets/Referencia_Etiquetas_Demo.docx';

try {
    const content = fs.readFileSync(templatePath);
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

    doc.setData(referenceData);
    doc.render();

    const buf = doc.getZip().generate({ type: "nodebuffer", compression: "DEFLATE" });
    fs.writeFileSync(outputPath, buf);
    console.log(`EXHAUSTIVE demo generated successfully at: ${outputPath}`);
} catch (e) {
    console.error("Error generating demo:", e);
}
