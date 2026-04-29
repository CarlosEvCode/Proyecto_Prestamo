const Catalogos = {
    currentTab: 'areas',

    init: async () => {
        await Catalogos.loadData();
    },

    switchTab: async (tab) => {
        Catalogos.currentTab = tab;
        const titles = {
            'areas': 'Listado de Áreas',
            'marcas': 'Listado de Marcas',
            'categorias': 'Listado de Categorías',
            'modelos': 'Listado de Modelos'
        };
        document.getElementById('catalog-title').innerText = titles[tab];
        await Catalogos.loadData();
    },

    loadData: async () => {
        try {
            const response = await fetch(`/api/catalogos/${Catalogos.currentTab}`);
            const result = await response.json();

            if (result.success) {
                Catalogos.render(result.data);
            }
        } catch (error) {
            console.error(`Error cargando ${Catalogos.currentTab}:`, error);
        }
    },

    render: (data) => {
        const thead = document.getElementById('catalog-thead');
        const tbody = document.getElementById('catalog-tbody');

        // Configurar cabecera según la pestaña
        if (Catalogos.currentTab === 'modelos') {
            thead.innerHTML = `
                <tr>
                    <th class="ps-4">NOMBRE</th>
                    <th>MARCA</th>
                    <th>CATEGORÍA</th>
                    <th class="pe-4 text-end">ACCIONES</th>
                </tr>
            `;
        } else {
            thead.innerHTML = `
                <tr>
                    <th class="ps-4">ID</th>
                    <th>NOMBRE</th>
                    <th class="pe-4 text-end">ACCIONES</th>
                </tr>
            `;
        }

        // Renderizar filas
        if (data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="text-center py-5 text-muted">No hay registros encontrados.</td></tr>`;
            return;
        }

        tbody.innerHTML = data.map(item => {
            if (Catalogos.currentTab === 'modelos') {
                return `
                    <tr>
                        <td class="ps-4 fw-bold text-white">${item.nombre}</td>
                        <td>${item.marca_nombre}</td>
                        <td>${item.categoria_nombre}</td>
                        <td class="pe-4 text-end">
                            <button class="btn btn-sm btn-dark"><i class="bi bi-pencil"></i></button>
                            <button class="btn btn-sm btn-dark"><i class="bi bi-trash text-danger"></i></button>
                        </td>
                    </tr>
                `;
            } else {
                const idField = `id_${Catalogos.currentTab.slice(0, -1)}`; // Convierte 'areas' a 'id_area'
                return `
                    <tr>
                        <td class="ps-4 text-muted">${item[idField] || item.id_area || item.id_marca || item.id_categoria}</td>
                        <td class="fw-bold text-white">${item.nombre}</td>
                        <td class="pe-4 text-end">
                            <button class="btn btn-sm btn-dark"><i class="bi bi-pencil"></i></button>
                            <button class="btn btn-sm btn-dark"><i class="bi bi-trash text-danger"></i></button>
                        </td>
                    </tr>
                `;
            }
        }).join('');
    },

    openModal: () => {
        alert(`Próximamente: Agregar nuevo registro a ${Catalogos.currentTab}`);
    }
};

window.Catalogos = Catalogos;
