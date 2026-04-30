const express = require("express");
const router = express.Router();
const db = require("../config/db");

/* Listar préstamos */
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, t.nombre_completo as trabajador_nombre
      FROM prestamos p
      LEFT JOIN trabajadores t ON p.id_trabajador = t.id_trabajador
      ORDER BY p.fecha_salida DESC
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/* Obtener un préstamo específico */
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, t.nombre_completo as trabajador_nombre
      FROM prestamos p
      LEFT JOIN trabajadores t ON p.id_trabajador = t.id_trabajador
      WHERE p.id_prestamo = ?
    `, [req.params.id]);
    
    if (!rows.length) {
      return res.status(404).json({ success: false, message: "Préstamo no encontrado" });
    }
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/* Crear nuevo préstamo */
router.post("/", async (req, res) => {
  try {
    const {
      id_trabajador,
      id_herramienta,
      motivo,
      fecha_devolucion_esperada,
      estado
    } = req.body;

    // Validaciones
    if (!id_trabajador) {
      return res.status(400).json({ success: false, message: "id_trabajador es requerido" });
    }
    if (!id_herramienta) {
      return res.status(400).json({ success: false, message: "id_herramienta es requerido" });
    }
    if (!estado) {
      return res.status(400).json({ success: false, message: "estado es requerido" });
    }

    // Verificar que la herramienta esté activa
    const [herramientas] = await db.query(
      "SELECT activo FROM herramientas WHERE id_herramienta = ?",
      [id_herramienta]
    );
    if (!herramientas.length || !herramientas[0].activo) {
      return res.status(400).json({ success: false, message: "Herramienta no disponible" });
    }

    // Crear préstamo
    const now = new Date().toISOString().split('T')[0];
    const [result] = await db.query(
      `INSERT INTO prestamos (
        id_trabajador, id_herramienta, motivo, 
        fecha_devolucion_esperada, estado, fecha_salida
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [id_trabajador, id_herramienta, motivo || null, fecha_devolucion_esperada || null, estado, now]
    );

    res.status(201).json({
      success: true,
      message: "Préstamo creado correctamente",
      data: { id_prestamo: result.insertId }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/* Actualizar préstamo */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      id_trabajador,
      id_herramienta,
      motivo,
      fecha_devolucion_esperada,
      fecha_devolucion_real,
      estado
    } = req.body;

    // Validaciones
    if (!id_trabajador) {
      return res.status(400).json({ success: false, message: "id_trabajador es requerido" });
    }
    if (!id_herramienta) {
      return res.status(400).json({ success: false, message: "id_herramienta es requerido" });
    }
    if (!estado) {
      return res.status(400).json({ success: false, message: "estado es requerido" });
    }

    // Verificar que el préstamo existe
    const [prestamos] = await db.query(
      "SELECT id_prestamo FROM prestamos WHERE id_prestamo = ?",
      [id]
    );
    if (!prestamos.length) {
      return res.status(404).json({ success: false, message: "Préstamo no encontrado" });
    }

    // Actualizar
    await db.query(
      `UPDATE prestamos SET 
        id_trabajador = ?, 
        id_herramienta = ?, 
        motivo = ?, 
        fecha_devolucion_esperada = ?, 
        fecha_devolucion_real = ?,
        estado = ? 
      WHERE id_prestamo = ?`,
      [id_trabajador, id_herramienta, motivo || null, fecha_devolucion_esperada || null, fecha_devolucion_real || null, estado, id]
    );

    res.json({
      success: true,
      message: "Préstamo actualizado correctamente"
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/* Eliminar préstamo */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el préstamo existe
    const [prestamos] = await db.query(
      "SELECT estado FROM prestamos WHERE id_prestamo = ?",
      [id]
    );
    if (!prestamos.length) {
      return res.status(404).json({ success: false, message: "Préstamo no encontrado" });
    }

    // Validar que esté devuelto antes de eliminar
    if (prestamos[0].estado !== 'devuelto') {
      return res.status(400).json({ 
        success: false, 
        message: "Solo se pueden eliminar préstamos devueltos" 
      });
    }

    // Eliminar
    await db.query(
      "DELETE FROM prestamos WHERE id_prestamo = ?",
      [id]
    );

    res.json({
      success: true,
      message: "Préstamo eliminado correctamente"
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/* Obtener herramientas de un préstamo */
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
