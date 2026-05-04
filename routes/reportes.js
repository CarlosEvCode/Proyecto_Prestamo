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

// Reporte de Préstamos
router.get('/prestamos', async (req, res) => {
    try {
        const { estado } = req.query;
        let sql = `
            SELECT 
                p.id_prestamo,
                t.nombre_completo AS trabajador,
                h.codigo AS herramienta_codigo,
                m.nombre AS modelo,
                p.fecha_salida,
                p.fecha_devolucion_esperada,
                p.fecha_devolucion_real,
                p.estado,
                p.motivo
            FROM prestamos p
            INNER JOIN trabajadores t ON p.id_trabajador = t.id_trabajador
            INNER JOIN herramientas h ON p.id_herramienta = h.id_herramienta
            INNER JOIN modelos m ON h.id_modelo = m.id_modelo
            WHERE 1=1
        `;

        const params = [];
        if (estado) {
            sql += " AND p.estado = ?";
            params.push(estado);
        }

        const [prestamos] = await db.query(sql, params);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename=reporte_prestamos.pdf');

        const doc = new PDFDocument({ margin: 40, size: 'A4' });
        doc.pipe(res);

        doc.fontSize(20).text('Reporte de Préstamos de Herramientas', { align: 'center' });
        doc.moveDown();
        
        const subtitulo = estado ? `Filtro: ESTADO ${estado.toUpperCase()}` : "Filtros: Ninguno";
        doc.fontSize(10).text(subtitulo, { align: 'left' });
        doc.text(`Generado el: ${new Date().toLocaleString()}`, { align: 'right' });
        doc.moveDown();

        const tableData = [
            ['TRABAJADOR', 'HERRAMIENTA', 'F. SALIDA', 'F. ESPERADA', 'F. REAL', 'ESTADO'],
            ...prestamos.map(p => [
                p.trabajador,
                `${p.herramienta_codigo}\n(${p.modelo})`,
                new Date(p.fecha_salida).toLocaleDateString('es-PE'),
                p.fecha_devolucion_esperada ? new Date(p.fecha_devolucion_esperada).toLocaleDateString('es-PE') : '—',
                p.fecha_devolucion_real ? new Date(p.fecha_devolucion_real).toLocaleDateString('es-PE') : '—',
                p.estado.toUpperCase()
            ])
        ];

        doc.table({
            data: tableData,
            columnStyles: [110, 100, 70, 70, 70, 60]
        }, {
            padding: 5,
            prepareHeader: () => doc.font('Helvetica-Bold').fontSize(8).fillColor('#2c3e50'),
            prepareRow: () => doc.font('Helvetica').fontSize(8).fillColor('#333333')
        });

        doc.moveDown();
        doc.fontSize(12).text(`Total de registros: ${prestamos.length}`, { align: 'left' });
        doc.end();

    } catch (error) {
        console.error('Error al generar reporte de préstamos:', error);
        res.status(500).json({ success: false, message: 'Error al generar el reporte' });
    }
});

module.exports = router;
