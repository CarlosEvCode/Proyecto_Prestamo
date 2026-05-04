const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const db = require('../config/db');

// Reporte de Herramientas
router.get('/herramientas', async (req, res) => {
    try {
        const { condicion, estado } = req.query;
        let sql = `
            SELECT 
                h.codigo, 
                h.numero_serie, 
                m.nombre AS modelo, 
                ma.nombre AS marca,
                c.nombre AS categoria,
                h.condicion, 
                h.ubicacion,
                h.activo
            FROM herramientas h
            INNER JOIN modelos m ON h.id_modelo = m.id_modelo
            INNER JOIN marcas ma ON m.id_marca = ma.id_marca
            INNER JOIN categorias c ON m.id_categoria = c.id_categoria
            WHERE 1=1
        `;

        const params = [];
        if (condicion) {
            sql += " AND h.condicion = ?";
            params.push(condicion);
        }
        if (estado) {
            sql += " AND h.activo = ?";
            params.push(estado === 'activo' ? 1 : 0);
        }

        const [herramientas] = await db.query(sql, params);

        // Paso 1: Headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename=reporte_herramientas.pdf');

        // Paso 2: PDF Setup
        const doc = new PDFDocument();
        doc.pipe(res);

        // Paso 3: Contenido
        doc.fontSize(20).text('Reporte General de Herramientas', { align: 'center' });
        doc.moveDown();
        
        // Mostrar filtros aplicados si existen
        let subtitulo = "Filtros: Ninguno";
        if (condicion || estado) {
            subtitulo = "Filtros: " + 
                (condicion ? `Condición: ${condicion.toUpperCase()} ` : "") + 
                (estado ? `Estado: ${estado.toUpperCase()}` : "");
        }
        doc.fontSize(10).text(subtitulo, { align: 'left' });
        doc.text(`Generado el: ${new Date().toLocaleString()}`, { align: 'right' });
        doc.moveDown();

        // Tabla
        const tableData = [
            ['CÓDIGO', 'MODELO', 'MARCA', 'CATEGORÍA', 'CONDICIÓN', 'UBICACIÓN', 'ESTADO'],
            ...herramientas.map(h => [
                h.codigo,
                h.modelo,
                h.marca,
                h.categoria,
                h.condicion.toUpperCase(),
                h.ubicacion || '—',
                h.activo ? 'ACTIVO' : 'INACTIVO'
            ])
        ];

        // Configuración de tabla
        doc.table({
            data: tableData,
        });

        doc.moveDown();
        doc.fontSize(12).text(`Total de herramientas encontradas: ${herramientas.length}`, { align: 'left' });

        // Paso 4: Fin
        doc.end();

    } catch (error) {
        console.error('Error al generar reporte:', error);
        res.status(500).json({ success: false, message: 'Error al generar el reporte' });
    }
});

module.exports = router;
