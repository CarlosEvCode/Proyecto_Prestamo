/**
 * modules/catalogos.js
 * Gestiona marcas y modelos desde una sola interfaz
 */

'use strict';

const CatalogosModule = {
  currentTab: 'marcas', // 'marcas' o 'modelos'

  async init() {
    this._bindEvents();
    await this.load();
  },

  async load() {
    this._showSpinner('marcas');
    this._showSpinner('modelos');

    try {
      const [resMarcas, resModelos, resCategorias] = await Promise.all([
        http('/api/catalogos/marcas'),
        http('/api/catalogos/modelos'),
        http('/api/catalogos/categorias')
      ]);
      AppState.marcas = resMarcas.data;
      AppState.modelos = resModelos.data;
      AppState.categorias = resCategorias.data;
      this._renderMarcas(resMarcas.data);
      this._renderModelos(resModelos.data);
      updateBadges();
    } catch (e) {
      showToast('Error al cargar catálogos: ' + e.message, 'error');
    }
  },

  _showSpinner(tab) {
    const tbody = document.getElementById(`body${tab.charAt(0).toUpperCase() + tab.slice(1)}`);
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="4" class="text-center py-5"><div class="spinner-custom"></div></td></tr>`;
    }
  },

  /* ── MARCAS ───────────────────────────── */
  _renderMarcas(lista) {
    lista = lista || [];
    setText('totalMarcasLabel', `${lista.length} marca(s) registrada(s)`);
    const tbody = document.getElementById('bodyMarcas');

    if (!lista.length) {
      tbody.innerHTML = `<tr><td colspan="4"><div class="empty-state">
        <i class="bi bi-bookmark-x"></i><p>No hay marcas registradas</p>
      </div></td></tr>`;
      return;
    }

    tbody.innerHTML = lista.map((m, i) => {
      const count = this._countModelosByMarca(m.id_marca);
      return `
        <tr>
          <td><span style="font-family:'DM Mono',monospace;font-size:12px;color:var(--text-muted)">${String(i+1).padStart(2,'0')}</span></td>
          <td>
            <div class="d-flex align-items-center gap-2">
              <div style="width:32px;height:32px;background:var(--primary-light);border-radius:8px;display:flex;align-items:center;justify-content:center;color:var(--primary)">
                <i class="bi bi-bookmark-star-fill"></i>
              </div>
              <span class="fw-600">${escapeHtml(m.nombre)}</span>
            </div>
          </td>
          <td><span class="badge-info">${count} modelo(s)</span></td>
          <td>
            <button class="btn-action btn-action-edit"   onclick="CatalogosModule.openEditMarca(${m.id_marca})"   title="Editar"><i class="bi bi-pencil-fill"></i></button>
            <button class="btn-action btn-action-delete" onclick="CatalogosModule.confirmDelMarca(${m.id_marca},'${escapeHtml(m.nombre)}')" title="Eliminar"><i class="bi bi-trash3-fill"></i></button>
          </td>
        </tr>`;
    }).join('');
  },

  _countModelosByMarca(idMarca) {
    if (!AppState.modelos || !Array.isArray(AppState.modelos)) return 0;
    return AppState.modelos.filter(m => parseInt(m.id_marca) === parseInt(idMarca)).length;
  },

  _filterMarcas() {
    const search = document.getElementById('searchMarca')?.value.toLowerCase() || '';
    const marcas = AppState.marcas || [];
    this._renderMarcas(marcas.filter(m =>
      m.nombre.toLowerCase().includes(search)
    ));
  },

  _openModalMarca(mode, marca = null) {
    const isEdit = mode === 'edit';
    setText('modalMarcaTitle', isEdit ? 'Editar Marca' : 'Nueva Marca');
    document.getElementById('marcaId').value = isEdit ? marca.id_marca : '';
    document.getElementById('mNombre').value = isEdit ? marca.nombre : '';
    clearErrors(['mNombre']);
    openOverlay('modalMarcaOverlay');
  },

  openEditMarca(id) {
    const marca = AppState.marcas.find(m => m.id_marca === id);
    if (!marca) return showToast('Marca no encontrada', 'error');
    this._openModalMarca('edit', marca);
  },

  confirmDelMarca(id, name) {
    DeleteModal.open('marca', id, name, async () => {
      try {
        await http(`/api/catalogos/marcas/${id}`, 'DELETE');
        showToast(`"${name}" eliminada correctamente`, 'success');
        await this.load();
      } catch (e) {
        showToast(e.message, 'error');
      }
    });
  },

  async _saveMarca() {
    const id     = document.getElementById('marcaId').value;
    const nombre = document.getElementById('mNombre').value.trim();
    clearErrors(['mNombre']);

    if (!nombre) {
      setError('mNombre','err-mNombre','El nombre de la marca es requerido');
      return;
    }

    const isEdit = !!id;
    setLoading('btnSaveMarca','btnSaveMarcaText','btnSaveMarcaSpinner', true);
    try {
      await http(isEdit ? `/api/catalogos/marcas/${id}` : '/api/catalogos/marcas', isEdit ? 'PUT' : 'POST', { nombre: nombre });
      showToast(`Marca ${isEdit ? 'actualizada' : 'creada'} correctamente`, 'success');
      closeOverlay('modalMarcaOverlay');
      await this.load();
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setLoading('btnSaveMarca','btnSaveMarcaText','btnSaveMarcaSpinner', false);
    }
  },

  /* ── MODELOS ───────────────────────────── */
  _renderModelos(lista) {
    lista = lista || [];
    setText('totalModelosLabel', `${lista.length} modelo(s) registrado(s)`);
    const tbody = document.getElementById('bodyModelos');

    if (!lista.length) {
      tbody.innerHTML = `<tr><td colspan="4"><div class="empty-state">
        <i class="bi bi-hammer-x"></i><p>No hay modelos registrados</p>
      </div></td></tr>`;
      return;
    }

    tbody.innerHTML = lista.map((m, i) => {
      return `
        <tr>
          <td><span style="font-family:'DM Mono',monospace;font-size:12px;color:var(--text-muted)">${String(i+1).padStart(2,'0')}</span></td>
          <td>
            <div class="d-flex align-items-center gap-2">
              <div style="width:32px;height:32px;background:var(--primary-light);border-radius:8px;display:flex;align-items:center;justify-content:center;color:var(--primary)">
                <i class="bi bi-hammer"></i>
              </div>
              <div>
                <div class="fw-600" style="font-size:13px">${escapeHtml(m.nombre)}</div>
              </div>
            </div>
          </td>
          <td><span style="font-size:13px">${escapeHtml(m.marca || 'Sin marca')}</span></td>
          <td><span style="font-size:13px">${escapeHtml(m.categoria || 'Sin categoría')}</span></td>
          <td>
            <button class="btn-action btn-action-edit" onclick="CatalogosModule.openEditModelo(${m.id_modelo})" title="Editar"><i class="bi bi-pencil-fill"></i></button>
            <button class="btn-action btn-action-delete" onclick="CatalogosModule.confirmDelModelo(${m.id_modelo},'${escapeHtml(m.nombre)}')" title="Eliminar"><i class="bi bi-trash3-fill"></i></button>
          </td>
        </tr>`;
    }).join('');
  },

  _filterModelos() {
    const search = document.getElementById('searchModelo')?.value.toLowerCase() || '';
    const modelos = AppState.modelos || [];
    this._renderModelos(modelos.filter(m =>
      m.nombre.toLowerCase().includes(search)
    ));
  },

  _openModalModelo(mode, modelo = null) {
    const isEdit = mode === 'edit';
    setText('modalModeloTitle', isEdit ? 'Editar Modelo' : 'Nuevo Modelo');
    document.getElementById('modeloId').value = isEdit ? modelo.id_modelo : '';
    document.getElementById('moNombre').value = isEdit ? modelo.nombre : '';
    this._renderMarcaSelect();
    this._renderCategoriaSelect();
    document.getElementById('moMarca').value = isEdit ? modelo.id_marca : '';
    document.getElementById('moCategoria').value = isEdit ? modelo.id_categoria : '';
    clearErrors(['moNombre', 'moMarca', 'moCategoria']);
    openOverlay('modalModeloOverlay');
  },

  openEditModelo(id) {
    const modelo = (AppState.modelos || []).find(m => m.id_modelo === id);
    if (!modelo) return showToast('Modelo no encontrado', 'error');
    this._openModalModelo('edit', modelo);
  },

  confirmDelModelo(id, nombre) {
    DeleteModal.open('modelo', id, nombre, async () => {
      try {
        await http(`/api/catalogos/modelos/${id}`, 'DELETE');
        showToast(`"${nombre}" eliminado correctamente`, 'success');
        await this.load();
      } catch (e) {
        showToast(e.message, 'error');
      }
    });
  },

  _renderMarcaSelect() {
    const select = document.getElementById('moMarca');
    if (!select) return;
    
    const html = (AppState.marcas || []).map(m => 
      `<option value="${m.id_marca}">${escapeHtml(m.nombre)}</option>`
    ).join('');
    
    select.innerHTML = '<option value="">-- Selecciona una marca --</option>' + html;
  },

  _renderCategoriaSelect() {
    const select = document.getElementById('moCategoria');
    if (!select) return;
    
    const html = (AppState.categorias || []).map(c => 
      `<option value="${c.id_categoria}">${escapeHtml(c.nombre)}</option>`
    ).join('');
    
    select.innerHTML = '<option value="">-- Selecciona una categoría --</option>' + html;
  },

  async _saveModelo() {
    const id          = document.getElementById('modeloId').value;
    const nombre      = document.getElementById('moNombre').value.trim();
    const idMarca     = document.getElementById('moMarca').value;
    const idCategoria = document.getElementById('moCategoria').value;

    clearErrors(['moNombre', 'moMarca', 'moCategoria']);

    if (!nombre) {
      setError('moNombre','err-moNombre','El nombre del modelo es requerido');
      return;
    }

    if (!idMarca) {
      setError('moMarca','err-moMarca','La marca es requerida');
      return;
    }

    if (!idCategoria) {
      setError('moCategoria','err-moCategoria','La categoría es requerida');
      return;
    }

    const isEdit = !!id;
    setLoading('btnSaveModelo','btnSaveModeloText','btnSaveModeloSpinner', true);
    try {
      await http(isEdit ? `/api/catalogos/modelos/${id}` : '/api/catalogos/modelos', isEdit ? 'PUT' : 'POST', {
        nombre,
        id_marca: parseInt(idMarca),
        id_categoria: parseInt(idCategoria)
      });
      showToast(`Modelo ${isEdit ? 'actualizado' : 'creado'} correctamente`, 'success');
      closeOverlay('modalModeloOverlay');
      await this.load();
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setLoading('btnSaveModelo','btnSaveModeloText','btnSaveModeloSpinner', false);
    }
  },

  /* ── Eventos ───────────────────────────── */
  _bindEvents() {
    // Tabs
    document.getElementById('tabMarcas')?.addEventListener('click', () => this._switchTab('marcas'));
    document.getElementById('tabModelos')?.addEventListener('click', () => this._switchTab('modelos'));

    // Marcas
    document.getElementById('btnNuevaMarca')?.addEventListener('click',    () => this._openModalMarca('new'));
    document.getElementById('btnSaveMarca')?.addEventListener('click',     () => this._saveMarca());
    document.getElementById('btnCancelMarca')?.addEventListener('click',   () => closeOverlay('modalMarcaOverlay'));
    document.getElementById('btnCloseModalMarca')?.addEventListener('click', () => closeOverlay('modalMarcaOverlay'));
    document.getElementById('btnRefreshMarcas')?.addEventListener('click', () => this.load());
    document.getElementById('searchMarca')?.addEventListener('input',      () => this._filterMarcas());
    document.getElementById('modalMarcaOverlay')?.addEventListener('click', e => {
      if (e.target.id === 'modalMarcaOverlay') closeOverlay('modalMarcaOverlay');
    });

    // Modelos
    document.getElementById('btnNuevoModelo')?.addEventListener('click',    () => this._openModalModelo('new'));
    document.getElementById('btnSaveModelo')?.addEventListener('click',     () => this._saveModelo());
    document.getElementById('btnCancelModelo')?.addEventListener('click',   () => closeOverlay('modalModeloOverlay'));
    document.getElementById('btnCloseModalModelo')?.addEventListener('click', () => closeOverlay('modalModeloOverlay'));
    document.getElementById('btnRefreshModelos')?.addEventListener('click', () => this.load());
    document.getElementById('searchModelo')?.addEventListener('input',      () => this._filterModelos());
    document.getElementById('modalModeloOverlay')?.addEventListener('click', e => {
      if (e.target.id === 'modalModeloOverlay') closeOverlay('modalModeloOverlay');
    });
  },

  _switchTab(tab) {
    this.currentTab = tab;
    document.querySelectorAll('[role="tab"]').forEach(el => el.classList.remove('active'));
    document.getElementById(`tab${tab.charAt(0).toUpperCase() + tab.slice(1)}`)?.classList.add('active');
    
    document.querySelectorAll('[role="tabpanel"]').forEach(el => el.classList.add('d-none'));
    document.getElementById(`panel${tab.charAt(0).toUpperCase() + tab.slice(1)}`)?.classList.remove('d-none');
  },
};
