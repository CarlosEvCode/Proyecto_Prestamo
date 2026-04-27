const express = require("express");
const router = express.Router();
const db = require("../config/db");

/* Get marcas =  obtener todas las marcas */
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM marcas ORDER BY nombre ASC");
    res.status(200).json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error al obtener marcas" });
  }
});

/* Get marcas por id  */
router.get("/:id", async (req, res) => {
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
router.post("/", async (req, res) => {
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
router.put("/:id", async (req, res) => {
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
router.delete("/:id", async (req, res) => {
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

module.exports = router;
