/**
 * app.js — Punto de arranque de la SPA
 */

'use strict';

const AppState = {
  marcas:       [],
  modelos:      [],
  categorias:   [],
  areas:        [],
  herramientas: [],
  trabajadores: [],
  prestamos:    [],
  deleteTarget: { type: null, id: null, name: null, onConfirm: null },
};

/* ════════════════════════════════════════════
   MODAL DE ELIMINACIÓN (compartido)
════════════════════════════════════════════ */
const DeleteModal = {
  render() {
    // Si ya existe, no duplicar
    if (document.getElementById('modalDeleteOverlay')) return;

    const div = document.createElement('div');
    div.id = 'modalDeleteOverlay';
    div.className = 'modal-overlay-container';
    div.innerHTML = `
      <div class="modal-overlay-content modal-sm">
        <div class="modal-header-custom">
          <div class="text-danger fw-bold">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>Confirmar Eliminación
          </div>
          <button class="btn-close" id="btnCloseDelete"><i class="bi bi-x-lg"></i></button>
        </div>
        <div class="modal-body-custom">
          <p class="text-muted mb-0" id="deleteMessage">¿Estás seguro?</p>
        </div>
        <div class="modal-footer-custom">
          <button class="btn btn-secondary" id="btnCancelDelete">Cancelar</button>
          <button class="btn btn-danger" id="btnConfirmDelete">Eliminar</button>
        </div>
      </div>`;
    
    document.body.appendChild(div);

    document.getElementById('btnConfirmDelete').addEventListener('click', () => this._execute());
    document.getElementById('btnCancelDelete').addEventListener('click',  () => closeOverlay('modalDeleteOverlay'));
    document.getElementById('btnCloseDelete').addEventListener('click',   () => closeOverlay('modalDeleteOverlay'));
    div.addEventListener('click', e => { if (e.target.id === 'modalDeleteOverlay') closeOverlay('modalDeleteOverlay'); });
  },

  open(type, id, name, onConfirm) {
    AppState.deleteTarget = { type, id, name, onConfirm };
    const msg = `¿Eliminar <strong>${escapeHtml(name)}</strong>? Esta acción no se puede deshacer.`;
    document.getElementById('deleteMessage').innerHTML = msg;
    openOverlay('modalDeleteOverlay');
  },

  async _execute() {
    const { onConfirm } = AppState.deleteTarget;
    closeOverlay('modalDeleteOverlay');
    if (typeof onConfirm === 'function') await onConfirm();
  },
};

/* ════════════════════════════════════════════
   BADGES DE SIDEBAR
════════════════════════════════════════════ */
function updateBadges() {
  setText('badge-herramientas', (AppState.herramientas || []).length);
  // Se pueden añadir más contadores aquí
}

/* ════════════════════════════════════════════
   ARRANQUE
════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  DeleteModal.render();
  Router.init();
  Router.navigateTo('dashboard');
});
