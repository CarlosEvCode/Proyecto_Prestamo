const express = require("express");
const router = express.Router();
const db = require("../config/db");

/* Get modelos  = para traer las marcas y categorias */
router.get("/", async (req, res) => {
  try {
    const query = `
      SELECT m.id_modelo, m.nombre, 
             ma.nombre as marca, 
             c.nombre as categoria 
      FROM modelos m
      LEFT JOIN marcas ma ON m.id_marca = ma.id_marca
      LEFT JOIN categorias c ON m.id_categoria = c.id_categoria
    `;
    const [rows] = await db.query(query);
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error al obtener modelos" });
  }
});

/* Get modelos por id */
router.get("/:id", async (req, res) => {
  try {
    const idModelo = req.params.id;
    const query = `
      SELECT m.id_modelo, m.nombre, 
             ma.nombre as marca, 
             c.nombre as categoria,
             m.id_marca,
             m.id_categoria
      FROM modelos m
      LEFT JOIN marcas ma ON m.id_marca = ma.id_marca
      LEFT JOIN categorias c ON m.id_categoria = c.id_categoria
      WHERE m.id_modelo = ?
    `;
    const [rows] = await db.query(query, [idModelo]);
    
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Modelo no encontrado" });
    }
    
    res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al obtener el modelo" });
  }
});

/* Post = para crear nuevo modelo */
router.post("/", async (req, res) => {
  try {
    const { nombre, id_marca, id_categoria } = req.body;

    if (!nombre || !id_marca || !id_categoria) {
      return res
        .status(400)
        .json({ success: false, message: "Faltan datos obligatorios" });
    }

    const [result] = await db.query(
      "INSERT INTO modelos (nombre, id_marca, id_categoria) VALUES (?, ?, ?)",
      [nombre, id_marca, id_categoria],
    );

    res.status(201).json({
      success: true,
      message: "Modelo creado",
      data: { id_modelo: result.insertId, nombre, id_marca, id_categoria },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al crear modelo" });
  }
});

/* PUT modelos = actualizar modelo */
router.put("/:id", async (req, res) => {
  try {
    const idModelo = req.params.id;
    const { nombre, id_marca, id_categoria } = req.body;

    if (!nombre || !id_marca || !id_categoria) {
      return res
        .status(400)
        .json({ success: false, message: "Faltan datos obligatorios" });
    }

    const [result] = await db.query(
      "UPDATE modelos SET nombre = ?, id_marca = ?, id_categoria = ? WHERE id_modelo = ?",
      [nombre, id_marca, id_categoria, idModelo],
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Modelo no encontrado" });
    }

    res.status(200).json({
      success: true,
      message: "Modelo actualizado correctamente",
      data: { id_modelo: idModelo, nombre, id_marca, id_categoria },
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error al actualizar modelo" });
  }
});

/* DELETE modelos = eliminar modelo */
router.delete("/:id", async (req, res) => {
  try {
    const idModelo = req.params.id;

    // Comprobar si hay herramientas usando este modelo
    const [herramientas] = await db.query(
      "SELECT COUNT(*) AS total FROM herramientas WHERE id_modelo = ?",
      [idModelo],
    );

    if (herramientas[0].total > 0) {
      return res.status(409).json({
        success: false,
        message:
          "No se puede eliminar el modelo porque tiene herramientas asociadas",
        data: { totalHerramientas: herramientas[0].total },
      });
    }

    const [result] = await db.query("DELETE FROM modelos WHERE id_modelo = ?", [
      idModelo,
    ]);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Modelo no encontrado" });
    }

    res
      .status(200)
      .json({ success: true, message: "Modelo eliminado correctamente" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error al eliminar modelo" });
  }
});

module.exports = router;
