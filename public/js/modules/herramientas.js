const Herramientas = {
    init: async () => {
        await Herramientas.fetchTools();
    },

    fetchTools: async () => {
        try {
            const response = await fetch('/api/herramientas');
            const result = await response.json();

            if (result.success) {
                Herramientas.render(result.data);
            }
        } catch (error) {
            console.error("Error al obtener herramientas:", error);
        }
    },

    render: (tools) => {
        const tbody = document.getElementById('tabla-herramientas');
        
        if (tools.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="text-center py-5 text-muted">No hay herramientas registradas.</td></tr>`;
            return;
        }

        tbody.innerHTML = tools.map(tool => {
            // Estilos para condición
            const condClass = {
                'bueno': 'bg-success-soft text-success',
                'regular': 'bg-warning-soft text-warning',
                'malo': 'bg-danger-soft text-danger'
            }[tool.condicion] || 'bg-secondary text-white';

            // Estilos para estado (activo/inactivo)
            const statusBadge = tool.activo 
                ? '<span class="badge bg-success bg-opacity-10 text-success fw-normal">Activo</span>'
                : '<span class="badge bg-danger bg-opacity-10 text-danger fw-normal">Inactivo</span>';

            return `
                <tr style="border-bottom: 1px solid var(--border-color);">
                    <td class="ps-4 fw-bold" style="color: var(--accent);">${tool.codigo}</td>
                    <td>
                        <div class="fw-bold">${tool.modelo_nombre || 'N/A'}</div>
                        <div class="text-muted text-xs">${tool.categoria_nombre || ''}</div>
                    </td>
                    <td>${tool.marca_nombre || '—'}</td>
                    <td>
                        <span class="px-2 py-1 rounded text-xs fw-600 ${condClass}">
                            ${tool.condicion.toUpperCase()}
                        </span>
                    </td>
                    <td class="text-muted">${tool.ubicacion || '—'}</td>
                    <td class="text-center">${statusBadge}</td>
                    <td class="pe-4 text-end">
                        <div class="d-flex justify-content-end gap-2">
                            <button class="btn btn-sm btn-dark" style="border: 1px solid var(--border-color);"><i class="bi bi-pencil text-muted"></i></button>
                            <button class="btn btn-sm btn-dark" style="border: 1px solid var(--border-color);"><i class="bi bi-trash text-danger"></i></button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }
};

window.Herramientas = Herramientas;
