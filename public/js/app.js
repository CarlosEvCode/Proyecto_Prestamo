'use strict';

/* ════════════════════════════════════════════
   ESTADO GLOBAL COMPARTIDO
   Los módulos leen/escriben aquí para compartir
   datos sin repetir peticiones al servidor.
════════════════════════════════════════════ */
const AppState = {
  marcas:       [],
  herramientas: [],
  modelos:      [],
  trabajadores: [],
  prestamos:    [],
  compras:      [],
};

/* ════════════════════════════════════════════
   MODAL DE ELIMINACIÓN (compartido)
════════════════════════════════════════════ */
const DeleteModal = {

  open(type, id, name, onConfirm) {
    if (!confirm(`¿Estás seguro de que deseas eliminar este ${type}?\n\n"${name}"`)) {
      return;
    }
    if (onConfirm) onConfirm();
  }
};

/* ════════════════════════════════════════════
   BADGES DE SIDEBAR
════════════════════════════════════════════ */
function updateBadges() {
  setText('badge-herramientas', (AppState.herramientas || []).length);
  setText('badge-marcas',       (AppState.marcas || []).length);
  setText('badge-modelos',      (AppState.modelos || []).length);
  setText('badge-prestamos',    (AppState.prestamos || []).length);
}

/* ════════════════════════════════════════════
   ARRANQUE
════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  Router.init();
  Router.navigateTo('dashboard');
});
