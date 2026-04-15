/** Etiquetas de sección de bahía (mismo criterio que FormacionPrecios). */
export const DIC_BAHIA_SECCIONES = {
  alimentacion: 'Alimentación',
  riel: 'Riel',
  estructura: 'Estructura'
}

/**
 * Construye líneas de conceptos en orden: por cada producto (grúa),
 * flete/montaje de ese producto, opciones de bahía asignada (por nombre o por índice si coinciden cantidades).
 */
export function buildConceptosOrdenProductoBahia (articles, bahias, dicEtiquetas, preciosPorCodigo = null) {
  const dic = dicEtiquetas || DIC_BAHIA_SECCIONES

  const getSaved = (codigo) => {
    if (!preciosPorCodigo) return null
    if (preciosPorCodigo instanceof Map) return preciosPorCodigo.get(codigo) || null
    return preciosPorCodigo[codigo] || null
  }

  const merge = (base) => {
    const legacy = base._legacyCodigo
    const raw = { ...base }
    delete raw._legacyCodigo
    let s = getSaved(raw.codigo)
    if (!s && legacy != null) {
      s = getSaved(legacy)
    }
    if (!s) return raw
    return {
      ...raw,
      cantidad: s.cantidad ?? raw.cantidad,
      precioUnitario: s.precioUnitario ?? s.precioUnit ?? raw.precioUnitario,
      precioTotal: s.precioTotal ?? s.total ?? raw.precioTotal,
      edit: s.edit ?? raw.edit
    }
  }

  const out = []
  const usedCodes = new Set()

  const pushBahiaOpciones = (b) => {
    if (!b) return
    const n = (b.nombre || '').trim()
    ;['alimentacion', 'riel', 'estructura'].forEach((k) => {
      if (b[k] !== true) return
      const etiqueta = dic[k] || k
      // Código único por bahía (antes colisionaba "Alimentación" entre varias bahías).
      const codigo = n ? `${etiqueta} — ${n}` : etiqueta
      const line = merge({
        codigo,
        _legacyCodigo: n ? etiqueta : undefined,
        descripcion: `${etiqueta} - ${b.nombre || ''}`,
        cantidad: 1,
        precioUnitario: 0,
        precioTotal: 0,
        edit: false
      })
      out.push(line)
      usedCodes.add(line.codigo)
      if (n) {
        usedCodes.add(etiqueta)
      }
    })
  }

  const listA = articles || []
  const listB = bahias || []

  listA.forEach((b) => {
    const itemCode = String(b.itemCode || '').trim()
    if (!itemCode) {
      return
    }

    const qty = b.qty ?? 1
    const price = b.price ?? 0
    const main = merge({
      codigo: itemCode,
      descripcion: b.itemName,
      cantidad: qty,
      precioUnitario: price,
      precioTotal: qty * price,
      edit: false
    })
    out.push(main)
    usedCodes.add(main.codigo)

    const definiciones = b.definiciones
    if (definiciones?.flete) {
      const vals = Object.entries(definiciones.flete).filter(([key]) => key !== 'id' && key !== 'idCotizacionProducto' && key !== 'observaciones' && key !== 'Observaciones')
      if (vals.some(([, v]) => v === true)) {
        const codigo = `Flete ${itemCode}`
        out.push(merge({ codigo, descripcion: `${b.itemName} - Flete`, cantidad: 1, precioUnitario: 0, precioTotal: 0, edit: false }))
        usedCodes.add(codigo)
      }
    }
    if (definiciones?.montaje) {
      const vals = Object.entries(definiciones.montaje).filter(([key]) => key !== 'id' && key !== 'idCotizacionProducto' && key !== 'observaciones' && key !== 'Observaciones')
      if (vals.some(([, v]) => v === true)) {
        const codigo = `Montaje ${itemCode}`
        out.push(merge({ codigo, descripcion: `${b.itemName} - Montaje`, cantidad: 1, precioUnitario: 0, precioTotal: 0, edit: false }))
        usedCodes.add(codigo)
      }
    }

    let bah = null
    const nombreBahia = (b.bahia || '').trim()
    if (nombreBahia) {
      bah = listB.find((x) => (x.nombre || '').trim() === nombreBahia)
    }
    if (!bah && listB.length === listA.length) {
      const idx = listA.indexOf(b)
      if (idx >= 0) {
        bah = listB[idx]
      }
    }
    if (bah) {
      pushBahiaOpciones(bah)
    }
  })

  // No listar bahías "huérfanas": solo opciones de bahía ligadas a un producto (arriba).

  return { lines: out, usedCodes }
}

/** Aplana productos API { producto } o ya planos para el ordenador. */
export function normalizeArticlesForOrden (productos) {
  if (!Array.isArray(productos)) return []
  return productos.map((p) => {
    if (p?.itemCode != null) return p
    if (p?.producto) {
      return {
        itemCode: p.producto.itemCode || '',
        itemName: p.producto.itemName || '',
        qty: p.producto.qty ?? 1,
        price: p.producto.price ?? 0,
        bahia: p.producto.bahia || '',
        definiciones: p.producto.definiciones || null
      }
    }
    return p
  })
}

export function normalizeBahiasForOrden (bahias) {
  if (!Array.isArray(bahias)) return []
  return bahias.map((b) => {
    if (b?.nombre != null && (typeof b.alimentacion === 'boolean' || typeof b.riel === 'boolean' || typeof b.estructura === 'boolean')) {
      return b
    }
    if (b?.bahia) {
      return {
        id: b.bahia.id,
        nombre: b.bahia.nombre || '',
        alimentacion: !!b.bahia.alimentacion,
        riel: !!b.bahia.riel,
        estructura: !!b.bahia.estructura,
        definiciones: b.bahia.definiciones || null
      }
    }
    return b
  })
}

/**
 * Reordena y regenera líneas según productos/bahías actuales, manteniendo precios guardados por código.
 * Elimina filas obsoletas (productos quitados, etc.). Conserva solo líneas manuales o borradores sin código.
 */
export function reorderConceptosPreservandoPrecios (conceptos, articles, bahias, dicEtiquetas) {
  const lista = Array.isArray(conceptos) ? conceptos : []
  const mapa = new Map()
  for (const c of lista) {
    const k = c.codigo
    if (k !== undefined && k !== null && String(k).trim() !== '') {
      mapa.set(k, { ...c })
    }
  }
  const { lines, usedCodes } = buildConceptosOrdenProductoBahia(articles, bahias, dicEtiquetas, mapa)

  const conservarExtra = lista.filter((c) => {
    const cod = c.codigo
    const codStr = cod === undefined || cod === null ? '' : String(cod).trim()
    if (codStr !== '' && usedCodes.has(codStr)) {
      return false
    }
    if (c.manual === true) {
      return true
    }
    if (codStr === '') {
      return true
    }
    return false
  })

  return [...lines, ...conservarExtra]
}
