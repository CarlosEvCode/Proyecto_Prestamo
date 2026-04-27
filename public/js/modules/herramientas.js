/**
 * modules/herramientas.js
 * Solo conoce el DOM de views/herramientas.html
 */

'use strict';

const HerramientasModule = {

  async init() {
    this._bindEvents();
    await this.load();
  },

  async load() {
    document.getElementById('bodyHerramientas').innerHTML =
      `<tr><td colspan="7" class="text-center py-5"><div class="spinner-custom"></div></td></tr>`;

    try {
      const [resH, resM] = await Promise.all([
        http('/api/herramientas'),
        http('/api/modelos')
      ]);
      AppState.herramientas = resH.data;
      AppState.modelos = resM.data;
      this._render(resH.data);
      this._renderModeloSelect();
      updateBadges();
    } catch (e) {
      showToast('Error al cargar herramientas: ' + e.message, 'error');
    }
  },

  _renderModeloSelect() {
    const select = document.getElementById('hModelo');
    if (!select) return;
    
    const html = (AppState.modelos || []).map(m => 
      `<option value="${m.id_modelo}">${escapeHtml(m.nombre)} (${m.marca || 'Sin marca'})</option>`
    ).join('');
    
    select.innerHTML = '<option value="">-- Selecciona un modelo --</option>' + html;
  },

  _render(lista) {
    lista = lista || [];
    setText('totalHerramientasLabel', `${lista.length} herramienta(s) registrada(s)`);
    const tbody = document.getElementById('bodyHerramientas');

    if (!lista.length) {
      tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state">
        <i class="bi bi-bookmark-x"></i><p>No hay herramientas registradas</p>
      </div></td></tr>`;
      return;
    }

    tbody.innerHTML = lista.map((h, i) => {
      const estadoClass = h.activo ? 'badge-exito' : 'badge-error';
      const estadoText = h.activo ? 'Activa' : 'Inactiva';
      return `
        <tr>
          <td><span style="font-family:'DM Mono',monospace;font-size:12px;color:var(--text-muted)">${String(i+1).padStart(2,'0')}</span></td>
          <td>
            <div class="d-flex align-items-center gap-2">
              <div style="width:32px;height:32px;background:var(--primary-light);border-radius:8px;display:flex;align-items:center;justify-content:center;color:var(--primary)">
                <i class="bi bi-wrench-adjustable-circle-fill"></i>
              </div>
              <div>
                <div class="fw-600" style="font-size:13px">${escapeHtml(h.codigo)}</div>
                <div style="font-size:11px;color:var(--text-muted)">${escapeHtml(h.numero_serie || 'Sin serie')}</div>
              </div>
            </div>
          </td>
          <td><span style="font-size:13px">${escapeHtml(h.modelo || 'Sin modelo')}</span></td>
          <td>
            <span class="badge-info" style="font-size:11px;text-transform:capitalize">${escapeHtml(h.condicion)}</span>
          </td>
          <td><span style="font-size:13px">${escapeHtml(h.ubicacion || '-')}</span></td>
          <td>
            <span class="${estadoClass}" style="font-size:11px">${estadoText}</span>
          </td>
          <td>
            <button class="btn-action btn-action-edit"   onclick="HerramientasModule.openEdit(${h.id_herramienta})"   title="Editar"><i class="bi bi-pencil-fill"></i></button>
            <button class="btn-action btn-action-delete" onclick="HerramientasModule.confirmDel(${h.id_herramienta},'${escapeHtml(h.codigo)}')" title="Eliminar"><i class="bi bi-trash3-fill"></i></button>
          </td>
        </tr>`;
    }).join('');
  },

  _filter() {
    const search = document.getElementById('searchHerramienta')?.value.toLowerCase() || '';
    const herramientas = AppState.herramientas || [];
    this._render(herramientas.filter(h =>
      h.codigo.toLowerCase().includes(search) ||
      (h.numero_serie && h.numero_serie.toLowerCase().includes(search)) ||
      (h.modelo && h.modelo.toLowerCase().includes(search))
    ));
  },

  /* ── Modal ───────────────────────────── */
  _openModal(mode, herramienta = null) {
    const isEdit = mode === 'edit';
    setText('modalHerramientaTitle', isEdit ? 'Editar Herramienta' : 'Nueva Herramienta');
    document.getElementById('herramientaId').value = isEdit ? herramienta.id_herramienta : '';
    document.getElementById('hCodigo').value = isEdit ? herramienta.codigo : '';
    document.getElementById('hNumeroSerie').value = isEdit ? herramienta.numero_serie || '' : '';
    document.getElementById('hModelo').value = isEdit ? herramienta.id_modelo : '';
    document.getElementById('hCondicion').value = isEdit ? herramienta.condicion : 'bueno';
    document.getElementById('hUbicacion').value = isEdit ? herramienta.ubicacion || '' : '';
    document.getElementById('hActivo').checked = isEdit ? herramienta.activo : true;
    this._renderModeloSelect();
    clearErrors(['hCodigo', 'hModelo']);
    openOverlay('modalHerramientaOverlay');
  },

  openEdit(id) {
    const herramienta = AppState.herramientas.find(h => h.id_herramienta === id);
    if (!herramienta) return showToast('Herramienta no encontrada', 'error');
    this._openModal('edit', herramienta);
  },

  confirmDel(id, codigo) {
    DeleteModal.open('herramienta', id, codigo, async () => {
      try {
        await http(`/api/herramientas/${id}`, 'DELETE');
        showToast(`"${codigo}" eliminada correctamente`, 'success');
        await this.load();
      } catch (e) {
        showToast(e.message, 'error');
      }
    });
  },

  async _save() {
    const id           = document.getElementById('herramientaId').value;
    const codigo       = document.getElementById('hCodigo').value.trim();
    const numeroSerie  = document.getElementById('hNumeroSerie').value.trim();
    const idModelo     = document.getElementById('hModelo').value;
    const condicion    = document.getElementById('hCondicion').value;
    const ubicacion    = document.getElementById('hUbicacion').value.trim();
    const activo       = document.getElementById('hActivo').checked;

    clearErrors(['hCodigo', 'hModelo']);

    if (!codigo) {
      setError('hCodigo','err-hCodigo','El código de la herramienta es requerido');
      return;
    }

    if (!idModelo) {
      setError('hModelo','err-hModelo','El modelo es requerido');
      return;
    }

    const isEdit = !!id;
    setLoading('btnSaveHerramienta','btnSaveHerramientaText','btnSaveHerramientaSpinner', true);
    try {
      await http(isEdit ? `/api/herramientas/${id}` : '/api/herramientas', isEdit ? 'PUT' : 'POST', {
        codigo,
        numero_serie: numeroSerie || null,
        id_modelo: parseInt(idModelo),
        condicion,
        ubicacion: ubicacion || null,
        activo: activo ? 1 : 0
      });
      showToast(`Herramienta ${isEdit ? 'actualizada' : 'creada'} correctamente`, 'success');
      closeOverlay('modalHerramientaOverlay');
      await this.load();
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setLoading('btnSaveHerramienta','btnSaveHerramientaText','btnSaveHerramientaSpinner', false);
    }
  },

  _bindEvents() {
    document.getElementById('btnNuevaHerramienta')?.addEventListener('click',    () => this._openModal('new'));
    document.getElementById('btnSaveHerramienta')?.addEventListener('click',     () => this._save());
    document.getElementById('btnCancelHerramienta')?.addEventListener('click',   () => closeOverlay('modalHerramientaOverlay'));
    document.getElementById('btnCloseModalHerramienta')?.addEventListener('click', () => closeOverlay('modalHerramientaOverlay'));
    document.getElementById('btnRefreshHerramientas')?.addEventListener('click', () => this.load());
    document.getElementById('searchHerramienta')?.addEventListener('input',      () => this._filter());
    document.getElementById('modalHerramientaOverlay')?.addEventListener('click', e => {
      if (e.target.id === 'modalHerramientaOverlay') closeOverlay('modalHerramientaOverlay');
    });
  },
};