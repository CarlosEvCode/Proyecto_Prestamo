const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Listar préstamos con información del trabajador
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, t.nombre_completo as trabajador_nombre, 
             u.nombre_completo as usuario_entrega_nombre
      FROM prestamos p
      LEFT JOIN trabajadores t ON p.id_trabajador = t.id_trabajador
      LEFT JOIN usuarios u ON p.id_usuario_entrega = u.id_usuario
      ORDER BY p.fecha_salida DESC
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Obtener herramientas de un préstamo específico
router.get("/:id/detalles", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT dp.*, h.codigo, m.nombre as modelo_nombre
      FROM detalle_prestamo dp
      JOIN herramientas h ON dp.id_herramienta = h.id_herramienta
      LEFT JOIN modelos m ON h.id_modelo = m.id_modelo
      WHERE dp.id_prestamo = ?
    `, [req.params.id]);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
