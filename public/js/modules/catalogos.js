/**
 * modules/catalogos.js
 * Gestión de Catálogos (Marcas, Modelos, Proveedores)
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
        this.allData = result.data || [];
        this.filteredData = result.data || [];
        this._render(this.allData);
        this._updateTotal();
      }
    } catch (error) {
      console.error(`Error cargando ${this.currentTab}:`, error);
      showToast(`Error al cargar ${this.currentTab}`, 'error');
    }
  },

  _render(data) {
    const thead = document.getElementById('catalog-thead');
    const tbody = document.getElementById('catalog-tbody');
    if (!thead || !tbody) return;

    // Configurar cabecera
    if (this.currentTab === 'modelos') {
      thead.innerHTML = `
        <tr>
          <th class="ps-4">NOMBRE</th>
          <th>MARCA</th>
          <th>CATEGORÍA</th>
          <th class="pe-4 text-end">ACCIONES</th>
        </tr>`;
    } else if (this.currentTab === 'proveedores') {
      thead.innerHTML = `
        <tr>
          <th class="ps-4">ID</th>
          <th>NOMBRE</th>
          <th>CONTACTO</th>
          <th class="pe-4 text-end">ACCIONES</th>
        </tr>`;
    } else {
      thead.innerHTML = `
        <tr>
          <th class="ps-4">ID</th>
          <th>NOMBRE</th>
          <th class="pe-4 text-end">ACCIONES</th>
        </tr>`;
    }

    // Renderizar filas
    if (!data.length) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center py-5 text-muted">No hay registros encontrados.</td></tr>`;
      return;
    }

    tbody.innerHTML = data.map(item => {
      if (this.currentTab === 'modelos') {
        return `
          <tr style="border-bottom: 1px solid var(--border-color);">
            <td class="ps-4 fw-bold text-white">${escapeHtml(item.nombre)}</td>
            <td>${escapeHtml(item.marca || '—')}</td>
            <td>${escapeHtml(item.categoria || '—')}</td>
            <td class="pe-4 text-end">
              <div class="d-flex justify-content-end gap-2">
                <button class="btn btn-sm btn-dark" onclick="Catalogos.openEdit(${item.id_modelo})" title="Editar"><i class="bi bi-pencil text-muted"></i></button>
                <button class="btn btn-sm btn-dark" onclick="Catalogos.confirmDel(${item.id_modelo},'${escapeHtml(item.nombre)}')" title="Eliminar"><i class="bi bi-trash text-danger"></i></button>
              </div>
            </td>
          </tr>`;
      } else if (this.currentTab === 'proveedores') {
        return `
          <tr style="border-bottom: 1px solid var(--border-color);">
            <td class="ps-4 text-muted">${item.id_proveedor}</td>
            <td class="fw-bold text-white">${escapeHtml(item.nombre)}</td>
            <td class="text-muted">${escapeHtml(item.contacto || '—')}</td>
            <td class="pe-4 text-end">
              <div class="d-flex justify-content-end gap-2">
                <button class="btn btn-sm btn-dark" onclick="Catalogos.openEdit(${item.id_proveedor})" title="Editar"><i class="bi bi-pencil text-muted"></i></button>
                <button class="btn btn-sm btn-dark" onclick="Catalogos.confirmDel(${item.id_proveedor},'${escapeHtml(item.nombre)}')" title="Eliminar"><i class="bi bi-trash text-danger"></i></button>
              </div>
            </td>
          </tr>`;
      } else {
        const idField = this.currentTab === 'marcas' ? 'id_marca' : (this.currentTab === 'areas' ? 'id_area' : 'id_categoria');
        return `
          <tr style="border-bottom: 1px solid var(--border-color);">
            <td class="ps-4 text-muted">${item[idField]}</td>
            <td class="fw-bold text-white">${escapeHtml(item.nombre)}</td>
            <td class="pe-4 text-end">
              <div class="d-flex justify-content-end gap-2">
                <button class="btn btn-sm btn-dark" onclick="Catalogos.openEdit(${item[idField]})" title="Editar"><i class="bi bi-pencil text-muted"></i></button>
                <button class="btn btn-sm btn-dark" onclick="Catalogos.confirmDel(${item[idField]},'${escapeHtml(item.nombre)}')" title="Eliminar"><i class="bi bi-trash text-danger"></i></button>
              </div>
            </td>
          </tr>`;
      }
    }).join('');
  },

  _filter() {
    const search = document.getElementById('searchCatalogo')?.value.toLowerCase().trim() || '';
    if (search === '') {
      this.filteredData = this.allData;
    } else {
      this.filteredData = this.allData.filter(item => {
        const matchesName = (item.nombre || '').toLowerCase().includes(search);
        if (this.currentTab === 'modelos') {
          const matchesMarca = (item.marca || '').toLowerCase().includes(search);
          const matchesCat = (item.categoria || '').toLowerCase().includes(search);
          return matchesName || matchesMarca || matchesCat;
        }
        return matchesName;
      });
    }
    this._render(this.filteredData);
    this._updateTotal();
  },

  async switchTab(tab) {
    this.currentTab = tab;
    document.querySelectorAll('#catalogTabs .nav-link-custom').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`${tab}-tab`)?.classList.add('active');
    document.getElementById('searchCatalogo').value = '';
    await this.load();
  },

  _openModal(mode, item = null) {
    const isEdit = mode === 'edit';
    const isModelo = this.currentTab === 'modelos';
    const isProveedor = this.currentTab === 'proveedores';

    const titleMap = {
      'marcas': isEdit ? 'Editar Marca' : 'Nueva Marca',
      'modelos': isEdit ? 'Editar Modelo' : 'Nuevo Modelo',
      'proveedores': isEdit ? 'Editar Proveedor' : 'Nuevo Proveedor'
    };
    setText('modalCatalogTitle', titleMap[this.currentTab] || 'Nuevo Registro');
    setText('modalCatalogSubtitle', isEdit ? 'Editar registro existente' : 'Agregar un nuevo registro al catálogo');

    document.getElementById('formCatalogo').reset();
    document.getElementById('catalogId').value = '';
    clearErrors(['cNombre', 'cMarca', 'cCategoria']);

    document.getElementById('fieldMarca').style.display = isModelo ? 'block' : 'none';
    document.getElementById('fieldCategoria').style.display = isModelo ? 'block' : 'none';
    document.getElementById('fieldContacto').style.display = isProveedor ? 'block' : 'none';

    if (isEdit && item) {
      const idField = isModelo ? 'id_modelo' : (isProveedor ? 'id_proveedor' : (this.currentTab === 'marcas' ? 'id_marca' : 'id_categoria'));
      document.getElementById('catalogId').value = item[idField];
      document.getElementById('cNombre').value = item.nombre || '';
      if (isModelo) {
        document.getElementById('cMarca').value = item.id_marca || '';
        document.getElementById('cCategoria').value = item.id_categoria || '';
      }
      if (isProveedor) {
        document.getElementById('cContacto').value = item.contacto || '';
      }
    }
    openOverlay('modalCatalogosOverlay');
  },

  async openEdit(id) {
    try {
      const response = await fetch(`/api/catalogos/${this.currentTab}/${id}`);
      const result = await response.json();
      if (result.success) this._openModal('edit', result.data);
    } catch (e) { showToast('Error al cargar registro', 'error'); }
  },

  confirmDel(id, name) {
    DeleteModal.open('registro', id, name, async () => {
      try {
        const res = await http(`/api/catalogos/${this.currentTab}/${id}`, 'DELETE');
        if (res.success) {
          showToast('Registro eliminado', 'success');
          await this.load();
        }
      } catch (e) { showToast(e.message, 'error'); }
    });
  },

  async _save() {
    const id = document.getElementById('catalogId').value;
    const nombre = document.getElementById('cNombre').value.trim();
    if (!nombre) return setError('cNombre', 'err-cNombre', 'El nombre es obligatorio');

    const body = { nombre };
    if (this.currentTab === 'modelos') {
      body.id_marca = document.getElementById('cMarca').value;
      body.id_categoria = document.getElementById('cCategoria').value;
    }
    if (this.currentTab === 'proveedores') {
      body.contacto = document.getElementById('cContacto').value.trim();
    }

    setLoading('btnSaveCatalogo', 'btnSaveCatalogoText', 'btnSaveCatalogoSpinner', true);
    try {
      const method = id ? 'PUT' : 'POST';
      const url = id ? `/api/catalogos/${this.currentTab}/${id}` : `/api/catalogos/${this.currentTab}`;
      await http(url, method, body);
      showToast('Guardado correctamente', 'success');
      closeOverlay('modalCatalogosOverlay');
      await this.load();
    } catch (e) { showToast(e.message, 'error'); }
    finally { setLoading('btnSaveCatalogo', 'btnSaveCatalogoText', 'btnSaveCatalogoSpinner', false); }
  },

  async _loadMarcas() {
    const { data } = await http('/api/catalogos/marcas');
    this.marcas = data || [];
    const sel = document.getElementById('cMarca');
    if (sel) sel.innerHTML = '<option value="">-- Seleccionar Marca --</option>' + 
      this.marcas.map(m => `<option value="${m.id_marca}">${escapeHtml(m.nombre)}</option>`).join('');
  },

  async _loadCategorias() {
    const { data } = await http('/api/catalogos/categorias');
    this.categorias = data || [];
    const sel = document.getElementById('cCategoria');
    if (sel) sel.innerHTML = '<option value="">-- Seleccionar Categoría --</option>' + 
      this.categorias.map(c => `<option value="${c.id_categoria}">${escapeHtml(c.nombre)}</option>`).join('');
  },

  _updateTotal() {
    setText('totalCatalogosLabel', `${this.filteredData.length} registro(s) encontrado(s)`);
  },

  _clearErrors() {
    clearErrors(['cNombre', 'cMarca', 'cCategoria']);
  },

  _bindEvents() {
    document.getElementById('btnNuevo')?.addEventListener('click', () => this._openModal('new'));
    document.getElementById('btnRefreshCatalogo')?.addEventListener('click', () => this.load());
    document.getElementById('searchCatalogo')?.addEventListener('input', () => this._filter());
    document.getElementById('btnSaveCatalogo')?.addEventListener('click', () => this._save());
    document.getElementById('btnCloseCatalogo')?.addEventListener('click', () => closeOverlay('modalCatalogosOverlay'));
    document.getElementById('btnCancelCatalogo')?.addEventListener('click', () => closeOverlay('modalCatalogosOverlay'));
  }
};

window.Catalogos = Catalogos;
