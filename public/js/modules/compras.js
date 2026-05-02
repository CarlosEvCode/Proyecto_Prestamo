/**
 * modules/compras.js
 * Gestión masiva de ingreso de herramientas
 */

'use strict';

const Compras = {
  items: [], // Array de filas dinámicas

  async init() {
    // Asegurar datos necesarios
    if (!AppState.modelos.length) {
      const { data } = await http('/api/catalogos/modelos');
      AppState.modelos = data;
    }
    if (!AppState.proveedores || !AppState.proveedores.length) {
      const { data } = await http('/api/catalogos/proveedores');
      AppState.proveedores = data;
    }

    this._bindEvents();
    await this.loadHistorial();
  },

  async loadHistorial() {
    const tbody = document.getElementById('bodyCompras');
    try {
      const { data } = await http('/api/compras');
      if (!data.length) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center py-5 text-muted">No hay historial de compras.</td></tr>`;
        return;
      }
      tbody.innerHTML = data.map(c => `
        <tr style="border-bottom: 1px solid var(--border-color);">
          <td class="ps-4 fw-bold text-white">${new Date(c.fecha).toLocaleDateString()}</td>
          <td>${escapeHtml(c.proveedor_nombre || 'Desconocido')}</td>
          <td><span class="badge bg-primary bg-opacity-10 text-primary">${c.total_items} herramientas</span></td>
          <td class="text-muted text-sm">${escapeHtml(c.observaciones || '—')}</td>
          <td class="pe-4 text-end">
            <button class="btn btn-sm btn-dark"><i class="bi bi-eye"></i></button>
          </td>
        </tr>
      `).join('');
    } catch (e) {
      console.error(e);
    }
  },

  toggleView(view) {
    if (view === 'form') {
      document.getElementById('viewHistorial').classList.add('d-none');
      document.getElementById('viewFormCompra').classList.remove('d-none');
      this._resetForm();
    } else {
      document.getElementById('viewHistorial').classList.remove('d-none');
      document.getElementById('viewFormCompra').classList.add('d-none');
      this.loadHistorial();
    }
  },

  _resetForm() {
    this.items = [];
    document.getElementById('cObservaciones').value = '';
    document.getElementById('bodyItemsCompra').innerHTML = '';
    document.getElementById('noItemsMsg').classList.remove('d-none');
    
    // Poblar proveedores
    const sel = document.getElementById('cProveedor');
    sel.innerHTML = '<option value="">-- Seleccionar --</option>' +
      AppState.proveedores.map(p => `<option value="${p.id_proveedor}">${escapeHtml(p.nombre)}</option>`).join('');
  },

  addRow() {
    const id = Date.now();
    const row = { id, id_modelo: '', codigo: '', numero_serie: '', precio: 0 };
    this.items.push(row);
    this._renderRows();
  },

  removeRow(id) {
    this.items = this.items.filter(item => item.id !== id);
    this._renderRows();
  },

  _renderRows() {
    const tbody = document.getElementById('bodyItemsCompra');
    const msg = document.getElementById('noItemsMsg');

    if (this.items.length > 0) msg.classList.add('d-none');
    else msg.classList.remove('d-none');

    tbody.innerHTML = this.items.map(item => `
      <tr id="row-${item.id}">
        <td class="ps-4">
          <select class="form-select form-select-sm" onchange="Compras.updateItem(${item.id}, 'id_modelo', this.value)">
            <option value="">-- Modelo --</option>
            ${AppState.modelos.map(m => `<option value="${m.id_modelo}" ${m.id_modelo == item.id_modelo ? 'selected' : ''}>${escapeHtml(m.nombre)}</option>`).join('')}
          </select>
        </td>
        <td>
          <input type="text" class="form-control form-control-sm" placeholder="Código" value="${item.codigo}" oninput="Compras.updateItem(${item.id}, 'codigo', this.value)">
        </td>
        <td>
          <input type="text" class="form-control form-control-sm" placeholder="Serie" value="${item.numero_serie}" oninput="Compras.updateItem(${item.id}, 'numero_serie', this.value)">
        </td>
        <td>
          <input type="number" class="form-control form-control-sm" placeholder="0.00" value="${item.precio}" oninput="Compras.updateItem(${item.id}, 'precio', this.value)">
        </td>
        <td class="pe-4 text-end">
          <button class="btn btn-sm text-danger" onclick="Compras.removeRow(${item.id})"><i class="bi bi-trash"></i></button>
        </td>
      </tr>
    `).join('');
  },

  updateItem(id, field, value) {
    const item = this.items.find(i => i.id === id);
    if (item) item[field] = value;
  },

  async save() {
    const id_proveedor = document.getElementById('cProveedor').value;
    if (!id_proveedor) return showToast('Selecciona un proveedor', 'error');
    if (!this.items.length) return showToast('Añade al menos una herramienta', 'error');

    // Validar que todas las filas tengan modelo y código
    const valid = this.items.every(i => i.id_modelo && i.codigo);
    if (!valid) return showToast('Completa los campos obligatorios en cada fila', 'error');

    setLoading('btnFinalizarCompra', 'btnFinalizarText', 'btnFinalizarSpinner', true);

    try {
      const payload = {
        id_proveedor: parseInt(id_proveedor),
        observaciones: document.getElementById('cObservaciones').value,
        items: this.items
      };

      await http('/api/compras', 'POST', payload);
      showToast('Ingreso de herramientas completado con éxito', 'success');
      this.toggleView('historial');
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setLoading('btnFinalizarCompra', 'btnFinalizarText', 'btnFinalizarSpinner', false);
    }
  },

  _bindEvents() {
    document.getElementById('btnNuevaCompra')?.addEventListener('click', () => this.toggleView('form'));
    document.getElementById('btnRefreshCompras')?.addEventListener('click', () => this.toggleView('historial'));
    document.getElementById('btnAddRow')?.addEventListener('click', () => this.addRow());
    document.getElementById('btnFinalizarCompra')?.addEventListener('click', () => this.save());
  }
};

window.Compras = Compras;
