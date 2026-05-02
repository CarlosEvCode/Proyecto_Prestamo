-- SQL de prueba para la base de datos gestion_herramientas
-- Insertar 10 registros por tabla

USE gestion_herramientas;

-- ==================== TABLAS INDEPENDIENTES ====================

-- Tabla: marcas
INSERT INTO
    marcas (nombre)
VALUES ('Bosch'),
    ('DeWalt'),
    ('Makita'),
    ('Hilti'),
    ('Stanley'),
    ('Black+Decker'),
    ('Metabo'),
    ('Milwaukee'),
    ('Ridgid'),
    ('Festool');

-- Tabla: proveedores
INSERT INTO
    proveedores (nombre, contacto)
VALUES (
        'Ferretería Central',
        '555-0001'
    ),
    (
        'Distribuidora Industrial SA',
        '555-0002'
    ),
    (
        'Importadora de Herramientas',
        '555-0003'
    ),
    (
        'Comercial del Sur',
        '555-0004'
    ),
    (
        'Mega Herramientas SRL',
        '555-0005'
    ),
    (
        'Proveedor Directo',
        '555-0006'
    ),
    (
        'Fábrica Regional',
        '555-0007'
    ),
    (
        'Distribuidora Express',
        '555-0008'
    ),
    (
        'Mayorista Profesional',
        '555-0009'
    ),
    (
        'Proveedora Internacional',
        '555-0010'
    );

-- Tabla: areas
INSERT INTO
    areas (nombre)
VALUES ('Operación'),
    ('Mantenimiento'),
    ('Almacén'),
    ('Administración'),
    ('Seguridad'),
    ('Logística'),
    ('Calidad'),
    ('Desarrollo'),
    ('Recursos Humanos'),
    ('Finanzas');

-- Tabla: roles
INSERT INTO
    roles (nombre)
VALUES ('Administrador'),
    ('Supervisor'),
    ('Técnico'),
    ('Operario'),
    ('Almacenero'),
    ('Encargado'),
    ('Jefe de Equipo'),
    ('Inspector'),
    ('Analista'),
    ('Coordinador');

-- Tabla: categorias
INSERT INTO
    categorias (nombre)
VALUES ('Herramientas Manuales'),
    ('Herramientas Eléctricas'),
    ('Herramientas Neumáticas'),
    ('Equipos de Medición'),
    ('Equipos de Seguridad'),
    ('Herramientas de Corte'),
    ('Herramientas de Sujeción'),
    ('Herramientas de Jardinería'),
    ('Equipos Especializados'),
    ('Accesorios y Repuestos');

-- ==================== TABLAS CON RELACIONES SIMPLES ====================

-- Tabla: modelos (depende de marcas y categorias)
INSERT INTO
    modelos (nombre, id_marca, id_categoria)
VALUES ('Taladro TDH-500', 1, 2),
    ('Compresor C-1200', 2, 3),
    ('Sierra Circular SC-180', 3, 2),
    ('Martillo Neumático MN-15', 4, 3),
    ('Juego de Llaves JL-50', 5, 1),
    ('Tuerca de Impacto TI-800', 6, 3),
    ('Medidor Digital MD-100', 1, 4),
    ('Arnés de Seguridad AS-10', 2, 5),
    ('Cables de Poder CP-50', 3, 10),
    ('Destornillador de Precisión DP-25', 4, 1);

-- Tabla: usuarios (depende de roles y usuarios misma tabla para created_by, updated_by)
-- Insertamos sin las referencias a created_by y updated_by inicialmente
INSERT INTO
    usuarios (
        username,
        password,
        nombre_completo,
        id_rol,
        activo
    )
