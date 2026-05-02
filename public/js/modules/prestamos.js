/**
 * modules/prestamos.js
 * Solo conoce el DOM de views/prestamos.html
 */

'use strict';

const PrestamosModule = {

  async init() {
    // Asegurar que trabajadores y herramientas están cargadas
    if (!AppState.trabajadores.length) {
      const { data } = await http('/api/trabajadores');
      AppState.trabajadores = data;
      updateBadges();
    }
    if (!AppState.herramientas.length) {
      const { data } = await http('/api/herramientas');
      AppState.herramientas = data;
      updateBadges();
    }

    this._bindEvents();
    await this.load();
  },

  async load() {
    document.getElementById('bodyPrestamos').innerHTML =
      `<tr><td colspan="8" class="text-center py-5"><div class="spinner-border text-primary spinner-border-sm" role="status"></div></td></tr>`;

    try {
      const { data } = await http('/api/prestamos');
      AppState.prestamos = data;
      this._render(data);
      updateBadges();
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
      // Estilos para estado
      const estadoClass = {
        'activo': 'badge bg-success bg-opacity-10 text-success fw-normal',
        'devuelto': 'badge bg-info bg-opacity-10 text-info fw-normal',
        'vencido': 'badge bg-danger bg-opacity-10 text-danger fw-normal'
      }[p.estado] || 'badge bg-secondary bg-opacity-10 text-secondary fw-normal';
      
      return `
        <tr style="border-bottom: 1px solid var(--border-color);">
          <td class="ps-4 fw-bold" style="color: var(--accent);">${String(i+1).padStart(2,'0')}</td>
          <td>
            <div class="fw-bold">${escapeHtml(p.trabajador_nombre || 'Sin trabajador')}</div>
            <div class="text-muted text-xs">${escapeHtml(p.motivo || '—')}</div>
          </td>
          <td>${new Date(p.fecha_salida).toLocaleDateString('es-PE')}</td>
          <td>
            <div class="text-xs"><small>Esp: ${p.fecha_devolucion_esperada ? new Date(p.fecha_devolucion_esperada).toLocaleDateString('es-PE') : '—'}</small></div>
            <div class="text-xs text-muted"><small>Real: ${p.fecha_devolucion_real ? new Date(p.fecha_devolucion_real).toLocaleDateString('es-PE') : '—'}</small></div>
          </td>
          <td class="text-center"><span class="${estadoClass}">${p.estado.toUpperCase()}</span></td>
          <td class="pe-4 text-end">
            <div class="d-flex justify-content-end gap-2">
              <button class="btn btn-sm btn-dark" style="border: 1px solid var(--border-color);" onclick="PrestamosModule.openEdit(${p.id_prestamo})" title="Editar"><i class="bi bi-pencil text-muted"></i></button>
              <button class="btn btn-sm btn-dark" style="border: 1px solid var(--border-color);" onclick="PrestamosModule.confirmDel(${p.id_prestamo},'${escapeHtml(p.trabajador_nombre || 'Préstamo')}')" title="Eliminar"><i class="bi bi-trash text-danger"></i></button>
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

  /* ── Modal ───────────────────────────── */
  _openModal(mode, prestamo = null) {
    const isEdit = mode === 'edit';
    setText('modalPrestamosTitle', isEdit ? 'Editar Préstamo' : 'Nuevo Préstamo');

    // Limpiar
    ['prestamoId','pTrabajador','pHerramienta','pMotivo','pFechaDev','pEstado']
      .forEach(id => { const el = document.getElementById(id); if(el) el.value = ''; });
    clearErrors(['pTrabajador','pHerramienta','pEstado']);

    // Poblar select trabajadores
    const selTrab = document.getElementById('pTrabajador');
    const prestamoTrabajadorId = isEdit ? parseInt(prestamo.id_trabajador) : null;
    
    selTrab.innerHTML = `<option value="">-- Selecciona un trabajador --</option>` +
      (AppState.trabajadores || []).map(t => 
        `<option value="${t.id_trabajador}" ${isEdit && parseInt(t.id_trabajador) === prestamoTrabajadorId ? 'selected' : ''}>${escapeHtml(t.nombre_completo)}</option>`
      ).join('');
    
    // Poblar select herramientas
    const selHerr = document.getElementById('pHerramienta');
    let herramientasOpciones = AppState.herramientas || [];
    
    // En edición, permitir TODAS las herramientas (incluso inactivas) para poder seleccionar la actual
    // En creación, solo mostrar activas
    if (!isEdit) {
      herramientasOpciones = herramientasOpciones.filter(h => h.activo);
    }
    
    const prestamoHerramientaId = isEdit ? parseInt(prestamo.id_herramienta) : null;
    
    selHerr.innerHTML = `<option value="">-- Selecciona una herramienta --</option>` +
      herramientasOpciones.map(h => {
        const idHerr = parseInt(h.id_herramienta);
        const isSelected = isEdit && idHerr === prestamoHerramientaId;
        const inactiveLabel = !h.activo ? ' (Inactiva)' : '';
        return `<option value="${idHerr}" ${isSelected ? 'selected' : ''}>${escapeHtml(h.codigo)} - ${escapeHtml(h.modelo_nombre || 'Sin modelo')}${inactiveLabel}</option>`;
      }).join('');
    
    // Poblar select estado
    const selEstado = document.getElementById('pEstado');
    if (isEdit) {
      // Convertir a minúsculas por si acaso
      selEstado.value = (prestamo.estado || '').toLowerCase();
    } else {
      selEstado.value = '';
    }

    if (isEdit) {
      document.getElementById('prestamoId').value = prestamo.id_prestamo;
      document.getElementById('pMotivo').value = prestamo.motivo || '';
      document.getElementById('pFechaDev').value = prestamo.fecha_devolucion_esperada ? prestamo.fecha_devolucion_esperada.split('T')[0] : '';
    }

    openOverlay('modalPrestamosOverlay');
  },

  async openEdit(id) {
    try {
      const { data } = await http(`/api/prestamos/${id}`);
      this._openModal('edit', data);
    } catch (e) {
      showToast('No se pudo cargar el préstamo: ' + e.message, 'error');
    }
  },

  confirmDel(id, name) {
    DeleteModal.open('préstamo', id, name, async () => {
      try {
        await http(`/api/prestamos/${id}`, 'DELETE');
        showToast(`"${name}" eliminado correctamente`, 'success');
        await this.load();
      } catch (e) {
        showToast(e.message, 'error');
      }
    });
  },

  async _save() {
    if (!this._validate()) return;

    const id = document.getElementById('prestamoId').value;
    const isEdit = !!id;
    const body = {
      id_trabajador: document.getElementById('pTrabajador').value,
      id_herramienta: document.getElementById('pHerramienta').value,
      motivo: document.getElementById('pMotivo').value.trim() || null,
      fecha_devolucion_esperada: document.getElementById('pFechaDev').value || null,
      estado: document.getElementById('pEstado').value,
    };

    setLoading('btnSavePrestamo', 'btnSavePrestamoText', 'btnSavePrestamoSpinner', true);
    try {
      await http(isEdit ? `/api/prestamos/${id}` : '/api/prestamos', isEdit ? 'PUT' : 'POST', body);
      showToast(`Préstamo ${isEdit ? 'actualizado' : 'creado'} correctamente`, 'success');
      closeOverlay('modalPrestamosOverlay');
      await this.load();
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setLoading('btnSavePrestamo', 'btnSavePrestamoText', 'btnSavePrestamoSpinner', false);
    }
  },

  _validate() {
    clearErrors(['pTrabajador','pHerramienta','pEstado']);
    let ok = true;
    if (!document.getElementById('pTrabajador').value)
      { setError('pTrabajador','err-pTrabajador','Selecciona un trabajador'); ok = false; }
    if (!document.getElementById('pHerramienta').value)
      { setError('pHerramienta','err-pHerramienta','Selecciona una herramienta'); ok = false; }
    if (!document.getElementById('pEstado').value)
      { setError('pEstado','err-pEstado','Selecciona un estado'); ok = false; }
    return ok;
  },

  /* ── Listeners ── */
  _bindEvents() {
    document.getElementById('btnNuevoPrestamo')?.addEventListener('click', () => {
      if (!AppState.trabajadores.length || !AppState.herramientas.length) {
        showToast('No hay datos disponibles. Verifica trabajadores y herramientas.', 'info');
        return;
      }
      this._openModal('new');
    });

    document.getElementById('btnSavePrestamo')?.addEventListener('click', () => this._save());
    
    document.getElementById('btnCancelPrestamo')?.addEventListener('click', () => {
      closeOverlay('modalPrestamosOverlay');
    });
    
    document.getElementById('btnCloseModalPrestamos')?.addEventListener('click', () => {
      closeOverlay('modalPrestamosOverlay');
    });
    
    document.getElementById('btnRefreshPrestamos')?.addEventListener('click', () => this.load());
    document.getElementById('btnSaveDevolucion')?.addEventListener('click', () => this.saveDevolucion());
    document.getElementById('btnCancelDevolucion')?.addEventListener('click', () => closeOverlay('modalDevolucionOverlay'));
    document.getElementById('btnCloseModalDevolucion')?.addEventListener('click', () => closeOverlay('modalDevolucionOverlay'));
    document.getElementById('searchPrestamo')?.addEventListener('input', () => this._filter());
    document.getElementById('filterEstado')?.addEventListener('change', () => this._filter());
    document.getElementById('modalPrestamosOverlay')?.addEventListener('click', e => {
      if (e.target.id === 'modalPrestamosOverlay') closeOverlay('modalPrestamosOverlay');
    });
  },
};

un estado'); ok = false; }
    return ok;
  },

  /* ── Listeners ── */
  _bindEvents() {
    document.getElementById('btnNuevoPrestamo')?.addEventListener('click', () => {
      if (!AppState.trabajadores.length || !AppState.herramientas.length) {
        showToast('No hay datos disponibles. Verifica trabajadores y herramientas.', 'info');
        return;
      }
      this._openModal('new');
    });

    document.getElementById('btnSavePrestamo')?.addEventListener('click', () => this._save());
    
    document.getElementById('btnCancelPrestamo')?.addEventListener('click', () => {
      closeOverlay('modalPrestamosOverlay');
    });
    
    document.getElementById('btnCloseModalPrestamos')?.addEventListener('click', () => {
      closeOverlay('modalPrestamosOverlay');
    });
    
    document.getElementById('btnRefreshPrestamos')?.addEventListener('click', () => this.load());
    document.getElementById('searchPrestamo')?.addEventListener('input', () => this._filter());
    document.getElementById('filterEstado')?.addEventListener('change', () => this._filter());
    document.getElementById('modalPrestamosOverlay')?.addEventListener('click', e => {
      if (e.target.id === 'modalPrestamosOverlay') closeOverlay('modalPrestamosOverlay');
    });
  },
};

