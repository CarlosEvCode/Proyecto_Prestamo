'use strict';

const ROUTES = {
  dashboard: {
    title:  'Dashboard',
    view:   '/views/dashboard.html',
    module: () => Dashboard,
  },
  catalogos: {
    title:  'Catálogos',
    view:   '/views/catalogos.html',
    module: () => Catalogos,
  },
  herramientas: {
    title:  'Herramientas',
    view:   '/views/herramientas.html',
    module: () => Herramientas,
  },
  trabajadores: {
    title:  'Trabajadores',
    view:   '/views/trabajadores.html',
    module: () => Trabajadores,
  }
};

const viewCache = {};

const Router = {
  currentPage: null,

  async navigateTo(page) {
    const route = ROUTES[page];
    if (!route) return;

    // Sidebar activo
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const navItem = document.querySelector(`.nav-item[data-page="${page}"]`);
    if (navItem) navItem.classList.add('active');

    if (document.getElementById('topbarTitle')) {
        document.getElementById('topbarTitle').innerText = route.title;
    }

    const container = document.getElementById('pageContainer');
    
    // Inyectar contenido básico y llamar al init del módulo
    const mod = route.module();
    if (mod && typeof mod.init === 'function') {
        await mod.init();
    }

    this.currentPage = page;
  },

  init() {
    document.querySelectorAll('.nav-item[data-page]').forEach(item => {
      item.addEventListener('click', e => {
        e.preventDefault();
        Router.navigateTo(item.dataset.page);
      });
    });
  }
};