VALUES (
        'admin',
        '$2b$10$FP0mOSkP3sgM2x9m.ObMdOAM5vhbYpQ6FBsSAOQs6JDumabKgcOFu',
        'Administrador General',
        1,
        TRUE
    ),
    (
        'supervisor1',
        '$2b$10$FP0mOSkP3sgM2x9m.ObMdOAM5vhbYpQ6FBsSAOQs6JDumabKgcOFu',
        'Carlos Rodríguez',
        2,
        TRUE
    ),
    (
        'tecnico1',
        '$2b$10$FP0mOSkP3sgM2x9m.ObMdOAM5vhbYpQ6FBsSAOQs6JDumabKgcOFu',
        'Juan López',
        3,
        TRUE
    ),
    (
        'operario1',
        '$2b$10$FP0mOSkP3sgM2x9m.ObMdOAM5vhbYpQ6FBsSAOQs6JDumabKgcOFu',
        'Pedro Martínez',
        4,
        TRUE
    ),
    (
        'almacenero1',
        '$2b$10$FP0mOSkP3sgM2x9m.ObMdOAM5vhbYpQ6FBsSAOQs6JDumabKgcOFu',
        'Luis García',
        5,
        TRUE
    ),
    (
        'encargado1',
        '$2b$10$FP0mOSkP3sgM2x9m.ObMdOAM5vhbYpQ6FBsSAOQs6JDumabKgcOFu',
        'María Fernández',
        6,
        TRUE
    ),
    (
        'jefe_equipo1',
        '$2b$10$FP0mOSkP3sgM2x9m.ObMdOAM5vhbYpQ6FBsSAOQs6JDumabKgcOFu',
        'Roberto Sánchez',
        7,
        TRUE
    ),
    (
        'inspector1',
        '$2b$10$FP0mOSkP3sgM2x9m.ObMdOAM5vhbYpQ6FBsSAOQs6JDumabKgcOFu',
        'Ana Ruiz',
        8,
        TRUE
    ),
    (
        'analista1',
        '$2b$10$FP0mOSkP3sgM2x9m.ObMdOAM5vhbYpQ6FBsSAOQs6JDumabKgcOFu',
        'Gonzalo Torres',
        9,
        TRUE
    ),
    (
        'coordinador1',
        '$2b$10$FP0mOSkP3sgM2x9m.ObMdOAM5vhbYpQ6FBsSAOQs6JDumabKgcOFu',
        'Daniela Moreno',
        10,
        TRUE
    );

-- Tabla: trabajadores (depende de areas y usuarios)
INSERT INTO
    trabajadores (
        dni,
        nombre_completo,
        cargo,
        turno,
        id_area,
        created_by,
        updated_by
    )
VALUES (
        '12345678',
        'Miguel Ángel Pérez',
        'Operador',
        'Mañana',
        1,
        1,
        1
    ),
    (
        '87654321',
        'Sofía Martínez',
        'Técnico',
        'Tarde',
        2,
        1,
        1
    ),
    (
        '11223344',
        'Diego López',
        'Operador',
        'Noche',
        1,
        1,
        1
    ),
    (
        '55667788',
        'Patricia García',
        'Supervisor',
        'Mañana',
        2,
        1,
        1
    ),
    (
        '99887766',
        'Andrés Ramos',
        'Operador',
        'Tarde',
        3,
        1,
        1
    ),
    (
        '44332211',
        'Valentina Cruz',
        'Técnico',
        'Mañana',
        2,
        1,
        1
    ),
    (
        '22334455',
        'Fernando Díaz',
        'Operador',
        'Noche',
        1,
        1,
        1
    ),
    (
        '66778899',
        'Isabela Soto',
        'Encargada',
        'Mañana',
        3,
        1,
        1
    ),
    (
        '33445566',
        'Lucas Herrera',
        'Operador',
        'Tarde',
        1,
        1,
        1
    ),
    (
        '77889900',
        'Elena Vásquez',
        'Técnico',
        'Noche',
        2,
        1,
        1
    );

-- Tabla: herramientas (depende de modelos y usuarios)
INSERT INTO
    herramientas (
        codigo,
        numero_serie,
        id_modelo,
        condicion,
        ubicacion,
        activo,
        created_by,
        updated_by
    )
