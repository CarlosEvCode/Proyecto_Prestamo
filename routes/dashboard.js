const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/stats", async (req, res) => {
  try {
    // Totales generales
    const [herramientas] = await db.query("SELECT COUNT(*) as total FROM herramientas");
    const [trabajadores] = await db.query("SELECT COUNT(*) as total FROM trabajadores");
    const [prestamos] = await db.query("SELECT COUNT(*) as total FROM prestamos WHERE estado = 'activo'");

    // GRÁFICO 1: Condición (Bueno, Regular, Malo)
    const [condiciones] = await db.query(`
      SELECT condicion, COUNT(*) as cantidad
      FROM herramientas
      GROUP BY condicion
    `);
    
    const dataCondicion = [0, 0, 0]; // [Bueno, Regular, Malo]
    condiciones.forEach(row => {
      if (row.condicion === 'bueno') dataCondicion[0] = row.cantidad;
      else if (row.condicion === 'regular') dataCondicion[1] = row.cantidad;
      else if (row.condicion === 'malo') dataCondicion[2] = row.cantidad;
    });

    // GRÁFICO 2: Top 5 Herramientas Más Usadas (más préstamos)
    const [herramientasUsadas] = await db.query(`
      SELECT h.codigo, h.id_herramienta, COUNT(p.id_prestamo) as cantidad_prestamos
      FROM herramientas h
      LEFT JOIN prestamos p ON h.id_herramienta = p.id_herramienta
      GROUP BY h.id_herramienta, h.codigo
      ORDER BY cantidad_prestamos DESC
      LIMIT 5
    `);
    
    const etiquetasHerramientas = herramientasUsadas.map(h => h.codigo || 'N/A');
    const dataTasaDevolucion = herramientasUsadas.map(h => h.cantidad_prestamos || 0);

    // GRÁFICO 3: Salud de Préstamos (Activos, Devueltos, Vencidos)
    const [prestamosEstado] = await db.query(`
      SELECT estado, COUNT(*) as cantidad
      FROM prestamos
      GROUP BY estado
    `);
    
    const dataPrestamos = [0, 0, 0]; // [Activos, Devueltos, Vencidos]
    prestamosEstado.forEach(row => {
      if (row.estado === 'activo') dataPrestamos[0] = row.cantidad;
      else if (row.estado === 'devuelto') dataPrestamos[1] = row.cantidad;
      else if (row.estado === 'vencido') dataPrestamos[2] = row.cantidad;
    });

    res.json({
      success: true,
      data: {
        totalHerramientas: herramientas[0].total,
        totalTrabajadores: trabajadores[0].total,
        prestamosActivos: prestamos[0].total,
        graficoCondicion: dataCondicion,
        etiquetasHerramientas: etiquetasHerramientas,
        prestamosXMes: dataTasaDevolucion,
        graficoPrestamos: dataPrestamos
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
