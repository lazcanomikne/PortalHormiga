import { useArticlesStore } from "@/stores/useArticlesStore";
import Docxtemplater from "docxtemplater";
import expressionParser from "docxtemplater/expressions.js";
import { saveAs } from "file-saver";
import PizZip from "pizzip";

/**
 * Servicio para generar PDF/HTML de cotización
 */
export class PDFGeneratorService {
  constructor() {
    this.store = useArticlesStore();
  }
  /**
   * Carga la plantilla Word desde assets
   * @returns {Promise<ArrayBuffer>} Buffer de la plantilla
   */
  async cargarPlantillaWord() {
    try {
      const response = await fetch(
        import.meta.env.DEV
          ? "/src/assets/plantilla_cotizacion.docx"
          : "assets/plantilla_cotizacion.docx"
      );
      if (!response.ok) {
        throw new Error(`Error cargando plantilla: ${response.status}`);
      }
      return await response.arrayBuffer();
    } catch (error) {
      console.error("Error cargando plantilla Word:", error);
      throw error;
    }
  }


  /**
   * Genera y descarga el documento Word de la cotización
   * @param {Object} cotizacionCompleta - Datos completos de la cotización
   */
  async generarYDescargarWord(cotizacionCompleta) {
    try {
      const values = cotizacionCompleta.encabezado.direccionEntrega.split(",");
      const ubicacion = `${values[3]}, ${values[4]}`
      // Cargar la plantilla
      const plantillaBuffer = await this.cargarPlantillaWord();

      // Crear el zip con la plantilla
      const zip = new PizZip(plantillaBuffer);
      const parser = expressionParser.configure({
        filters: {
          where(input, query) {
            return input.filter((item) =>
              expressionParser.compile(query)(item)
            );
          },
          filtersArticles(list) {
            const result = list.filter((item) => cotizacionCompleta.productos.find((article) => article.itemCode === item.codigo))
              .map((item) => {
                const article = cotizacionCompleta.productos.find((article) => article.itemCode === item.codigo);
                return {
                  ...item,
                  ...article,
                  controles: article.definiciones.datosBasicos.controles.map((control) => control.tipoControl).join(" + "),
                  textoMontaje: Object.keys(article.definiciones.montaje).some((key) => article.definiciones.montaje[key] == true) ? "Incluye montaje y puesta en marcha.Las grúas móviles para las maniobras de montaje y las plataformas para trabajos en alturas no están incluidas" : "",
                  ubicacion,
                }
              });
            return result;
          },
          filtersDefiniciones(list, field) {
            return list.filter((item) => item.itemCode === field);
          },
          sumBy(input, field) {
            // Always check for undefined input to avoid runtime errors
            if (!input) {
              return input;
            }
            return input.reduce(
              (sum, object) => sum + (+object[field]),
              0
            );
          },
          currency(input) {
            return (input / 1).toFixed(2).replace(",", ".").toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
          }
        },
      });

      // Crear el docxtemplater
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        parser: parser,
      });

      // Mapear los datos
      const datos = cotizacionCompleta;

      // Establecer los datos en el template
      doc.setData(datos);

      try {
        // Renderizar el documento
        doc.render();
      } catch (error) {
        console.error("Error renderizando documento:", error);
        throw new Error(`Error procesando plantilla: ${error.message}`);
      }

      // Generar el documento final
      const buf = doc.getZip().generate({
        type: "arraybuffer",
        compression: "DEFLATE",
        compressionOptions: {
          level: 9,
        },
      });

      // Crear el nombre del archivo
      const nombreArchivo = `Cotizacion_${datos.encabezado.cliente}_${datos.encabezado.folioPortal
        }_${new Date().toISOString().split("T")[0]}.docx`;

      // Descargar el archivo
      const blob = new Blob([buf], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      saveAs(blob, nombreArchivo);

      console.log("Documento Word generado y descargado exitosamente");
    } catch (error) {
      console.error("Error generando documento Word:", error);
      throw error;
    }
  }
}

// Instancia singleton del servicio
export const pdfGeneratorService = new PDFGeneratorService();
