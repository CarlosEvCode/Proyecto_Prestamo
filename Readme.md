# Sistema de Gestión de Herramientas y Préstamos (StockPro)

## Descripción General
StockPro es una aplicación web integral diseñada para el control, administración y seguimiento de herramientas industriales, personal operativo y flujo de préstamos. La plataforma permite centralizar la gestión de inventarios, automatizar el registro de entradas y salidas de equipos, y generar reportes analíticos en formato PDF para la toma de decisiones.

## Arquitectura del Sistema

### Single Page Application (SPA)
La aplicación emplea una arquitectura de página única (SPA) en el frontend, lo que garantiza una experiencia de usuario fluida sin recargas de página.
- **Router Personalizado:** Implementado en `public/js/router.js`, gestiona la navegación y carga dinámica de vistas HTML y sus respectivos módulos lógicos.
- **Módulos Independientes:** Ubicados en `public/js/modules/`, cada sección del sistema cuenta con un controlador encapsulado que maneja la interacción con el DOM y las peticiones a la API.
- **Estado Global:** Gestionado a través de un objeto central en `public/js/app.js` para mantener la consistencia de datos entre vistas.

### Backend y API REST
El servidor está construido con Node.js y Express, siguiendo un patrón de diseño modular para las rutas y controladores.
- **Servidor Central:** `server.js` actúa como punto de entrada, configurando middlewares (CORS, JSON, estáticos) y registrando los puntos de enlace (endpoints) de la API.
- **Capa de Rutas:** Ubicada en `routes/`, define las operaciones CRUD para cada entidad del sistema.
- **Seguridad:** Implementación de autenticación basada en JSON Web Tokens (JWT) y encriptación de credenciales mediante BcryptJS.

## Tecnologías Utilizadas

### Backend
- **Runtime:** Node.js
- **Framework:** Express v5.2.1
- **Base de Datos:** MySQL
- **Autenticación:** JSON Web Token (JWT)
- **Seguridad:** BcryptJS
- **Generación de Reportes:** PDFKit v0.18.0

### Frontend
- **Lenguaje:** JavaScript (ES6+)
- **Estilos:** Bootstrap 5.3.2 / CSS3 Custom Properties
- **Gráficos:** Chart.js
- **Iconografía:** Bootstrap Icons
- **Animaciones:** Animate.css

## Estructura del Proyecto

```text
├── config/             # Configuración de conexión a base de datos
├── public/             # Archivos estáticos y lógica frontend
│   ├── css/            # Hojas de estilo personalizadas
│   ├── js/             
│   │   ├── modules/    # Lógica específica por cada vista (JS)
│   │   ├── app.js      # Inicialización y estado global
│   │   ├── router.js   # Motor de navegación SPA
│   │   └── utils.js    # Funciones auxiliares y manejo de peticiones HTTP
│   └── views/          # Plantillas HTML cargadas dinámicamente
├── routes/             # Endpoints de la API RESTful
├── SQL/                # Scripts de creación y datos de la base de datos
├── .env.example        # Plantilla de variables de entorno
└── server.js           # Punto de entrada de la aplicación
```

## Módulos y Funcionalidades

### 1. Dashboard
Visualización de indicadores clave, estadísticas generales del inventario y estado actual de los préstamos mediante gráficos interactivos.

### 2. Análisis de Datos (Gráficos)
Representación visual de métricas críticas como tendencias de préstamos, distribución de herramientas por categoría y rendimiento de inventario utilizando Chart.js.

### 3. Gestión de Herramientas
Administración del inventario físico, incluyendo código de barras/serie, modelo, marca, categoría y condición física. Incluye generación de reportes PDF filtrables.

### 4. Préstamos y Devoluciones
Flujo completo de asignación de herramientas a trabajadores, control de fechas de retorno esperado y registro de devoluciones con actualización de condición del equipo.

### 5. Personal (Trabajadores)
Registro y administración de operarios con asignación de áreas y cargos específicos.

### 6. Compras y Proveedores
Seguimiento de adquisiciones de nuevos equipos y gestión del catálogo de proveedores asociados.

### 7. Catálogos
Mantenimiento de tablas maestras como marcas, categorías, modelos y áreas.

## Credenciales de Acceso (Prueba)
Para ingresar al sistema con los datos de prueba iniciales:
- **Usuario:** `admin`
- **Contraseña:** `admin123`

## Configuración de Base de Datos

Los archivos de base de datos se encuentran en la carpeta `/SQL`:
- **SQL.sql:** Esquema de tablas, relaciones y restricciones.
- **datos_prueba.sql:** Población inicial de datos, incluyendo el usuario administrador mencionado arriba.

### Procedimiento de Implementación
1. Contar con un servidor local de bases de datos (XAMPP, MariaDB o MySQL Server).
2. Crear una base de datos denominada `gestion_herramientas`.
3. Ejecutar secuencialmente los scripts:
   - Primero `SQL.sql` para definir la estructura.
   - Segundo `datos_prueba.sql` para cargar la información inicial.
4. Asegurar que las credenciales de conexión en el archivo `.env` coincidan con su configuración local.

## Instalación y Despliegue

### Requisitos Previos
- Node.js (v16 o superior)
- MySQL Server

### Pasos de Instalación
1. Clonar el repositorio.
2. Instalar las dependencias del proyecto:
   ```bash
   npm install
   ```
3. Configurar las variables de entorno:
   - Copiar el archivo `.env.example` a `.env`.
   - Definir las credenciales de acceso a MySQL.
4. Ejecutar la aplicación en modo desarrollo:
   ```bash
   npm run dev
   ```
   *(Nota: Requiere nodemon instalado o configurado en scripts)* o alternativamente:
   ```bash
   node server.js
   ```

El servidor estará disponible por defecto en `http://localhost:3000`.
