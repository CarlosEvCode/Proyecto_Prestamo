const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

// 1. OBTENER USUARIOS (El GET Seguro)
router.get("/", async (req, res) => {
  try {
    // REGLA DE ORO: ¡NUNCA selecciones la columna 'password' en un GET!
    // Hacemos un JOIN para traer el nombre del rol en lugar de solo su ID
    const query = `
      SELECT u.id_usuario, u.username, u.nombre_completo, u.activo, r.nombre as rol 
      FROM usuarios u
      LEFT JOIN roles r ON u.id_rol = r.id_rol
      ORDER BY u.nombre_completo ASC
    `;
    const [rows] = await db.query(query);
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error al obtener usuarios" });
  }
});

// 2. CREAR USUARIO (El POST con Encriptación)

router.post("/", async (req, res) => {
  try {
    const { username, password, nombre_completo, id_rol, created_by } =
      req.body;

    if (!username || !password || !nombre_completo || !id_rol) {
      return res
        .status(400)
        .json({ success: false, message: "Faltan datos obligatorios" });
    }

    // A. Verificar si el username ya existe
    const [userCheck] = await db.query(
      "SELECT * FROM usuarios WHERE username = ?",
      [username],
    );
    if (userCheck.length > 0) {
      return res.status(400).json({
        success: false,
        message: "El nombre de usuario ya está en uso",
      });
    }

    // B. Encriptar la contraseña (El toque mágico)
    const salt = await bcrypt.genSalt(10); // Genera una cadena aleatoria
    const hashedPassword = await bcrypt.hash(password, salt); // Mezcla la clave con la cadena

    // C. Guardar en la base de datos (Insertamos la contraseña encriptada, NO la original)
    const [result] = await db.query(
      "INSERT INTO usuarios (username, password, nombre_completo, id_rol, created_by, updated_by) VALUES (?, ?, ?, ?, ?, ?)",
      [
        username,
        hashedPassword,
        nombre_completo,
        id_rol,
        created_by,
        created_by,
      ],
    );

    res.status(201).json({
      success: true,
      message: "Usuario creado exitosamente",
      data: { id_usuario: result.insertId, username, nombre_completo },
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error al crear el usuario" });
  }
});

// 3. LOGIN (La ruta de Autenticación)

//  Esta ruta suele llamarse POST /login o POST /auth/login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // A. Buscar al usuario en la base de datos
    const [users] = await db.query(
      "SELECT * FROM usuarios WHERE username = ?",
      [username],
    );

    // Si no existe o está desactivado, rechazamos
    if (users.length === 0 || !users[0].activo) {
      return res.status(401).json({
        success: false,
        message: "Usuario incorrecto o cuenta desactivada",
      });
    }

    const usuarioDB = users[0];

    // B. Comparar la contraseña (bcrypt verifica si "123456" coincide con el hash guardado)
    const validPassword = await bcrypt.compare(password, usuarioDB.password);
    if (!validPassword) {
      return res
        .status(401)
        .json({ success: false, message: "Contraseña incorrecta" });
    }

    // C. Si todo es correcto, creamos el Token (Pase VIP)
    //  'secreto_super_seguro' debería estar en tu archivo .env
    const token = jwt.sign(
      { id_usuario: usuarioDB.id_usuario, rol: usuarioDB.id_rol },
      "secreto_super_seguro",
      { expiresIn: "8h" }, // El token dura 8 horas
    );

    // D. Respondemos con el éxito y el token
    res.status(200).json({
      success: true,
      message: "Login exitoso",
      token: token,
      usuario: {
        id_usuario: usuarioDB.id_usuario,
        nombre_completo: usuarioDB.nombre_completo,
        id_rol: usuarioDB.id_rol,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error en el servidor durante el login",
    });
  }
});


// 5. ACTUALIZAR USUARIO (El PUT)
router.put("/:id", async (req, res) => {
  try {
    const idUsuario = req.params.id;
    // OJO: Por seguridad, la contraseña no se suele actualizar en esta misma ruta,
    // se suele hacer una ruta aparte llamada "Cambiar Contraseña".
    const { username, nombre_completo, id_rol, updated_by } = req.body;

    if (!username || !nombre_completo || !id_rol) {
      return res
        .status(400)
        .json({ success: false, message: "Faltan datos obligatorios" });
    }

    // Verificar si el nuevo username ya lo está usando OTRA persona
    const [userCheck] = await db.query(
      "SELECT * FROM usuarios WHERE username = ? AND id_usuario != ?",
      [username, idUsuario],
    );

    if (userCheck.length > 0) {
      return res.status(400).json({
        success: false,
        message: "El nombre de usuario ya está ocupado",
      });
    }

    // Actualizar los datos generales
    const [result] = await db.query(
      "UPDATE usuarios SET username = ?, nombre_completo = ?, id_rol = ?, updated_by = ? WHERE id_usuario = ?",
      [username, nombre_completo, id_rol, updated_by, idUsuario],
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Usuario no encontrado" });
    }

    res.status(200).json({
      success: true,
      message: "Usuario actualizado correctamente",
      data: { id_usuario: idUsuario, username, nombre_completo, id_rol },
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error al actualizar el usuario" });
  }
});

// 6. REACTIVAR USUARIO (Revertir el Soft Delete)
router.put("/:id/activar", async (req, res) => {
  try {
    const idUsuario = req.params.id;

    // Hacemos exactamente lo opuesto al DELETE: seteamos activo = TRUE
    const [result] = await db.query(
      "UPDATE usuarios SET activo = TRUE WHERE id_usuario = ?", 
      [idUsuario]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }

    res.status(200).json({ success: true, message: "Usuario reactivado y listo para ingresar" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al reactivar al usuario" });
  }
});

// 4. ELIMINAR USUARIO (Baja Lógica / Soft Delete)
router.delete("/:id", async (req, res) => {
  try {
    const idUsuario = req.params.id;

    // En lugar de usar "DELETE FROM", usamos "UPDATE" para cambiar activo a FALSE
    // Esto se llama "Soft Delete". Si lo borramos físicamente, los préstamos que hizo
    // darían error porque su ID ya no existiría.
    const [result] = await db.query(
      "UPDATE usuarios SET activo = FALSE WHERE id_usuario = ?",
      [idUsuario],
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Usuario no encontrado" });
    }

    res
      .status(200)
      .json({ success: true, message: "Usuario desactivado correctamente" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error al desactivar al usuario" });
  }
});

module.exports = router;
