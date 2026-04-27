const express = require("express");
const router = express.Router();
const db = require("../config/db");

/* Get herramientas = obtener todas las herramientas */
router.get("/", async (req, res) => {
  try {
    const query = `
      SELECT h.id_herramienta, h.codigo, h.numero_serie,
             m.nombre as modelo, m.id_modelo,
             ma.nombre as marca, m.id_marca,
             h.condicion, h.ubicacion, h.activo,
             h.created_at, h.updated_at
      FROM herramientas h
      LEFT JOIN modelos m ON h.id_modelo = m.id_modelo
      LEFT JOIN marcas ma ON m.id_marca = ma.id_marca
      ORDER BY h.codigo ASC
    `;
    const [rows] = await db.query(query);
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Error al obtener herramientas" });
  }
});

/* Get herramienta por id */
router.get("/:id", async (req, res) => {
  try {
    const idHerramienta = req.params.id;
    const query = `
      SELECT h.id_herramienta, h.codigo, h.numero_serie,
             m.nombre as modelo, m.id_modelo,
             ma.nombre as marca, m.id_marca,
             h.condicion, h.ubicacion, h.activo,
             h.created_at, h.updated_at
      FROM herramientas h
      LEFT JOIN modelos m ON h.id_modelo = m.id_modelo
      LEFT JOIN marcas ma ON m.id_marca = ma.id_marca
      WHERE h.id_herramienta = ?
    `;
    const [rows] = await db.query(query, [idHerramienta]);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Herramienta no encontrada" });
    }

    res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Error al obtener la herramienta" });
  }
});

/* POST herramientas = crear nueva herramienta */
router.post("/", async (req, res) => {
  try {
    const { codigo, numero_serie, id_modelo, condicion, ubicacion, activo } =
      req.body;

    if (!codigo || codigo.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "El código de la herramienta es obligatorio",
      });
    }

    if (!id_modelo) {
      return res.status(400).json({
        success: false,
        message: "El modelo es obligatorio",
      });
    }

    const [result] = await db.query(
      "INSERT INTO herramientas (codigo, numero_serie, id_modelo, condicion, ubicacion, activo) VALUES (?, ?, ?, ?, ?, ?)",
      [codigo.trim(), numero_serie || null, id_modelo, condicion || "bueno", ubicacion || null, activo !== false ? 1 : 0],
    );

    res.status(201).json({
      success: true,
      message: "Herramienta creada correctamente",
      data: {
        id_herramienta: result.insertId,
        codigo,
        numero_serie,
        id_modelo,
        condicion: condicion || "bueno",
        ubicacion,
        activo: activo !== false ? 1 : 0,
      },
    });
  } catch (error) {
    console.error(error);
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "El código de herramienta ya existe",
      });
    }
    res
      .status(500)
      .json({ success: false, message: "Error al crear la herramienta" });
  }
});

/* PUT herramientas = actualizar herramienta */
router.put("/:id", async (req, res) => {
  try {
    const idHerramienta = req.params.id;
    const { codigo, numero_serie, id_modelo, condicion, ubicacion, activo } =
      req.body;

    if (!codigo || codigo.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "El código de la herramienta es obligatorio",
      });
    }

    if (!id_modelo) {
      return res.status(400).json({
        success: false,
        message: "El modelo es obligatorio",
      });
    }

    const [result] = await db.query(
      "UPDATE herramientas SET codigo = ?, numero_serie = ?, id_modelo = ?, condicion = ?, ubicacion = ?, activo = ? WHERE id_herramienta = ?",
      [codigo.trim(), numero_serie || null, id_modelo, condicion || "bueno", ubicacion || null, activo !== false ? 1 : 0, idHerramienta],
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Herramienta no encontrada" });
    }

    res.status(200).json({
      success: true,
      message: "Herramienta actualizada correctamente",
      data: {
        id_herramienta: idHerramienta,
        codigo,
        numero_serie,
        id_modelo,
        condicion: condicion || "bueno",
        ubicacion,
        activo: activo !== false ? 1 : 0,
      },
    });
  } catch (error) {
    console.error(error);
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "El código de herramienta ya existe",
      });
    }
    res
      .status(500)
      .json({ success: false, message: "Error al actualizar la herramienta" });
  }
});

/* DELETE herramientas = eliminar herramienta */
router.delete("/:id", async (req, res) => {
  try {
    const idHerramienta = req.params.id;

    // Verificar si hay préstamos activos de esta herramienta
    const [prestamos] = await db.query(
      "SELECT COUNT(*) AS total FROM detalle_prestamo WHERE id_herramienta = ? AND id_prestamo IN (SELECT id_prestamo FROM prestamos WHERE estado = 'activo')",
      [idHerramienta],
    );

    if (prestamos[0].total > 0) {
      return res.status(409).json({
        success: false,
        message:
          "No se puede eliminar la herramienta porque tiene préstamos activos",
        data: { totalPrestamosActivos: prestamos[0].total },
      });
    }

    const [result] = await db.query(
      "DELETE FROM herramientas WHERE id_herramienta = ?",
      [idHerramienta],
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Herramienta no encontrada" });
    }

    res
      .status(200)
      .json({ success: true, message: "Herramienta eliminada correctamente" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Error al eliminar la herramienta" });
  }
});

module.exports = router;
