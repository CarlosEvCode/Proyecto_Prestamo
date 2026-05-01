/**
 * modules/catalogos.js
 * Gestión de Catálogos (Marcas y Modelos) con modal único
 */

'use strict';

const Catalogos = {
  currentTab: 'marcas',
  allData: [],
  filteredData: [],
  marcas: [],
  categorias: [],

 
  async init() {
    this._bindEvents();
    await this.load();
    await this._loadMarcas();
    await this._loadCategorias();
  },

 
  async load() {
    try {
      const response = await fetch(`/api/catalogos/${this.currentTab}`);
      const result = await response.json();

      if (result.success) {
        this.allData = result.data;
        this.filteredData = result.data;
        this._render(result.data);
        this._updateTotal();
      }
    } catch (error) {
      console.error(`Error cargando ${this.currentTab}:`, error);
      showToast(`Error al cargar ${this.currentTab}`, 'error');
    }
  },

  
  _render(data) {
    data = data || [];
    const thead = document.getElementById('catalog-thead');
    const tbody = document.getElementById('catalog-tbody');

    // Configurar cabecera
    if (this.currentTab === 'modelos') {
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
    if (!data.length) {
      tbody.innerHTML = `<tr><td colspan="4" class="text-center py-5 text-muted">No hay registros encontrados.</td></tr>`;
      return;
    }

    tbody.innerHTML = data.map((item, i) => {
      if (this.currentTab === 'modelos') {
        return `
          <tr style="border-bottom: 1px solid var(--border-color);">
            <td class="ps-4 fw-bold text-white">${escapeHtml(item.nombre)}</td>
            <td>${escapeHtml(item.marca || 'N/A')}</td>
            <td>${escapeHtml(item.categoria || 'N/A')}</td>
            <td class="pe-4 text-end">
              <div class="d-flex justify-content-end gap-2">
                <button class="btn btn-sm btn-dark" style="border: 1px solid var(--border-color);" onclick="Catalogos.openEdit(${item.id_modelo})" title="Editar"><i class="bi bi-pencil text-muted"></i></button>
                <button class="btn btn-sm btn-dark" style="border: 1px solid var(--border-color);" onclick="Catalogos.confirmDel(${item.id_modelo},'${escapeHtml(item.nombre)}')" title="Eliminar"><i class="bi bi-trash text-danger"></i></button>
              </div>
            </td>
          </tr>
        `;
      } else {
        const idField = this.currentTab === 'marcas' ? 'id_marca' : 'id_categoria';
        return `
          <tr style="border-bottom: 1px solid var(--border-color);">
            <td class="ps-4 text-muted">${item[idField]}</td>
            <td class="fw-bold text-white">${escapeHtml(item.nombre)}</td>
            <td class="pe-4 text-end">
              <div class="d-flex justify-content-end gap-2">
                <button class="btn btn-sm btn-dark" style="border: 1px solid var(--border-color);" onclick="Catalogos.openEdit(${item[idField]})" title="Editar"><i class="bi bi-pencil text-muted"></i></button>
                <button class="btn btn-sm btn-dark" style="border: 1px solid var(--border-color);" onclick="Catalogos.confirmDel(${item[idField]},'${escapeHtml(item.nombre)}')" title="Eliminar"><i class="bi bi-trash text-danger"></i></button>
              </div>
            </td>
          </tr>
        `;
      }
    }).join('');
  },

  _filter() {
    const search = document.getElementById('searchCatalogo')?.value.toLowerCase().trim() || '';

    if (search === '') {
      this.filteredData = this.allData;
    } else {
      this.filteredData = this.allData.filter(item => {
        const nombre = (item.nombre || '').toLowerCase();
        let matches = nombre.includes(search);

        // En modelos, también buscar por marca y categoría
        if (this.currentTab === 'modelos') {
          const marca = (item.marca || '').toLowerCase();
          const categoria = (item.categoria || '').toLowerCase();
          matches = matches || marca.includes(search) || categoria.includes(search);
        }

        // Buscar por ID
        const idField = this.currentTab === 'marcas' ? 'id_marca' : this.currentTab === 'modelos' ? 'id_modelo' : 'id_categoria';
        const id = String(item[idField] || '').toLowerCase();
        matches = matches || id.includes(search);

        return matches;
      });
    }

    this._render(this.filteredData);
    this._updateTotal();
  },

  _openModal(mode, item = null) {
    const isEdit = mode === 'edit';
    const isModelo = this.currentTab === 'modelos';

    // Actualizar título
    const titleMap = {
      'marcas': isEdit ? 'Editar Marca' : 'Nueva Marca',
      'modelos': isEdit ? 'Editar Modelo' : 'Nuevo Modelo'
    };
    document.getElementById('modalCatalogTitle').innerText = titleMap[this.currentTab];
    document.getElementById('modalCatalogSubtitle').innerText = isEdit ? 'Editar registro' : 'Agregar nuevo registro';

    // Limpiar formulario
    document.getElementById('formCatalogo').reset();
    document.getElementById('catalogId').value = '';
    this._clearErrors();

    // Mostrar/ocultar campos según la pestaña
    document.getElementById('fieldMarca').style.display = isModelo ? 'block' : 'none';
    document.getElementById('fieldCategoria').style.display = isModelo ? 'block' : 'none';

    // Si es edición, llenar datos
    if (isEdit) {
      document.getElementById('catalogId').value = isModelo ? item.id_modelo : (this.currentTab === 'marcas' ? item.id_marca : item.id_categoria);
      document.getElementById('cNombre').value = item.nombre;

      if (isModelo) {
        document.getElementById('cMarca').value = item.id_marca || '';
        document.getElementById('cCategoria').value = item.id_categoria || '';
      }
    }

    openOverlay('modalCatalogosOverlay');
  },


  async openEdit(id) {
    try {
      const response = await fetch(`/api/catalogos/${this.currentTab}/${id}`);
      const result = await response.json();

      if (result.success) {
        this._openModal('edit', result.data);
      }
    } catch (error) {
      console.error('Error cargando item:', error);
      showToast('Error al cargar el registro', 'error');
    }
  },

  confirmDel(id, name) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `Vas a eliminar: "${name}"`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`/api/catalogos/${this.currentTab}/${id}`, {
            method: 'DELETE'
          });

          const resultData = await response.json();

          if (resultData.success) {
            await this.load();
            showToast(`"${name}" eliminado correctamente`, 'success');
          } else {
            showToast(resultData.message || 'Error al eliminar', 'error');
          }
        } catch (error) {
          console.error('Error eliminando:', error);
          showToast('Error al eliminar', 'error');
        }
      }
    });
  },

  async _save() {
    if (!this._validate()) return;

    const id = document.getElementById('catalogId').value;
    const isEdit = !!id;
    const nombre = document.getElementById('cNombre').value.trim();
    const isModelo = this.currentTab === 'modelos';

    const body = { nombre };
    if (isModelo) {
      body.id_marca = document.getElementById('cMarca').value;
      body.id_categoria = document.getElementById('cCategoria').value;
    }

    setLoading('btnSaveCatalogo', 'btnSaveCatalogoText', 'btnSaveCatalogoSpinner', true);

    try {
      const method = isEdit ? 'PUT' : 'POST';
      const url = isEdit 
        ? `/api/catalogos/${this.currentTab}/${id}` 
        : `/api/catalogos/${this.currentTab}`;

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const result = await response.json();

      if (result.success) {
        await this.load();
        closeOverlay('modalCatalogosOverlay');
        showToast(result.message || `${this.currentTab.slice(0, -1)} ${isEdit ? 'actualizado' : 'creado'} correctamente`, 'success');
      } else {
        showToast(result.message || 'Error al guardar', 'error');
      }
    } catch (error) {
      console.error('Error guardando:', error);
      showToast('Error al guardar', 'error');
    } finally {
      setLoading('btnSaveCatalogo', 'btnSaveCatalogoText', 'btnSaveCatalogoSpinner', false);
    }
  },

  _validate() {
    this._clearErrors();
    let ok = true;
    const nombre = document.getElementById('cNombre').value.trim();

    if (!nombre) {
      setError('cNombre', 'err-cNombre', 'El nombre es obligatorio');
      ok = false;
    }

    if (this.currentTab === 'modelos') {
      const marca = document.getElementById('cMarca').value;
      const categoria = document.getElementById('cCategoria').value;

      if (!marca) {
        setError('cMarca', 'err-cMarca', 'La marca es obligatoria');
        ok = false;
      }

      if (!categoria) {
        setError('cCategoria', 'err-cCategoria', 'La categoría es obligatoria');
        ok = false;
      }
    }

    return ok;
  },

  _bindEvents() {
    // Botón Nuevo
    document.getElementById('btnNuevo')?.addEventListener('click', () => {
      this._openModal('new');
    });

    // Botón Refrescar
    document.getElementById('btnRefreshCatalogo')?.addEventListener('click', () => {
      this.load();
    });

    // Búsqueda
    document.getElementById('searchCatalogo')?.addEventListener('input', () => {
      this._filter();
    });

    // Modal - Cerrar
    document.getElementById('btnCloseCatalogo')?.addEventListener('click', () => {
      closeOverlay('modalCatalogosOverlay');
    });

    document.getElementById('btnCancelCatalogo')?.addEventListener('click', () => {
      closeOverlay('modalCatalogosOverlay');
    });

    // Modal - Guardar
    document.getElementById('btnSaveCatalogo')?.addEventListener('click', () => {
      this._save();
    });

    // Cerrar modal clickeando fuera
    document.getElementById('modalCatalogosOverlay')?.addEventListener('click', (e) => {
      if (e.target.id === 'modalCatalogosOverlay') {
        closeOverlay('modalCatalogosOverlay');
      }
    });
  },

  async switchTab(tab) {
    this.currentTab = tab;
    document.getElementById('searchCatalogo').value = '';
    await this.load();
  },

  async _loadMarcas() {
    try {
      const response = await fetch('/api/catalogos/marcas');
      const result = await response.json();

      if (result.success) {
        this.marcas = result.data;
        this._populateMarcasSelect();
      }
    } catch (error) {
      console.error('Error cargando marcas:', error);
    }
  },

  async _loadCategorias() {
    try {
      const response = await fetch('/api/catalogos/categorias');
      const result = await response.json();

      if (result.success) {
        this.categorias = result.data;
        this._populateCategoriasSelect();
      }
    } catch (error) {
      console.error('Error cargando categorías:', error);
    }
  },

  _populateMarcasSelect() {
    const select = document.getElementById('cMarca');
    if (select) {
      select.innerHTML = '<option value="">-- Seleccionar Marca --</option>';
      this.marcas.forEach(marca => {
        select.innerHTML += `<option value="${marca.id_marca}">${escapeHtml(marca.nombre)}</option>`;
      });
    }
  },

  _populateCategoriasSelect() {
    const select = document.getElementById('cCategoria');
    if (select) {
      select.innerHTML = '<option value="">-- Seleccionar Categoría --</option>';
      this.categorias.forEach(categoria => {
        select.innerHTML += `<option value="${categoria.id_categoria}">${escapeHtml(categoria.nombre)}</option>`;
      });
    }
  },

  _updateTotal() {
    const label = document.getElementById('totalCatalogosLabel');
    if (label) {
      const count = this.filteredData.length;
      label.innerText = `${count} registro(s) encontrado(s)`;
    }
  },

  _clearErrors() {
    ['cNombre', 'cMarca', 'cCategoria'].forEach(id => {
      const el = document.getElementById(`err-${id}`);
      if (el) el.innerText = '';
    });
  }
};

window.Catalogos = Catalogos;
