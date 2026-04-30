const Prestamos = {
    init: async () => {
        await Prestamos.fetchData();
    },

    fetchData: async () => {
        try {
            const response = await fetch('/api/prestamos');
            const result = await response.json();

            if (result.success) {
                Prestamos.render(result.data);
            }
        } catch (error) {
            console.error("Error al obtener préstamos:", error);
        }
    },

    render: (data) => {
        const tbody = document.getElementById('tabla-prestamos');
        
        if (data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center py-5 text-muted">No hay préstamos registrados.</td></tr>`;
            return;
        }

        tbody.innerHTML = data.map(p => {
            const statusClass = {
                'activo': 'bg-primary-soft text-primary',
                'devuelto': 'bg-success-soft text-success',
                'vencido': 'bg-danger-soft text-danger'
            }[p.estado] || 'bg-secondary text-white';

            return `
                <tr>
                    <td class="ps-4">
                        <div class="fw-bold text-white">${new Date(p.fecha_salida).toLocaleDateString()}</div>
                        <div class="text-muted text-xs">${new Date(p.fecha_salida).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                    </td>
                    <td>
                        <div class="fw-600">${p.trabajador_nombre}</div>
                    </td>
                    <td class="text-muted text-sm">${p.usuario_entrega_nombre || 'Sincronizando...'}</td>
                    <td class="text-muted text-sm">
                        ${p.fecha_devolucion_esperada ? new Date(p.fecha_devolucion_esperada).toLocaleDateString() : '—'}
                    </td>
                    <td class="text-center">
                        <span class="px-2 py-1 rounded text-xs fw-600 ${statusClass}">
                            ${p.estado.toUpperCase()}
                        </span>
                    </td>
                    <td class="pe-4 text-end">
                        <div class="d-flex justify-content-end gap-2">
                            <button class="btn btn-sm btn-dark" title="Ver detalle"><i class="bi bi-eye"></i></button>
                            <button class="btn btn-sm btn-dark text-success" title="Registrar devolución"><i class="bi bi-check2-circle"></i></button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }
};

window.Prestamos = Prestamos;
