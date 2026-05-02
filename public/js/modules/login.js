document.addEventListener('DOMContentLoaded', () => {
    const formLogin = document.getElementById('form-login');
    const mensajeError = document.getElementById('mensaje-error');

    formLogin.addEventListener('submit', async (e) => {
        e.preventDefault(); // Evitamos que la página se recargue

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Ocultamos el mensaje de error por si estaba visible de un intento anterior
        mensajeError.style.display = 'none';

        try {
            // Hacemos la petición POST a tu backend
            const response = await fetch('/api/usuarios/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (data.success) {
                // ¡BINGO! Guardamos la "Pulsera VIP" en la memoria del navegador
                localStorage.setItem('token', data.token);
                // Guardamos también el nombre para mostrarlo arriba a la derecha ("Hola, Admin")
                localStorage.setItem('usuarioNombre', data.usuario.nombre_completo);
                
                // Lo mandamos volando al dashboard
                window.location.href = '/';
            } else {
                // Si la clave está mal, mostramos el error que mandó el backend
                mensajeError.innerText = data.message;
                mensajeError.style.display = 'block';
            }
        } catch (error) {
            console.error("Error en el fetch:", error);
            mensajeError.innerText = "Error al conectar con el servidor.";
            mensajeError.style.display = 'block';
        }
    });
});

