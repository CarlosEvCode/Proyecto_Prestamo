const express = require("express");
const router = express.Router();
const db = require("../config/db");

// --- ÁREAS ---
router.get("/areas", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM areas ORDER BY nombre ASC");
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/areas", async (req, res) => {
  try {
    const { nombre } = req.body;
    const [result] = await db.query("INSERT INTO areas (nombre) VALUES (?)", [nombre]);
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// --- MARCAS ---
router.get("/marcas", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM marcas ORDER BY nombre ASC");
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// --- CATEGORÍAS ---
router.get("/categorias", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM categorias ORDER BY nombre ASC");
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// --- MODELOS (con su Marca y Categoría) ---
router.get("/modelos", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT m.*, ma.nombre as marca_nombre, c.nombre as categoria_nombre 
      FROM modelos m
      JOIN marcas ma ON m.id_marca = ma.id_marca
      JOIN categorias c ON m.id_categoria = c.id_categoria
      ORDER BY m.nombre ASC
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
