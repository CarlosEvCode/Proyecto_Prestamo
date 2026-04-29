const Dashboard = {
    init: async () => {
        // Cargar primero el HTML (el router lo hace, pero aquí aseguramos elementos)
        await Dashboard.loadStats();
    },

    loadStats: async () => {
        try {
            const response = await fetch('/api/dashboard/stats');
            const result = await response.json();

            if (result.success) {
                const { totalHerramientas, totalTrabajadores, prestamosActivos } = result.data;
                
                // Actualizar contadores en la vista
                document.getElementById('stat-herramientas').innerText = totalHerramientas;
                document.getElementById('stat-trabajadores').innerText = totalTrabajadores;
                document.getElementById('stat-prestamos').innerText = prestamosActivos;
            }
        } catch (error) {
            console.error("Error cargando estadísticas:", error);
        }
    }
};

window.Dashboard = Dashboard;