VALUES (
        'HER-001',
        'SN-001-2025',
        1,
        'bueno',
        'Almacén A',
        TRUE,
        1,
        1
    ),
    (
        'HER-002',
        'SN-002-2025',
        2,
        'bueno',
        'Almacén B',
        TRUE,
        1,
        1
    ),
    (
        'HER-003',
        'SN-003-2025',
        3,
        'regular',
        'Taller 1',
        TRUE,
        1,
        1
    ),
    (
        'HER-004',
        'SN-004-2025',
        4,
        'bueno',
        'Almacén A',
        TRUE,
        1,
        1
    ),
    (
        'HER-005',
        'SN-005-2025',
        5,
        'malo',
        'Mantenimiento',
        FALSE,
        1,
        1
    ),
    (
        'HER-006',
        'SN-006-2025',
        6,
        'bueno',
        'Almacén C',
        TRUE,
        1,
        1
    ),
    (
        'HER-007',
        'SN-007-2025',
        7,
        'bueno',
        'Laboratorio',
        TRUE,
        1,
        1
    ),
    (
        'HER-008',
        'SN-008-2025',
        8,
        'regular',
        'Seguridad',
        TRUE,
        1,
        1
    ),
    (
        'HER-009',
        'SN-009-2025',
        9,
        'bueno',
        'Almacén A',
        TRUE,
        1,
        1
    ),
    (
        'HER-010',
        'SN-010-2025',
        10,
        'bueno',
        'Taller 2',
        TRUE,
        1,
        1
    );

-- Tabla: compras (depende de proveedores y usuarios)
INSERT INTO
    compras (
        fecha,
        id_proveedor,
        id_usuario,
        observaciones,
        created_by,
        updated_by
    )
VALUES (
        '2025-03-15 09:30:00',
        1,
        1,
        'Compra de herramientas para taller 1',
        1,
        1
    ),
    (
        '2025-03-16 10:15:00',
        2,
        2,
        'Reabastecimiento de equipos',
        1,
        1
    ),
    (
        '2025-03-17 14:20:00',
        3,
        3,
        'Material de seguridad',
        1,
        1
    ),
    (
        '2025-03-18 11:45:00',
        4,
        4,
        'Herramientas neumáticas',
        1,
        1
    ),
    (
        '2025-03-19 08:00:00',
        5,
        5,
        'Accesorios y repuestos',
        1,
        1
    ),
    (
        '2025-03-20 15:30:00',
        6,
        6,
        'Equipos de medición',
        1,
        1
    ),
    (
        '2025-03-21 09:00:00',
        7,
        7,
        'Maquinaria pesada',
        1,
        1
    ),
    (
        '2025-03-22 13:45:00',
        8,
        8,
        'Herramientas de precisión',
        1,
        1
    ),
    (
        '2025-03-23 10:30:00',
        9,
        9,
        'Materiales de protección',
        1,
        1
    ),
    (
        '2025-03-24 16:00:00',
        10,
        10,
        'Suministros generales',
        1,
        1
    );

-- Tabla: detalle_compra (depende de compras y herramientas)
INSERT INTO
    detalle_compra (
        id_compra,
        id_herramienta,
        precio_unitario,
        created_by,
        updated_by
    )
VALUES (1, 1, 450.00, 1, 1),
    (1, 2, 1200.00, 1, 1),
    (2, 3, 380.00, 1, 1),
    (2, 4, 650.00, 1, 1),
    (3, 5, 200.00, 1, 1),
    (4, 6, 890.00, 1, 1),
    (5, 7, 320.00, 1, 1),
    (6, 8, 150.00, 1, 1),
    (7, 9, 75.00, 1, 1),
    (8, 10, 280.00, 1, 1);

-- ==================== TABLAS DE PRÉSTAMOS ====================

-- Tabla: prestamos (depende de trabajadores, herramientas y usuarios)
INSERT INTO
    prestamos (
        id_trabajador,
        id_herramienta,
        id_usuario_entrega,
        id_usuario_recibe,
        fecha_salida,
        fecha_devolucion_esperada,
        fecha_devolucion_real,
        motivo,
        estado,
        created_by,
        updated_by
    )
