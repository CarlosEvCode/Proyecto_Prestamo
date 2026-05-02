/**
 * modules/prestamos.js
 * Gestión de préstamos con lógica de entrega y devolución
 */

'use strict';

const PrestamosModule = {

  async init() {
    // Asegurar que trabajadores y herramientas están cargadas en AppState
    if (!AppState.trabajadores.length) {
      try {
        const { data } = await http('/api/trabajadores');
        AppState.trabajadores = data;
      } catch (e) { console.error('Error al cargar trabajadores:', e.message); }
    }
    if (!AppState.herramientas.length) {
      try {
        const { data } = await http('/api/herramientas');
        AppState.herramientas = data;
      } catch (e) { console.error('Error al cargar herramientas:', e.message); }
    }

    this._bindEvents();
    await this.load();
  },

  async load() {
    const tbody = document.getElementById('bodyPrestamos');
    tbody.innerHTML = `<tr><td colspan="6" class="text-center py-5"><div class="spinner-border text-primary spinner-border-sm" role="status"></div></td></tr>`;

    try {
      const { data } = await http('/api/prestamos');
      AppState.prestamos = data;
      this._render(data);
    } catch (e) {
      showToast('Error al cargar préstamos: ' + e.message, 'error');
    }
  },

  _render(lista) {
    lista = lista || [];
    setText('totalPrestamosLabel', `${lista.length} préstamo(s) encontrado(s)`);
    const tbody = document.getElementById('bodyPrestamos');

    if (!lista.length) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center py-5 text-muted">No hay préstamos registrados.</td></tr>`;
      return;
    }

    tbody.innerHTML = lista.map((p, i) => {
      const estadoClass = {
        'activo': 'badge bg-primary bg-opacity-10 text-primary fw-normal',
        'devuelto': 'badge bg-success bg-opacity-10 text-success fw-normal',
        'vencido': 'badge bg-danger bg-opacity-10 text-danger fw-normal'
      }[p.estado] || 'badge bg-secondary bg-opacity-10 text-secondary fw-normal';
      
      return `
        <tr style="border-bottom: 1px solid var(--border-color);">
          <td class="ps-4 text-muted text-xs">${String(i + 1).padStart(2, '0')}</td>
          <td>
            <div class="fw-bold text-white">${escapeHtml(p.trabajador_nombre || 'Sin trabajador')}</div>
            <div class="text-muted text-xs">${escapeHtml(p.motivo || '—')}</div>
          </td>
          <td>
            <div class="text-white">${new Date(p.fecha_salida).toLocaleDateString('es-PE')}</div>
            <div class="text-muted text-xs">${new Date(p.fecha_salida).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
          </td>
          <td>
            <div class="text-xs text-muted">Esp: ${p.fecha_devolucion_esperada ? new Date(p.fecha_devolucion_esperada).toLocaleDateString('es-PE') : '—'}</div>
            <div class="text-xs text-success">Real: ${p.fecha_devolucion_real ? new Date(p.fecha_devolucion_real).toLocaleDateString('es-PE') : '—'}</div>
          </td>
          <td class="text-center"><span class="${estadoClass}">${p.estado.toUpperCase()}</span></td>
          <td class="pe-4 text-end">
            <div class="d-flex justify-content-end gap-2">
              <button class="btn btn-sm btn-dark" onclick="PrestamosModule.openEdit(${p.id_prestamo})" title="Editar"><i class="bi bi-pencil text-muted"></i></button>
              ${p.estado === 'activo' ? `<button class="btn btn-sm btn-dark text-success" onclick="PrestamosModule.openDevolucion(${JSON.stringify(p).replace(/"/g, '&quot;')})" title="Registrar devolución"><i class="bi bi-check2-circle"></i></button>` : ''}
              <button class="btn btn-sm btn-dark" onclick="PrestamosModule.confirmDel(${p.id_prestamo},'${escapeHtml(p.trabajador_nombre || 'Préstamo')}')" title="Eliminar"><i class="bi bi-trash text-danger"></i></button>
            </div>
          </td>
        </tr>`;
    }).join('');
  },

  _filter() {
    const search = document.getElementById('searchPrestamo')?.value.toLowerCase() || '';
    const estado = document.getElementById('filterEstado')?.value || '';
    const prestamos = AppState.prestamos || [];
    
    this._render(prestamos.filter(p =>
      (!search || 
        (p.trabajador_nombre && p.trabajador_nombre.toLowerCase().includes(search)) ||
        (p.motivo && p.motivo.toLowerCase().includes(search))) &&
      (!estado || p.estado === estado)
    ));
  },

  _openModal(mode, prestamo = null) {
    const isEdit = mode === 'edit';
    setText('modalPrestamosTitle', isEdit ? 'Editar Préstamo' : 'Nuevo Préstamo');

    document.getElementById('formPrestamos').reset();
    document.getElementById('prestamoId').value = '';
    clearErrors(['pTrabajador', 'pHerramienta', 'pEstado']);

    // Poblar select trabajadores
    const selTrab = document.getElementById('pTrabajador');
    selTrab.innerHTML = `<option value="">-- Selecciona un trabajador --</option>` +
      (AppState.trabajadores || []).map(t => 
        `<option value="${t.id_trabajador}">${escapeHtml(t.nombre_completo)}</option>`
      ).join('');
    
    // Poblar select herramientas
    const selHerr = document.getElementById('pHerramienta');
    selHerr.innerHTML = `<option value="">-- Selecciona una herramienta --</option>` +
      (AppState.herramientas || []).filter(h => isEdit || h.activo).map(h => 
        `<option value="${h.id_herramienta}">${escapeHtml(h.codigo)} - ${escapeHtml(h.modelo_nombre || 'Sin modelo')}</option>`
      ).join('');

    if (isEdit && prestamo) {
      document.getElementById('prestamoId').value = prestamo.id_prestamo;
      document.getElementById('pTrabajador').value = prestamo.id_trabajador || '';
      document.getElementById('pHerramienta').value = prestamo.id_herramienta || '';
      document.getElementById('pMotivo').value = prestamo.motivo || '';
      document.getElementById('pFechaDev').value = prestamo.fecha_devolucion_esperada ? prestamo.fecha_devolucion_esperada.split('T')[0] : '';
      document.getElementById('pEstado').value = prestamo.estado || '';
    } else {
      document.getElementById('pEstado').value = 'activo';
    }

    openOverlay('modalPrestamosOverlay');
  },

  async openEdit(id) {
    try {
      const { data } = await http(`/api/prestamos/${id}`);
      this._openModal('edit', data);
    } catch (e) {
      showToast('Error al cargar préstamo: ' + e.message, 'error');
    }
  },

  openDevolucion(p) {
    document.getElementById('dPrestamoId').value = p.id_prestamo;
    document.getElementById('dHerramientaId').value = p.id_herramienta;
    document.getElementById('dHerramientaNombre').value = p.herramienta_codigo || 'Herramienta';
    document.getElementById('dCondicion').value = 'bueno';
    document.getElementById('dFechaReal').value = new Date().toISOString().split('T')[0];
    openOverlay('modalDevolucionOverlay');
  },

  async saveDevolucion() {
    const id = document.getElementById('dPrestamoId').value;
    const body = {
      id_herramienta: document.getElementById('dHerramientaId').value,
      condicion_devolucion: document.getElementById('dCondicion').value,
      fecha_devolucion_real: document.getElementById('dFechaReal').value
    };

    setLoading('btnSaveDevolucion', 'btnSaveDevolucionText', 'btnSaveDevolucionSpinner', true);
    try {
      await http(`/api/prestamos/${id}/devolucion`, 'PUT', body);
      showToast('Devolución registrada correctamente', 'success');
      closeOverlay('modalDevolucionOverlay');
      await this.load();
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setLoading('btnSaveDevolucion', 'btnSaveDevolucionText', 'btnSaveDevolucionSpinner', false);
    }
  },

  async _save() {
    if (!this._validate()) return;

    setLoading('btnSavePrestamo', 'btnSavePrestamoText', 'btnSavePrestamoSpinner', true);
    try {
      const id = document.getElementById('prestamoId').value;
      const body = {
        id_trabajador: document.getElementById('pTrabajador').value,
        id_herramienta: document.getElementById('pHerramienta').value,
        motivo: document.getElementById('pMotivo').value.trim() || null,
        fecha_devolucion_esperada: document.getElementById('pFechaDev').value || null,
        estado: document.getElementById('pEstado').value
      };

      await http(id ? `/api/prestamos/${id}` : '/api/prestamos', id ? 'PUT' : 'POST', body);
      showToast(`Préstamo ${id ? 'actualizado' : 'creado'} correctamente`, 'success');
      closeOverlay('modalPrestamosOverlay');
      await this.load();
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setLoading('btnSavePrestamo', 'btnSavePrestamoText', 'btnSavePrestamoSpinner', false);
    }
  },

  _validate() {
    clearErrors(['pTrabajador', 'pHerramienta', 'pEstado']);
    let ok = true;
    if (!document.getElementById('pTrabajador').value) { setError('pTrabajador', 'err-pTrabajador', 'Seleccione un trabajador'); ok = false; }
    if (!document.getElementById('pHerramienta').value) { setError('pHerramienta', 'err-pHerramienta', 'Seleccione una herramienta'); ok = false; }
    if (!document.getElementById('pEstado').value) { setError('pEstado', 'err-pEstado', 'Seleccione un estado'); ok = false; }
    return ok;
  },

  confirmDel(id, name) {
    DeleteModal.open('préstamo', id, name, async () => {
      try {
        await http(`/api/prestamos/${id}`, 'DELETE');
        showToast('Préstamo eliminado correctamente', 'success');
        await this.load();
      } catch (e) {
        showToast(e.message, 'error');
      }
    });
  },

  _bindEvents() {
    document.getElementById('btnNuevoPrestamo')?.addEventListener('click', () => this._openModal('new'));
    document.getElementById('btnRefreshPrestamos')?.addEventListener('click', () => this.load());
    document.getElementById('searchPrestamo')?.addEventListener('input', () => this._filter());
    document.getElementById('filterEstado')?.addEventListener('change', () => this._filter());
    
    document.getElementById('btnSavePrestamo')?.addEventListener('click', () => this._save());
    document.getElementById('btnCancelPrestamo')?.addEventListener('click', () => closeOverlay('modalPrestamosOverlay'));
    document.getElementById('btnCloseModalPrestamos')?.addEventListener('click', () => closeOverlay('modalPrestamosOverlay'));

    document.getElementById('btnSaveDevolucion')?.addEventListener('click', () => this.saveDevolucion());
    document.getElementById('btnCancelDevolucion')?.addEventListener('click', () => closeOverlay('modalDevolucionOverlay'));
    document.getElementById('btnCloseModalDevolucion')?.addEventListener('click', () => closeOverlay('modalDevolucionOverlay'));

    document.getElementById('modalPrestamosOverlay')?.addEventListener('click', e => {
      if (e.target.id === 'modalPrestamosOverlay') closeOverlay('modalPrestamosOverlay');
    });
    document.getElementById('modalDevolucionOverlay')?.addEventListener('click', e => {
      if (e.target.id === 'modalDevolucionOverlay') closeOverlay('modalDevolucionOverlay');
    });
  }
};

window.PrestamosModule = PrestamosModule;
