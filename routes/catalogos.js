const express = require("express");
const router = express.Router();
const db = require("../config/db");

/* Get marcas =  obtenr todas las marcas */
router.get("/marcas", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM marcas ORDER BY nombre ASC");
    res.status(200).json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error al obtner marcas" });
  }
});

/* Get marcas por id  */
router.get("/marcas/:id", async (req, res) => {
  try {
    const idBuscado = req.params.id;
    const [rows] = await db.query("SELECT * FROM marcas WHERE id_marca = ?", [
      idBuscado,
    ]);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Marca no encontrada" });
    }
    res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error al obtener la marca" });
  }
});

/* POST marcas = crear marca */
router.post("/marcas", async (req, res) => {
  try {
    const { nombre } = req.body;

    if (!nombre || nombre.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "El nombre de la marca es obligatorio",
      });
    }

    const [result] = await db.query("INSERT INTO marcas (nombre) VALUES (?)", [
      nombre.trim(),
    ]);

    res.status(201).json({
      success: true,
      message: "Marca creada correctamente",
      data: { id_marca: result.insertId, nombre },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al crear la marca",
    });
  }
});

/* Put marcas = actualizar marca */
router.put("/marcas/:id", async (req, res) => {
  try {
    const idMarca = req.params.id;
    const { nombre } = req.body;
    if (!nombre || nombre.trim() === "") {
      return res
        .status(400)
        .json({ success: false, message: "El nombre es obligatorio" });
    }

    const [result] = await db.query(
      "UPDATE marcas SET nombre = ? WHERE id_marca = ?",
      [nombre, idMarca],
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Marca no encontrada" });
    }

    res.status(200).json({
      success: true,
      message: "Marca actualizada correctamente",
      data: { id_marca: idMarca, nombre },
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error al actualizar la marca" });
  }
});

/* DELETE marcas = eliminar marcas */
router.delete("/marcas/:id", async (req, res) => {
  try {
    const idMarca = req.params.id;

    const [modelos] = await db.query(
      "SELECT COUNT(*) AS total FROM modelos WHERE id_marca = ?",
      [idMarca],
    );

    if (modelos[0].total > 0) {
      return res.status(409).json({
        success: false,
        message: "No se puede eliminar la marca porque tiene modelos asociados",
        data: { totalModelos: modelos[0].total },
      });
    }

    const [result] = await db.query("DELETE FROM marcas WHERE id_marca = ?", [
      idMarca,
    ]);
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Marca no encontrada" });
    }
    res
      .status(200)
      .json({ success: true, message: "Marca eliminada correctamente" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error al eliminar la marca" });
  }
});

/* Get modelos  = para traer las marcas y categorias */
router.get("/modelos", async (req, res) => {
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
router.get("/modelos/:id", async (req, res) => {
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
router.post("/modelos", async (req, res) => {
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
router.put("/modelos/:id", async (req, res) => {
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
router.delete("/modelos/:id", async (req, res) => {
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

/* Get categorias = obtener todas las categorias */
router.get("/categorias", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM categorias ORDER BY nombre ASC");
    res.status(200).json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error al obtener categorías" });
  }
});

/* Get categorias por id */
router.get("/categorias/:id", async (req, res) => {
  try {
    const idBuscado = req.params.id;
    const [rows] = await db.query("SELECT * FROM categorias WHERE id_categoria = ?", [
      idBuscado,
    ]);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Categoría no encontrada" });
    }
    res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error al obtener la categoría" });
  }
});

/* --- ÁREAS --- */
router.get("/areas", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM areas ORDER BY nombre ASC");
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al obtener áreas" });
  }
});

router.get("/areas/:id", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM areas WHERE id_area = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: "Área no encontrada" });
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al obtener área" });
  }
});

router.post("/areas", async (req, res) => {
  try {
    const { nombre } = req.body;
    const [result] = await db.query("INSERT INTO areas (nombre) VALUES (?)", [nombre]);
    res.status(201).json({ success: true, message: "Área creada", data: { id_area: result.insertId, nombre } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al crear área" });
  }
});

module.exports = router;
