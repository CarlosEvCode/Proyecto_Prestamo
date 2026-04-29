const Trabajadores = {
    init: async () => {
        await Trabajadores.fetchData();
    },

    fetchData: async () => {
        try {
            const response = await fetch('/api/trabajadores');
            const result = await response.json();

            if (result.success) {
                Trabajadores.render(result.data);
            }
        } catch (error) {
            console.error("Error al obtener trabajadores:", error);
        }
    },

    render: (data) => {
        const tbody = document.getElementById('tabla-trabajadores');
        
        if (data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center py-5 text-muted">No hay trabajadores registrados.</td></tr>`;
            return;
        }

        tbody.innerHTML = data.map(t => `
            <tr>
                <td class="ps-4">
                    <div class="fw-600" style="color: var(--accent);">${t.dni}</div>
                </td>
                <td>
                    <div class="fw-bold text-white">${t.nombre_completo}</div>
                </td>
                <td class="text-muted text-sm">${t.cargo || '—'}</td>
                <td>
                    <span class="px-2 py-1 rounded text-xs bg-dark text-muted fw-600" style="border: 1px solid var(--border-color);">
                        ${t.area_nombre || 'Sin Área'}
                    </span>
                </td>
                <td class="text-muted text-sm">${t.turno || '—'}</td>
                <td class="pe-4 text-end">
                    <div class="d-flex justify-content-end gap-2">
                        <button class="btn btn-sm btn-dark"><i class="bi bi-pencil"></i></button>
                        <button class="btn btn-sm btn-dark"><i class="bi bi-trash text-danger"></i></button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
};

window.Trabajadores = Trabajadores;
