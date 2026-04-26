const express = require("express");
const router = express.Router();
const db = require("../config/db");

// GET /api/trabajadores => Obtener todos los trabajadores
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT t.*, a.nombre as nombre_area FROM trabajadores t LEFT JOIN areas a ON t.id_area = a.id_area ORDER BY t.nombre_completo ASC"
    );
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error al obtener los trabajadores" });
  }
});

// GET /api/trabajadores/:id => Obtener trabajador por ID
router.get("/:id", async (req, res) => {
  try {
    const idTrabajador = req.params.id;
    const [rows] = await db.query(
      "SELECT t.*, a.nombre as nombre_area FROM trabajadores t LEFT JOIN areas a ON t.id_area = a.id_area WHERE t.id_trabajador = ?",
      [idTrabajador]
    );
    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Trabajador no encontrado" });
    }
    res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error al obtener el trabajador" });
  }
});

// POST /api/trabajadores => Crear nuevo trabajador
router.post("/", async (req, res) => {
  try {
    const { dni, nombre_completo, cargo, turno, id_area, created_by } = req.body;

    // Validaciones
    if (!dni || dni.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "El DNI es obligatorio",
      });
    }

    if (!nombre_completo || nombre_completo.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "El nombre completo es obligatorio",
      });
    }

    // Verificar que el DNI sea único
    const [dniCheck] = await db.query(
      "SELECT * FROM trabajadores WHERE dni = ?",
      [dni]
    );
    if (dniCheck.length > 0) {
      return res.status(400).json({
        success: false,
        message: "El DNI ya está registrado",
      });
    }

    // Insertar en la base de datos
    const [result] = await db.query(
      "INSERT INTO trabajadores (dni, nombre_completo, cargo, turno, id_area, created_by, updated_by) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [dni, nombre_completo, cargo, turno, id_area, created_by, created_by]
    );

    res.status(201).json({
      success: true,
      message: "Trabajador creado correctamente",
      data: {
        id_trabajador: result.insertId,
        dni,
        nombre_completo,
        cargo,
        turno,
        id_area,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error al crear el trabajador" });
  }
});

// PUT /api/trabajadores/:id => Actualizar trabajador
router.put("/:id", async (req, res) => {
  try {
    const idTrabajador = req.params.id;
    const { dni, nombre_completo, cargo, turno, id_area, updated_by } = req.body;

    // Validaciones
    if (!nombre_completo || nombre_completo.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "El nombre completo es obligatorio",
      });
    }

    // Verificar que el DNI sea único (excepto el del trabajador actual)
    if (dni) {
      const [dniCheck] = await db.query(
        "SELECT * FROM trabajadores WHERE dni = ? AND id_trabajador != ?",
        [dni, idTrabajador]
      );
      if (dniCheck.length > 0) {
        return res.status(400).json({
          success: false,
          message: "El DNI ya está registrado",
        });
      }
    }

    // Verificar que el trabajador existe
    const [trabajadorCheck] = await db.query(
      "SELECT * FROM trabajadores WHERE id_trabajador = ?",
      [idTrabajador]
    );
    if (trabajadorCheck.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Trabajador no encontrado" });
    }

    // Actualizar en la base de datos
    const [result] = await db.query(
      "UPDATE trabajadores SET dni = ?, nombre_completo = ?, cargo = ?, turno = ?, id_area = ?, updated_by = ? WHERE id_trabajador = ?",
      [dni, nombre_completo, cargo, turno, id_area, updated_by, idTrabajador]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Trabajador no encontrado" });
    }

    res.status(200).json({
      success: true,
      message: "Trabajador actualizado correctamente",
      data: {
        id_trabajador: idTrabajador,
        dni,
        nombre_completo,
        cargo,
        turno,
        id_area,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error al actualizar el trabajador" });
  }
});

// DELETE /api/trabajadores/:id => Eliminar trabajador
router.delete("/:id", async (req, res) => {
  try {
    const idTrabajador = req.params.id;

    // Verificar que el trabajador existe
    const [trabajadorCheck] = await db.query(
      "SELECT * FROM trabajadores WHERE id_trabajador = ?",
      [idTrabajador]
    );
    if (trabajadorCheck.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Trabajador no encontrado" });
    }

    const [result] = await db.query(
      "DELETE FROM trabajadores WHERE id_trabajador = ?",
      [idTrabajador]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Trabajador no encontrado" });
    }

    res
      .status(200)
      .json({ success: true, message: "Trabajador eliminado correctamente" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error al eliminar el trabajador" });
  }
});

module.exports = router;