VALUES (
        1,
        1,
        1,
        2,
        '2025-04-01 08:00:00',
        '2025-04-02 17:00:00',
        NULL,
        'Trabajo en terreno Zona A',
        'activo',
        1,
        1
    ),
    (
        2,
        2,
        2,
        3,
        '2025-04-02 09:30:00',
        '2025-04-03 17:00:00',
        '2025-04-03 16:45:00',
        'Reparación en planta',
        'devuelto',
        1,
        1
    ),
    (
        3,
        3,
        3,
        4,
        '2025-04-03 10:00:00',
        '2025-04-04 17:00:00',
        NULL,
        'Mantenimiento preventivo',
        'activo',
        1,
        1
    ),
    (
        4,
        4,
        4,
        5,
        '2025-04-04 08:15:00',
        '2025-04-05 17:00:00',
        '2025-04-05 17:30:00',
        'Inspección de equipos',
        'devuelto',
        1,
        1
    ),
    (
        5,
        6,
        5,
        6,
        '2025-04-05 11:00:00',
        '2025-04-06 17:00:00',
        NULL,
        'Construcción temporal',
        'activo',
        1,
        1
    ),
    (
        6,
        7,
        6,
        7,
        '2025-03-28 07:45:00',
        '2025-03-29 17:00:00',
        NULL,
        'Trabajo de emergencia',
        'vencido',
        1,
        1
    ),
    (
        7,
        8,
        7,
        8,
        '2025-04-06 09:00:00',
        '2025-04-07 17:00:00',
        '2025-04-07 16:30:00',
        'Calibración de instrumentos',
        'devuelto',
        1,
        1
    ),
    (
        8,
        9,
        8,
        9,
        '2025-04-07 10:30:00',
        '2025-04-08 17:00:00',
        NULL,
        'Capacitación de seguridad',
        'activo',
        1,
        1
    ),
    (
        9,
        10,
        9,
        10,
        '2025-04-08 08:00:00',
        '2025-04-09 17:00:00',
        '2025-04-09 17:15:00',
        'Análisis de calidad',
        'devuelto',
        1,
        1
    ),
    (
        10,
        1,
        10,
        1,
        '2025-04-09 14:00:00',
        '2025-04-10 17:00:00',
        NULL,
        'Coordinación de proyectos',
        'activo',
        1,
        1
    );

-- Tabla: detalle_prestamo (depende de prestamos y herramientas)
INSERT INTO
    detalle_prestamo (
        id_prestamo,
        id_herramienta,
        condicion_entrega,
        condicion_devolucion,
        observaciones,
        created_by,
        updated_by
    )
VALUES (
        1,
        1,
        'bueno',
        NULL,
        'Herramienta en perfectas condiciones',
        1,
        1
    ),
    (
        1,
        2,
        'bueno',
        NULL,
        'Verificado antes de entrega',
        1,
        1
    ),
    (
        2,
        3,
        'regular',
        'bueno',
        'Se limpió durante el uso',
        1,
        1
    ),
    (
        2,
        4,
        'bueno',
        'bueno',
        'Sin problemas reportados',
        1,
        1
    ),
    (
        3,
        5,
        'bueno',
        NULL,
        'Requerimiento urgente',
        1,
        1
    ),
    (
        4,
        6,
        'bueno',
        'regular',
        'Pequeña abolladura sin afectar función',
        1,
        1
    ),
    (
        5,
        7,
        'bueno',
        NULL,
        'Herramienta calibrada',
        1,
        1
    ),
    (
        6,
        8,
        'regular',
        NULL,
        'Necesita mantenimiento próximamente',
        1,
        1
    ),
    (
        7,
        9,
        'bueno',
        'bueno',
        'Funcionamiento normal',
        1,
        1
    ),
    (
        8,
        10,
        'bueno',
        NULL,
        'Entregado para capacitación',
        1,
        1
    );

-- ==================== RESUMEN ====================
SELECT '✓ Datos de prueba insertados exitosamente' AS Resultado;
