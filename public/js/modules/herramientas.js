/**
 * modules/herramientas.js
 * Gestión de herramientas con búsqueda y filtros
 */

'use strict';

const HerramientasModule = {

  async init() {
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
              <button class="btn btn-sm btn-dark" style="border: 1px solid var(--border-color);" title="Editar"><i class="bi bi-pencil text-muted"></i></button>
              <button class="btn btn-sm btn-dark" style="border: 1px solid var(--border-color);" title="Eliminar"><i class="bi bi-trash text-danger"></i></button>
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
  }
};

window.HerramientasModule = HerramientasModule;
