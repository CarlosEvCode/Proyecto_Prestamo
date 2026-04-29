const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Listar herramientas con detalles de modelo, marca y categoría
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT h.*, m.nombre as modelo_nombre, ma.nombre as marca_nombre, c.nombre as categoria_nombre
      FROM herramientas h
      LEFT JOIN modelos m ON h.id_modelo = m.id_modelo
      LEFT JOIN marcas ma ON m.id_marca = ma.id_marca
      LEFT JOIN categorias c ON m.id_categoria = c.id_categoria
      ORDER BY h.codigo ASC
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Crear
router.post("/", async (req, res) => {
  try {
    const { codigo, numero_serie, id_modelo, condicion, ubicacion, created_by } = req.body;
    
    // Validar código único
    const [exist] = await db.query("SELECT id_herramienta FROM herramientas WHERE codigo = ?", [codigo]);
    if (exist.length > 0) return res.status(400).json({ success: false, message: "El código ya existe" });

    const [result] = await db.query(
      "INSERT INTO herramientas (codigo, numero_serie, id_modelo, condicion, ubicacion, created_by) VALUES (?, ?, ?, ?, ?, ?)",
      [codigo, numero_serie, id_modelo, condicion, ubicacion, created_by || null]
    );
    res.status(201).json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Actualizar
router.put("/:id", async (req, res) => {
  try {
    const { codigo, numero_serie, id_modelo, condicion, ubicacion, activo, updated_by } = req.body;
    const [result] = await db.query(
      "UPDATE herramientas SET codigo=?, numero_serie=?, id_modelo=?, condicion=?, ubicacion=?, activo=?, updated_by=? WHERE id_herramienta=?",
      [codigo, numero_serie, id_modelo, condicion, ubicacion, activo, updated_by || null, req.params.id]
    );
    res.json({ success: true, affected: result.affectedRows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Eliminar (Baja lógica o física)
router.delete("/:id", async (req, res) => {
  try {
    // Intentar eliminación física
    await db.query("DELETE FROM herramientas WHERE id_herramienta = ?", [req.params.id]);
    res.json({ success: true, message: "Eliminado con éxito" });
  } catch (error) {
    // Si tiene préstamos, mejor desactivarla (activo = 0)
    await db.query("UPDATE herramientas SET activo = 0 WHERE id_herramienta = ?", [req.params.id]);
    res.json({ success: true, message: "Desactivada (tiene historial de préstamos)" });
  }
});

module.exports = router;
