/**
 * app.js — Punto de arranque de la SPA
 */

'use strict';

// El objeto AppState solo debe definirse una vez aquí
const AppState = {
  marcas:       [],
  modelos:      [],
  categorias:   [],
  areas:        [],
  proveedores:  [],
  herramientas: [],
  trabajadores: [],
  prestamos:    [],
  deleteTarget: { type: null, id: null, name: null, onConfirm: null },
};

/* MODAL DE ELIMINACIÓN (compartido)*/
const DeleteModal = {
  render() {
    if (document.getElementById('modalDeleteOverlay')) return;
    const div = document.createElement('div');
    div.id = 'modalDeleteOverlay';
    div.className = 'modal-overlay-container';
    div.innerHTML = `
      <div class="modal-overlay-content modal-sm">
        <div class="modal-header-custom">
          <div class="text-danger fw-bold"><i class="bi bi-exclamation-triangle-fill me-2"></i>Confirmar</div>
          <button class="btn-close" id="btnCloseDelete"><i class="bi bi-x-lg"></i></button>
        </div>
        <div class="modal-body-custom"><p class="text-muted mb-0" id="deleteMessage">¿Estás seguro?</p></div>
        <div class="modal-footer-custom">
          <button class="btn btn-secondary btn-sm" id="btnCancelDelete">Cancelar</button>
          <button class="btn btn-danger btn-sm" id="btnConfirmDelete">Eliminar</button>
        </div>
      </div>`;
    document.body.appendChild(div);
    document.getElementById('btnConfirmDelete').addEventListener('click', () => this._execute());
    document.getElementById('btnCancelDelete').addEventListener('click',  () => closeOverlay('modalDeleteOverlay'));
    document.getElementById('btnCloseDelete').addEventListener('click',   () => closeOverlay('modalDeleteOverlay'));
  },
  open(type, id, name, onConfirm) {
    AppState.deleteTarget = { type, id, name, onConfirm };
    document.getElementById('deleteMessage').innerHTML = `¿Eliminar <strong>${escapeHtml(name)}</strong>?`;
    openOverlay('modalDeleteOverlay');
  },
  async _execute() {
    closeOverlay('modalDeleteOverlay');
    if (typeof AppState.deleteTarget.onConfirm === 'function') await AppState.deleteTarget.onConfirm();
  },
};

/* ARRANQUE*/
document.addEventListener('DOMContentLoaded', () => {
  DeleteModal.render();
  Router.init();
  Router.navigateTo('dashboard');
});
