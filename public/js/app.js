'use strict';

// Estado global de la aplicación (opcional por ahora)
const AppState = {
    user: 'Admin',
    version: '1.0'
};

document.addEventListener('DOMContentLoaded', () => {
    console.log("App iniciada");
    
    // Inicializar navegación
    Router.init();
    
    // Cargar página inicial
    Router.navigateTo('dashboard');
});
