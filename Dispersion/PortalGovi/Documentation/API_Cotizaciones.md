# API de Cotizaciones

Esta API permite gestionar cotizaciones completas con productos y bahías en la base de datos HANA.

## Endpoints Disponibles

### 1. Crear Cotización
**POST** `/api/cotizacion`

Crea una nueva cotización completa con encabezado, productos y bahías.

**Ejemplo de Request:**
```json
{
  "encabezado": {
    "tipoCotizacion": "GRUA_PUENTE",
    "tipoCuenta": "CLIENTE",
    "idiomaCotizacion": "ES",
    "cliente": "Empresa ABC",
    "contacto": "Juan Pérez",
    "dirFiscal": "Av. Principal 123, Ciudad",
    "dirEntrega": "Planta Industrial, Zona 1",
    "referencia": "REF-2024-001",
    "terminosEntrega": "FOB Origen",
    "folioPortal": 1001,
    "folioSap": 2001,
    "fecha": "2024-01-15",
    "vencimiento": "2024-02-15",
    "moneda": "MXN"
  },
  "productos": [
    {
      "producto": {
        "numArticulo": "GRUA-001",
        "cantidad": 2.0,
        "precioVenta": 150000.00,
        "asignadoA": "Ingeniero de Ventas",
        "definiciones": "Grúa puente de 10 toneladas"
      },
      "datosBasicos": {
        "capacidadGrua": "10 toneladas",
        "claro": "20 metros",
        "izaje": "15 metros",
        "voltajeOperacionTrifasico": "440V",
        "voltajeOperacion": "440V",
        "cantidadControles": "2",
        "voltajeControl": "24V",
        "pesoMuertoGrua": "8 toneladas",
        "cargaMaximaRueda": "5 toneladas",
        "equivalenteFemCmaa": "A4",
        "claseCmaa": "A4",
        "similarClaseCmaa": "A4",
        "claseElevacion": "A4",
        "grupoSolicitacion": "1",
        "medioControl": "Radio",
        "fabricanteModelo": "MIKNE-2024",
        "obsDatosBasicosControl": "Control remoto incluido",
        "femIso": "FEM 1.001",
        "obsClasificacion": "Clasificación estándar",
        "tipoPintura": "Epóxica",
        "colorPintura": "Gris industrial",
        "ambiente": "Interior",
        "especifique": "N/A",
        "trabajaEn": "Temperatura ambiente",
        "intemperie": false,
        "sitioCerrado": true,
        "elevacionNivelMar": "1500m",
        "materialTransporta": "Carga general"
      },
      "adicionales": {
        "dispositivoTomaCarga": true,
        "carreteRetractil": false,
        "torreta": true,
        "especifiqueTorretaEspecial": "Torreta giratoria 360°",
        "sirena": true,
        "tipoSirena": "Electrónica",
        "especifiqueSirenaEspecial": "Sirena con luces LED",
        "luminarias": true,
        "tipoLuminarias": "LED",
        "cantidadLuminarias": 4,
        "observaciones": "Equipamiento completo"
      },
      "izaje": {
        "cantidadPolipastos": "Dos",
        "tipoMecanismoElevacion1": "Eléctrico",
        "modelo1": "POL-001",
        "capacidadMecanismoIzaje1": "5 toneladas",
        "izajeGancho1": "3 metros",
        "control1": "Radio",
        "velocidadIzaje1": "8 m/min",
        "potenciaMotorPrincipal1": "15 HP",
        "motorModeloGanchoPrincipal1": "MOT-001",
        "tipoMecanismoElevacion2": "Eléctrico",
        "modelo2": "POL-002",
        "capacidadMecanismoIzaje2": "5 toneladas",
        "izajeGancho2": "3 metros",
        "control2": "Radio",
        "velocidadIzaje2": "8 m/min",
        "potenciaMotorPrincipal2": "15 HP",
        "motorModeloGanchoPrincipal2": "MOT-002",
        "segundoFreno": true,
        "dispositivoTomaCarga": true,
        "carrete": false,
        "sumadorCarga": true,
        "dispositivoMedicionSobrecarga": "Indicador digital",
        "gancho1": true,
        "gancho2": true,
        "especifiqueDispositivoGancho1": "Gancho con seguro",
        "especifiqueDispositivoGancho2": "Gancho con seguro",
        "carreteGancho1": "Carrete manual",
        "carreteGancho2": "Carrete manual",
        "observacionIzaje": "Sistema de izaje dual"
      }
    }
  ],
  "bahias": [
    {
      "bahia": {
        "bahia": "Bahía Principal",
        "alimentacion": "Eléctrica",
        "riel": "Riel estándar",
        "estructura": "Estructura metálica",
        "definiciones": "Bahía principal de producción"
      },
      "alimentacion": {
        "numElectrificacionesRequeridas": "2",
        "numAcometidasElectricas": "1",
        "adecuadaParaAlimentar": "Sí",
        "especifiqueAlimentacion": "Alimentación trifásica",
        "alimentacionElectricaNave": true,
        "localizacionAcometida": "Centro de la nave",
        "tipoAlimentacion": "Trifásica",
        "longitudSistema": "50 metros",
        "amperaje": "100A",
        "observaciones": "Sistema de alimentación robusto"
      },
      "riel": {
        "tipoRiel": "Riel estándar",
        "calidadMaterialRiel": "Acero A36",
        "metrosLinealesRiel": "50 metros",
        "observaciones": "Riel de alta calidad"
      },
      "estructura": {
        "cantidadLotesRequeridos": "1",
        "trabeCarril": true,
        "columnas": true,
        "cantidadColumnas": "4",
        "distanciaEntreColumnas": "12 metros",
        "nptANhr": "NPT 1",
        "tipoCodigoPintura": "Industrial",
        "montajeTrabeCarril": "Soldado",
        "pinturaEstructura": "Epóxica",
        "colorPintura": "Gris industrial",
        "metrosTrabeCarril": "50 metros",
        "tipoPintura": "Epóxica",
        "fijacionColumnas": "Anclaje químico",
        "observaciones": "Estructura resistente"
      }
    }
  ]
}
```

