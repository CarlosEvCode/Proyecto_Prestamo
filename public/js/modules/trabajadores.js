/**
 * modules/trabajadores.js
 * Gestión de personal con CRUD y filtros
 */

'use strict';

const Trabajadores = {
  
  async init() {
    // Asegurar que las áreas están cargadas
    try {
        const { data } = await http('/api/catalogos/areas');
        AppState.areas = data || [];
    } catch (e) {
        console.error('Error al cargar áreas:', e.message);
        AppState.areas = []; // Evitar null
    }

    this._bindEvents();
    await this.load();
    this._populateAreasSelect();
  },

  async load() {
    const tbody = document.getElementById('tabla-trabajadores');
    tbody.innerHTML = `<tr><td colspan="7" class="text-center py-5"><div class="spinner-border text-primary spinner-border-sm" role="status"></div></td></tr>`;

    try {
      const { data } = await http('/api/trabajadores');
      AppState.trabajadores = data;
      this._render(data);
    } catch (e) {
      showToast('Error al cargar trabajadores: ' + e.message, 'error');
    }
  },

  _render(lista) {
    lista = lista || [];
    setText('totalTrabajadoresLabel', `${lista.length} trabajador(es) encontrado(s)`);
    const tbody = document.getElementById('tabla-trabajadores');

    if (!lista.length) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center py-5 text-muted">No hay trabajadores registrados.</td></tr>`;
      return;
    }

    tbody.innerHTML = lista.map((t, i) => `
      <tr style="border-bottom: 1px solid var(--border-color);">
        <td class="ps-4 text-muted text-xs">${String(i + 1).padStart(2, '0')}</td>
        <td class="fw-600" style="color: var(--accent);">${escapeHtml(t.dni)}</td>
        <td class="fw-bold text-white">${escapeHtml(t.nombre_completo)}</td>
        <td class="text-muted text-sm">${escapeHtml(t.cargo || '—')}</td>
        <td>
          <span class="px-2 py-1 rounded text-xs bg-dark text-muted fw-600" style="border: 1px solid var(--border-color);">
            ${escapeHtml(t.area_nombre || 'Sin Área')}
          </span>
        </td>
        <td class="text-muted text-sm">${escapeHtml(t.turno || '—')}</td>
        <td class="pe-4 text-end">
          <div class="d-flex justify-content-end gap-2">
            <button class="btn btn-sm btn-dark" style="border: 1px solid var(--border-color);" onclick="Trabajadores.openEdit(${t.id_trabajador})" title="Editar"><i class="bi bi-pencil text-muted"></i></button>
            <button class="btn btn-sm btn-dark" style="border: 1px solid var(--border-color);" onclick="Trabajadores.confirmDel(${t.id_trabajador},'${escapeHtml(t.nombre_completo)}')" title="Eliminar"><i class="bi bi-trash text-danger"></i></button>
          </div>
        </td>
      </tr>
    `).join('');
  },

  _filter() {
    const search = document.getElementById('searchTrabajador')?.value.toLowerCase() || '';
    const areaId = document.getElementById('filterArea')?.value || '';
    const lista = AppState.trabajadores || [];

    this._render(lista.filter(t => 
      (!search || 
        t.nombre_completo.toLowerCase().includes(search) || 
        t.dni.toLowerCase().includes(search) ||
        (t.cargo && t.cargo.toLowerCase().includes(search))
      ) &&
      (!areaId || String(t.id_area) === areaId)
    ));
  },

  _bindEvents() {
    document.getElementById('searchTrabajador')?.addEventListener('input', () => this._filter());
    document.getElementById('filterArea')?.addEventListener('change', () => this._filter());
    document.getElementById('btnRefreshTrabajadores')?.addEventListener('click', () => this.load());
    document.getElementById('btnNuevoTrabajador')?.addEventListener('click', () => this._openModal('create'));
    document.getElementById('btnCancelTrabajador')?.addEventListener('click', () => closeOverlay('modalTrabajadorOverlay'));
    document.getElementById('btnCloseModalTrabajador')?.addEventListener('click', () => closeOverlay('modalTrabajadorOverlay'));
    document.getElementById('btnSaveTrabajador')?.addEventListener('click', () => this._save());
  },

  _populateAreasSelect() {
    const filter = document.getElementById('filterArea');
    const modalSelect = document.getElementById('tArea');
    const options = (AppState.areas || []).map(a => `<option value="${a.id_area}">${escapeHtml(a.nombre)}</option>`).join('');
    
    if (filter) filter.innerHTML = '<option value="">Todas las Áreas</option>' + options;
    if (modalSelect) modalSelect.innerHTML = '<option value="">-- Seleccionar área --</option>' + options;
  },

  _openModal(mode, trabajador = null) {
    const isEdit = mode === 'edit';
    setText('modalTrabajadorTitle', isEdit ? 'Editar Trabajador' : 'Nuevo Trabajador');

    document.getElementById('formTrabajador').reset();
    document.getElementById('trabajadorId').value = '';
    clearErrors(['tDni', 'tNombre', 'tArea']);

    if (isEdit && trabajador) {
      document.getElementById('trabajadorId').value = trabajador.id_trabajador;
      document.getElementById('tDni').value = trabajador.dni || '';
      document.getElementById('tNombre').value = trabajador.nombre_completo || '';
      document.getElementById('tCargo').value = trabajador.cargo || '';
      document.getElementById('tTurno').value = trabajador.turno || '';
      document.getElementById('tArea').value = trabajador.id_area || '';
    }

    openOverlay('modalTrabajadorOverlay');
  },

  async openEdit(id) {
    try {
      const { data } = await http(`/api/trabajadores/${id}`);
      this._openModal('edit', data);
    } catch (e) {
      showToast('No se pudo cargar el trabajador: ' + e.message, 'error');
    }
  },

  confirmDel(id, nombre) {
    DeleteModal.open('trabajador', id, nombre, async () => {
      try {
        await http(`/api/trabajadores/${id}`, 'DELETE');
        showToast('Trabajador eliminado correctamente', 'success');
        this.load();
      } catch (e) {
        showToast('Error al eliminar: ' + e.message, 'error');
      }
    });
  },

  async _save() {
    if (!this._validate()) return;

    setLoading('btnSaveTrabajador', 'btnSaveTrabajadorText', 'btnSaveTrabajadorSpinner', true);

    try {
      const id = document.getElementById('trabajadorId').value;
      const payload = {
        dni: document.getElementById('tDni').value.trim(),
        nombre_completo: document.getElementById('tNombre').value.trim(),
        cargo: document.getElementById('tCargo').value.trim() || null,
        turno: document.getElementById('tTurno').value || null,
        id_area: parseInt(document.getElementById('tArea').value)
      };

      if (id) {
        await http(`/api/trabajadores/${id}`, 'PUT', payload);
        showToast('Trabajador actualizado correctamente', 'success');
      } else {
        await http('/api/trabajadores', 'POST', payload);
        showToast('Trabajador creado correctamente', 'success');
      }

      closeOverlay('modalTrabajadorOverlay');
      this.load();
    } catch (e) {
      showToast('Error: ' + e.message, 'error');
    } finally {
      setLoading('btnSaveTrabajador', 'btnSaveTrabajadorText', 'btnSaveTrabajadorSpinner', false);
    }
  },

  _validate() {
    clearErrors(['tDni', 'tNombre', 'tArea']);
    let ok = true;
    if (!document.getElementById('tDni').value.trim()) { setError('tDni', 'err-tDni', 'El DNI es requerido'); ok = false; }
    if (!document.getElementById('tNombre').value.trim()) { setError('tNombre', 'err-tNombre', 'El nombre es requerido'); ok = false; }
    if (!document.getElementById('tArea').value) { setError('tArea', 'err-tArea', 'Selecciona un área'); ok = false; }
    return ok;
  }
};

window.Trabajadores = Trabajadores;
