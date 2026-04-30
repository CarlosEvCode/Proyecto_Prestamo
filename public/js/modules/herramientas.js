/**
 * modules/herramientas.js
 * Gestión de herramientas con búsqueda y filtros
 */

'use strict';

const HerramientasModule = {

  async init() {
    // Asegurar que modelos están cargados
    if (!AppState.modelos || !AppState.modelos.length) {
      try {
        const { data } = await http('/api/catalogos/modelos');
        AppState.modelos = data;
      } catch (e) {
        console.error('Error al cargar modelos:', e.message);
      }
    }

    this._bindEvents();
    await this.load();
  },

  async load() {
    document.getElementById('bodyHerramientas').innerHTML =
      `<tr><td colspan="7" class="text-center py-5"><div class="spinner-border text-primary spinner-border-sm" role="status"></div></td></tr>`;

    try {
      const { data } = await http('/api/herramientas');
      AppState.herramientas = data;
      this._render(data);
      updateBadges();
    } catch (e) {
      showToast('Error al cargar herramientas: ' + e.message, 'error');
    }
  },

  _render(lista) {
    lista = lista || [];
    setText('totalHerramientasLabel', `${lista.length} herramienta(s) encontrada(s)`);
    const tbody = document.getElementById('bodyHerramientas');

    if (!lista.length) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center py-5 text-muted">No hay herramientas registradas.</td></tr>`;
      return;
    }

    tbody.innerHTML = lista.map((tool, i) => {
      // Estilos para condición
      const condClass = {
        'bueno': 'bg-success bg-opacity-10 text-success fw-normal',
        'regular': 'bg-warning bg-opacity-10 text-warning fw-normal',
        'malo': 'bg-danger bg-opacity-10 text-danger fw-normal'
      }[tool.condicion] || 'bg-secondary bg-opacity-10 text-secondary fw-normal';

      // Estilos para estado (activo/inactivo)
      const statusBadge = tool.activo 
        ? '<span class="badge bg-success bg-opacity-10 text-success fw-normal">Activo</span>'
        : '<span class="badge bg-danger bg-opacity-10 text-danger fw-normal">Inactivo</span>';

      return `
        <tr style="border-bottom: 1px solid var(--border-color);">
          <td class="ps-4 fw-bold" style="color: var(--accent);">${String(i+1).padStart(2,'0')}</td>
          <td class="fw-bold">${escapeHtml(tool.codigo)}</td>
          <td>
            <div class="fw-bold">${escapeHtml(tool.modelo_nombre || 'N/A')}</div>
            <div class="text-muted text-xs">${escapeHtml(tool.marca_nombre || '—')}</div>
          </td>
          <td><span class="badge ${condClass}">${tool.condicion.toUpperCase()}</span></td>
          <td class="text-muted">${escapeHtml(tool.ubicacion || '—')}</td>
          <td class="text-center">${statusBadge}</td>
          <td class="pe-4 text-end">
            <div class="d-flex justify-content-end gap-2">
              <button class="btn btn-sm btn-dark" style="border: 1px solid var(--border-color);" onclick="HerramientasModule.openEdit(${tool.id_herramienta})" title="Editar"><i class="bi bi-pencil text-muted"></i></button>
              <button class="btn btn-sm btn-dark" style="border: 1px solid var(--border-color);" onclick="HerramientasModule.confirmDel(${tool.id_herramienta},'${escapeHtml(tool.codigo)}')" title="Eliminar"><i class="bi bi-trash text-danger"></i></button>
            </div>
          </td>
        </tr>`;
    }).join('');
  },

  _filter() {
    const search = document.getElementById('searchHerramientas')?.value.toLowerCase() || '';
    const condicion = document.getElementById('filterCondicion')?.value || '';
    const estado = document.getElementById('filterEstado')?.value || '';
    const herramientas = AppState.herramientas || [];

    this._render(herramientas.filter(h =>
      (!search ||
        (h.codigo && h.codigo.toLowerCase().includes(search)) ||
        (h.modelo_nombre && h.modelo_nombre.toLowerCase().includes(search)) ||
        (h.marca_nombre && h.marca_nombre.toLowerCase().includes(search)) ||
        (h.ubicacion && h.ubicacion.toLowerCase().includes(search))) &&
      (!condicion || h.condicion === condicion) &&
      (!estado || (estado === 'activo' ? h.activo : !h.activo))
    ));
  },

  _bindEvents() {
    // Búsqueda
    document.getElementById('searchHerramientas')?.addEventListener('input', () => this._filter());
    
    // Filtro por condición
    document.getElementById('filterCondicion')?.addEventListener('change', () => this._filter());
    
    // Filtro por estado (activo/inactivo)
    document.getElementById('filterEstado')?.addEventListener('change', () => this._filter());

    // Botón de actualizar
    document.getElementById('btnRefreshHerramientas')?.addEventListener('click', () => this.load());

    // Modal
    document.querySelector('button.btn-primary')?.addEventListener('click', () => this._openModal('create'));
    document.getElementById('btnCancelHerramienta')?.addEventListener('click', () => closeOverlay('modalHerramientaOverlay'));
    document.getElementById('btnCloseModalHerramienta')?.addEventListener('click', () => closeOverlay('modalHerramientaOverlay'));
    document.getElementById('btnSaveHerramienta')?.addEventListener('click', () => this._save());
  },

  /* ── Modal ───────────────────────────── */
  _openModal(mode, herramienta = null) {
    const isEdit = mode === 'edit';
    setText('modalHerramientaTitle', isEdit ? 'Editar Herramienta' : 'Nueva Herramienta');

    // Limpiar
    ['herramientaId', 'hCodigo', 'hNumeroSerie', 'hModelo', 'hCondicion', 'hUbicacion', 'hActivo']
      .forEach(id => { const el = document.getElementById(id); if(el) el.value = ''; });
    clearErrors(['hCodigo', 'hModelo', 'hCondicion']);

    // Poblar select modelos
    const selModelo = document.getElementById('hModelo');
    selModelo.innerHTML = `<option value="">-- Selecciona un modelo --</option>` +
      (AppState.modelos || []).map(m =>
        `<option value="${m.id_modelo}">${escapeHtml(m.nombre)} (${escapeHtml(m.marca_nombre || 'Sin marca')})</option>`
      ).join('');

    if (isEdit && herramienta) {
      document.getElementById('herramientaId').value = herramienta.id_herramienta;
      document.getElementById('hCodigo').value = herramienta.codigo || '';
      document.getElementById('hNumeroSerie').value = herramienta.numero_serie || '';
      document.getElementById('hModelo').value = herramienta.id_modelo || '';
      document.getElementById('hCondicion').value = herramienta.condicion || '';
      document.getElementById('hUbicacion').value = herramienta.ubicacion || '';
      document.getElementById('hActivo').value = herramienta.activo ? '1' : '0';
    } else {
      document.getElementById('hActivo').value = '1'; // Por defecto activo
    }

    openOverlay('modalHerramientaOverlay');
  },

  async openEdit(id) {
    try {
      const { data } = await http(`/api/herramientas/${id}`);
      this._openModal('edit', data);
    } catch (e) {
      showToast('No se pudo cargar la herramienta: ' + e.message, 'error');
    }
  },

  confirmDel(id, codigo) {
    DeleteModal.open('herramienta', id, codigo, async () => {
      try {
        await http(`/api/herramientas/${id}`, 'DELETE');
        showToast('Herramienta eliminada correctamente', 'success');
        this.load();
      } catch (e) {
        showToast('Error al eliminar: ' + e.message, 'error');
      }
    });
  },

  _validate() {
    const errors = {};

    if (!document.getElementById('hCodigo').value.trim()) {
      errors.hCodigo = 'El código es requerido';
    }
    if (!document.getElementById('hModelo').value) {
      errors.hModelo = 'Debe seleccionar un modelo';
    }
    if (!document.getElementById('hCondicion').value) {
      errors.hCondicion = 'Debe seleccionar una condición';
    }

    if (Object.keys(errors).length) {
      Object.entries(errors).forEach(([field, msg]) => setError(field, 'err-' + field, msg));
      return false;
    }
    return true;
  },

  async _save() {
    if (!this._validate()) return;

    const btn = document.getElementById('btnSaveHerramienta');
    const btnText = document.getElementById('btnSaveHerramientaText');
    const btnSpinner = document.getElementById('btnSaveHerramientaSpinner');

    btn.disabled = true;
    btnText.classList.add('d-none');
    btnSpinner.classList.remove('d-none');

    try {
      const id = document.getElementById('herramientaId').value;
      const payload = {
        codigo: document.getElementById('hCodigo').value,
        numero_serie: document.getElementById('hNumeroSerie').value || null,
        id_modelo: parseInt(document.getElementById('hModelo').value),
        condicion: document.getElementById('hCondicion').value,
        ubicacion: document.getElementById('hUbicacion').value || null,
        activo: parseInt(document.getElementById('hActivo').value) === 1
      };

      if (id) {
        await http(`/api/herramientas/${id}`, 'PUT', payload);
        showToast('Herramienta actualizada correctamente', 'success');
      } else {
        await http('/api/herramientas', 'POST', payload);
        showToast('Herramienta creada correctamente', 'success');
      }

      closeOverlay('modalHerramientaOverlay');
      this.load();
    } catch (e) {
      showToast('Error: ' + e.message, 'error');
    } finally {
      btn.disabled = false;
      btnText.classList.remove('d-none');
      btnSpinner.classList.add('d-none');
    }
  }
};

window.HerramientasModule = HerramientasModule;
