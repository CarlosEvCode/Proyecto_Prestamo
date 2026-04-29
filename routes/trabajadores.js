const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Listar todos con su área
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT t.*, a.nombre as area_nombre 
      FROM trabajadores t
      LEFT JOIN areas a ON t.id_area = a.id_area
      ORDER BY t.nombre_completo ASC
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Obtener uno por ID
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM trabajadores WHERE id_trabajador = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: "No encontrado" });
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Crear
router.post("/", async (req, res) => {
  try {
    const { dni, nombre_completo, cargo, turno, id_area, created_by } = req.body;
    
    // Validar DNI único
    const [exist] = await db.query("SELECT id_trabajador FROM trabajadores WHERE dni = ?", [dni]);
    if (exist.length > 0) return res.status(400).json({ success: false, message: "El DNI ya existe" });

    const [result] = await db.query(
      "INSERT INTO trabajadores (dni, nombre_completo, cargo, turno, id_area, created_by) VALUES (?, ?, ?, ?, ?, ?)",
      [dni, nombre_completo, cargo, turno, id_area, created_by || null]
    );
    res.status(201).json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Actualizar
router.put("/:id", async (req, res) => {
  try {
    const { dni, nombre_completo, cargo, turno, id_area, updated_by } = req.body;
    const [result] = await db.query(
      "UPDATE trabajadores SET dni=?, nombre_completo=?, cargo=?, turno=?, id_area=?, updated_by=? WHERE id_trabajador=?",
      [dni, nombre_completo, cargo, turno, id_area, updated_by || null, req.params.id]
    );
    res.json({ success: true, affected: result.affectedRows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Eliminar
router.delete("/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM trabajadores WHERE id_trabajador = ?", [req.params.id]);
    res.json({ success: true, message: "Eliminado" });
  } catch (error) {
    res.status(500).json({ success: false, message: "No se puede eliminar: tiene registros relacionados" });
  }
});

module.exports = router;
