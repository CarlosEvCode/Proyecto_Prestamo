// Módulo de Trabajadores - Estructura base
const Trabajadores = {
    init: async () => {
        console.log("Módulo Trabajadores inicializado");
        await Trabajadores.render();
    },

    render: async () => {
        const container = document.getElementById('pageContainer');
        container.innerHTML = `
            <div class="container-fluid">
                <h2>Gestión de Trabajadores</h2>
                <p>Módulo listo para ser implementado.</p>
            </div>
        `;
    }
};

// Exportar para el router
window.Trabajadores = Trabajadores;
