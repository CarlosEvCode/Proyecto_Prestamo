DROP DATABASE IF EXISTS gestion_herramientas;
CREATE DATABASE gestion_herramientas;

USE gestion_herramientas;

CREATE TABLE IF NOT EXISTS marcas (
    id_marca INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS proveedores (
    id_proveedor INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    contacto VARCHAR(150)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS areas (
    id_area INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS roles (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS categorias (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS modelos (
    id_modelo INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    id_marca INT,
    id_categoria INT,
    FOREIGN KEY (id_marca) REFERENCES marcas (id_marca),
    FOREIGN KEY (id_categoria) REFERENCES categorias (id_categoria)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nombre_completo VARCHAR(150) NOT NULL,
    id_rol INT,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by INT,
    FOREIGN KEY (id_rol) REFERENCES roles (id_rol),
    FOREIGN KEY (created_by) REFERENCES usuarios (id_usuario),
    FOREIGN KEY (updated_by) REFERENCES usuarios (id_usuario)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS trabajadores (
    id_trabajador INT AUTO_INCREMENT PRIMARY KEY,
    dni VARCHAR(20) UNIQUE NOT NULL,
    nombre_completo VARCHAR(150) NOT NULL,
    cargo VARCHAR(100),
    turno VARCHAR(50),
    id_area INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by INT,
    FOREIGN KEY (id_area) REFERENCES areas (id_area),
    FOREIGN KEY (created_by) REFERENCES usuarios (id_usuario),
    FOREIGN KEY (updated_by) REFERENCES usuarios (id_usuario)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS herramientas (
    id_herramienta INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    numero_serie VARCHAR(100),
    id_modelo INT,
    condicion ENUM('bueno', 'regular', 'malo') DEFAULT 'bueno',
    ubicacion VARCHAR(100),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by INT,
    FOREIGN KEY (id_modelo) REFERENCES modelos (id_modelo),
    FOREIGN KEY (created_by) REFERENCES usuarios (id_usuario),
    FOREIGN KEY (updated_by) REFERENCES usuarios (id_usuario)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS compras (
    id_compra INT AUTO_INCREMENT PRIMARY KEY,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    id_proveedor INT,
    id_usuario INT,
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by INT,
    FOREIGN KEY (id_proveedor) REFERENCES proveedores (id_proveedor),
    FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario),
    FOREIGN KEY (created_by) REFERENCES usuarios (id_usuario),
    FOREIGN KEY (updated_by) REFERENCES usuarios (id_usuario)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS detalle_compra (
    id_detalle INT AUTO_INCREMENT PRIMARY KEY,
    id_compra INT,
    id_herramienta INT,
    precio_unitario DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by INT,
    FOREIGN KEY (id_compra) REFERENCES compras (id_compra),
    FOREIGN KEY (id_herramienta) REFERENCES herramientas (id_herramienta),
    FOREIGN KEY (created_by) REFERENCES usuarios (id_usuario),
    FOREIGN KEY (updated_by) REFERENCES usuarios (id_usuario)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS prestamos (
    id_prestamo INT AUTO_INCREMENT PRIMARY KEY,
    id_trabajador INT,
    id_herramienta INT,
    id_usuario_entrega INT,
    id_usuario_recibe INT,
    fecha_salida DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_devolucion_esperada DATETIME,
    fecha_devolucion_real DATETIME,
    motivo TEXT,
    estado ENUM(
        'activo',
        'devuelto',
        'vencido'
    ) DEFAULT 'activo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by INT,
    FOREIGN KEY (id_trabajador) REFERENCES trabajadores (id_trabajador),
    FOREIGN KEY (id_herramienta) REFERENCES herramientas (id_herramienta),
    FOREIGN KEY (id_usuario_entrega) REFERENCES usuarios (id_usuario),
    FOREIGN KEY (id_usuario_recibe) REFERENCES usuarios (id_usuario),
    FOREIGN KEY (created_by) REFERENCES usuarios (id_usuario),
    FOREIGN KEY (updated_by) REFERENCES usuarios (id_usuario)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS detalle_prestamo (
    id_detalle INT AUTO_INCREMENT PRIMARY KEY,
    id_prestamo INT,
    id_herramienta INT,
    condicion_entrega ENUM('bueno', 'regular', 'malo') NOT NULL,
    condicion_devolucion ENUM('bueno', 'regular', 'malo'),
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by INT,
    FOREIGN KEY (id_prestamo) REFERENCES prestamos (id_prestamo),
    FOREIGN KEY (id_herramienta) REFERENCES herramientas (id_herramienta),
    FOREIGN KEY (created_by) REFERENCES usuarios (id_usuario),
    FOREIGN KEY (updated_by) REFERENCES usuarios (id_usuario)
) ENGINE = InnoDB;