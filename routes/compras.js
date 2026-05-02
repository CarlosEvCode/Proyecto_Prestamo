const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Listar historial de compras
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT c.*, p.nombre as proveedor_nombre, 
             (SELECT COUNT(*) FROM detalle_compra dc WHERE dc.id_compra = c.id_compra) as total_items
      FROM compras c
      LEFT JOIN proveedores p ON c.id_proveedor = p.id_proveedor
      ORDER BY c.fecha DESC
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Registrar una nueva compra (Transacción)
router.post("/", async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { id_proveedor, observaciones, items } = req.body;
    const id_usuario = 1; // Admin por defecto como acordamos

    // 1. Crear la cabecera de la compra
    const [compraRes] = await connection.query(
      "INSERT INTO compras (id_proveedor, id_usuario, observaciones) VALUES (?, ?, ?)",
      [id_proveedor, id_usuario, observaciones]
    );
    const id_compra = compraRes.insertId;

    // 2. Procesar cada ítem
    for (const item of items) {
      // A. Crear la herramienta física
      const [herramientaRes] = await connection.query(
        "INSERT INTO herramientas (codigo, numero_serie, id_modelo, condicion, created_by) VALUES (?, ?, ?, 'bueno', ?)",
        [item.codigo, item.numero_serie || null, item.id_modelo, id_usuario]
      );
      const id_herramienta = herramientaRes.insertId;

      // B. Crear el detalle de la compra
      await connection.query(
        "INSERT INTO detalle_compra (id_compra, id_herramienta, precio_unitario, created_by) VALUES (?, ?, ?, ?)",
        [id_compra, id_herramienta, item.precio || 0, id_usuario]
      );
    }

    await connection.commit();
    res.status(201).json({ success: true, message: "Compra y herramientas registradas con éxito", id_compra });
  } catch (error) {
    await connection.rollback();
    console.error("Error en transacción de compra:", error);
    res.status(500).json({ success: false, message: "Error al procesar la compra: " + error.message });
  } finally {
    connection.release();
  }
});

module.exports = router;