**Response:**
```json
{
  "message": "Cotización creada exitosamente",
  "id": 1
}
```

### 2. Obtener Cotización por ID
**GET** `/api/cotizacion/{id}`

Obtiene una cotización completa por su ID.

**Response:**
```json
{
  "encabezado": {
    "id": 1,
    "tipoCotizacion": "GRUA_PUENTE",
    "tipoCuenta": "CLIENTE",
    "idiomaCotizacion": "ES",
    "cliente": "Empresa ABC",
    "contacto": "Juan Pérez",
    "dirFiscal": "Av. Principal 123, Ciudad",
    "dirEntrega": "Planta Industrial, Zona 1",
    "referencia": "REF-2024-001",
    "terminosEntrega": "FOB Origen",
    "folioPortal": 1001,
    "folioSap": 2001,
    "fecha": "2024-01-15T00:00:00",
    "vencimiento": "2024-02-15T00:00:00",
    "moneda": "MXN"
  },
  "productos": [...],
  "bahias": [...]
}
```

### 3. Obtener Todas las Cotizaciones
**GET** `/api/cotizacion`

Obtiene la lista de todas las cotizaciones (solo encabezados).

**Response:**
```json
[
  {
    "id": 1,
    "tipoCotizacion": "GRUA_PUENTE",
    "cliente": "Empresa ABC",
    "fecha": "2024-01-15T00:00:00",
    "moneda": "MXN"
  },
  {
    "id": 2,
    "tipoCotizacion": "GRUA_MONORRIEL",
    "cliente": "Empresa XYZ",
    "fecha": "2024-01-16T00:00:00",
    "moneda": "USD"
  }
]
```

### 4. Actualizar Cotización
**PUT** `/api/cotizacion/{id}`

Actualiza una cotización existente.

**Request:** Mismo formato que crear cotización.

**Response:**
```json
{
  "message": "Cotización actualizada exitosamente"
}
```

### 5. Eliminar Cotización
**DELETE** `/api/cotizacion/{id}`

Elimina una cotización y todos sus datos relacionados.

**Response:**
```json
{
  "message": "Cotización eliminada exitosamente"
}
```

### 6. Obtener Productos de una Cotización
**GET** `/api/cotizacion/{id}/productos`

Obtiene todos los productos de una cotización específica.

### 7. Obtener Bahías de una Cotización
**GET** `/api/cotizacion/{id}/bahias`

Obtiene todas las bahías de una cotización específica.

## Códigos de Respuesta

- **200 OK**: Operación exitosa
- **201 Created**: Recurso creado exitosamente
- **400 Bad Request**: Datos de entrada inválidos
- **404 Not Found**: Recurso no encontrado
- **500 Internal Server Error**: Error interno del servidor

## Notas Importantes

1. **Transacciones**: Todas las operaciones de creación y actualización se realizan dentro de transacciones para garantizar la integridad de los datos.

2. **Relaciones**: Los productos y bahías se eliminan automáticamente cuando se elimina una cotización.

3. **Campos Opcionales**: Los campos de datos básicos, adicionales, izaje, alimentación, riel y estructura son opcionales.

4. **Validación**: Se recomienda validar los datos antes de enviarlos a la API.

5. **Conexión HANA**: La API utiliza la conexión HANA configurada en `appsettings.json` con la clave `HanaConnection`. 