const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/stats", async (req, res) => {
  try {
    const [herramientas] = await db.query("SELECT COUNT(*) as total FROM herramientas");
    const [trabajadores] = await db.query("SELECT COUNT(*) as total FROM trabajadores");
    const [prestamos] = await db.query("SELECT COUNT(*) as total FROM prestamos WHERE estado = 'activo'");

    res.json({
      success: true,
      data: {
        totalHerramientas: herramientas[0].total,
        totalTrabajadores: trabajadores[0].total,
        prestamosActivos: prestamos[0].total
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
