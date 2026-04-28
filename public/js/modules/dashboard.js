/**
 * modules/dashboard.js
 * Solo conoce el DOM de views/dashboard.html
 */

'use strict';

const DashboardModule = {

  async init() {
    await this.load();
  },

  async load() {
    try {
      const resP = await http('/api/herramientas');

      AppState.herramientas = resP.data;
      updateBadges();

      this._renderStats();
    } catch (e) {
      showToast('Error al cargar dashboard: ' + e.message, 'error');
    }
  },

  _renderStats() {
    const ps    = AppState.herramientas || [];
    setText('stat-total-herramientas', ps.length);
    setText('stat-valor-total',     'S/. 0.00');
    setText('stat-precio-promedio', 'S/. 0.00');
  },
};