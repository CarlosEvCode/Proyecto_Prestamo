/**
 * modules/modelos.js
 * Solo conoce el DOM de views/modelos.html
 */

'use strict';

const ModelosModule = {

  async init() {
    this._bindEvents();
    await this.load();
  },

  async load() {
    document.getElementById('bodyModelos').innerHTML =
      `<tr><td colspan="4" class="text-center py-5"><div class="spinner-custom"></div></td></tr>`;

    try {
      const [resM, resMA] = await Promise.all([
        http('/api/modelos'),
        http('/api/marcas')
      ]);
      AppState.modelos = resM.data;
      AppState.marcas = resMA.data;
      this._render(resM.data);
      updateBadges();
    } catch (e) {
      showToast('Error al cargar modelos: ' + e.message, 'error');
    }
  },

  _render(lista) {
    lista = lista || [];
    setText('totalModelosLabel', `${lista.length} modelo(s) registrado(s)`);
    const tbody = document.getElementById('bodyModelos');

    if (!lista.length) {
      tbody.innerHTML = `<tr><td colspan="4"><div class="empty-state">
        <i class="bi bi-bookmark-x"></i><p>No hay modelos registrados</p>
      </div></td></tr>`;
      return;
    }

    tbody.innerHTML = lista.map((m, i) => {
      const marca = (AppState.marcas || []).find(ma => ma.id_marca === m.id_marca) || { nombre: 'Sin marca' };
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
          <td><span style="font-size:13px">${escapeHtml(marca.nombre || 'Sin marca')}</span></td>
          <td>
            <button class="btn-action btn-action-edit" onclick="ModelosModule.openEdit(${m.id_modelo})" title="Editar"><i class="bi bi-pencil-fill"></i></button>
            <button class="btn-action btn-action-delete" onclick="ModelosModule.confirmDel(${m.id_modelo},'${escapeHtml(m.nombre)}')" title="Eliminar"><i class="bi bi-trash3-fill"></i></button>
          </td>
        </tr>`;
    }).join('');
  },

  _filter() {
    const search = document.getElementById('searchModelo')?.value.toLowerCase() || '';
    const modelos = AppState.modelos || [];
    this._render(modelos.filter(m =>
      m.nombre.toLowerCase().includes(search)
    ));
  },

  /* ── Modal ───────────────────────────── */
  _openModal(mode, modelo = null) {
    const isEdit = mode === 'edit';
    setText('modalModeloTitle', isEdit ? 'Editar Modelo' : 'Nuevo Modelo');
    document.getElementById('modeloId').value = isEdit ? modelo.id_modelo : '';
    document.getElementById('mNombre').value = isEdit ? modelo.nombre : '';
    this._renderMarcaSelect();
    document.getElementById('mMarca').value = isEdit ? modelo.id_marca : '';
    clearErrors(['mNombre', 'mMarca']);
    openOverlay('modalModeloOverlay');
  },

  openEdit(id) {
    const modelo = (AppState.modelos || []).find(m => m.id_modelo === id);
    if (!modelo) return showToast('Modelo no encontrado', 'error');
    this._openModal('edit', modelo);
  },

  confirmDel(id, nombre) {
    DeleteModal.open('modelo', id, nombre, async () => {
      try {
        await http(`/api/modelos/${id}`, 'DELETE');
        showToast(`"${nombre}" eliminado correctamente`, 'success');
        await this.load();
      } catch (e) {
        showToast(e.message, 'error');
      }
    });
  },

  _renderMarcaSelect() {
    const select = document.getElementById('mMarca');
    if (!select) return;
    
    const html = (AppState.marcas || []).map(m => 
      `<option value="${m.id_marca}">${escapeHtml(m.nombre)}</option>`
    ).join('');
    
    select.innerHTML = '<option value="">-- Selecciona una marca --</option>' + html;
  },

  async _save() {
    const id      = document.getElementById('modeloId').value;
    const nombre  = document.getElementById('mNombre').value.trim();
    const idMarca = document.getElementById('mMarca').value;

    clearErrors(['mNombre', 'mMarca']);

    if (!nombre) {
      setError('mNombre','err-mNombre','El nombre del modelo es requerido');
      return;
    }

    if (!idMarca) {
      setError('mMarca','err-mMarca','La marca es requerida');
      return;
    }

    const isEdit = !!id;
    setLoading('btnSaveModelo','btnSaveModeloText','btnSaveModeloSpinner', true);
    try {
      await http(isEdit ? `/api/modelos/${id}` : '/api/modelos', isEdit ? 'PUT' : 'POST', {
        nombre,
        id_marca: parseInt(idMarca)
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

  _bindEvents() {
    document.getElementById('btnNuevoModelo')?.addEventListener('click',    () => this._openModal('new'));
    document.getElementById('btnSaveModelo')?.addEventListener('click',     () => this._save());
    document.getElementById('btnCancelModelo')?.addEventListener('click',   () => closeOverlay('modalModeloOverlay'));
    document.getElementById('btnCloseModalModelo')?.addEventListener('click', () => closeOverlay('modalModeloOverlay'));
    document.getElementById('btnRefreshModelos')?.addEventListener('click', () => this.load());
    document.getElementById('searchModelo')?.addEventListener('input',      () => this._filter());
    document.getElementById('modalModeloOverlay')?.addEventListener('click', e => {
      if (e.target.id === 'modalModeloOverlay') closeOverlay('modalModeloOverlay');
    });
  },
};
