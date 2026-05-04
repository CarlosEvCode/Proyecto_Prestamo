"use strict";

const Dashboard = {
  // 1. Declaramos las variables donde guardaremos los gráficos a nivel del módulo
  graficoCondicion: null,
  graficoCategorias: null,
  graficoPrestamos: null,

  async init() {
    // 2. Primero inicializamos los gráficos en "blanco" o con estructura base
    this._initCharts();

    // 3. Luego vamos al backend a traer la data y actualizamos todo
    await this.loadStats();
  },

  _initCharts() {

    const ctxCondicion = document.getElementById("chartCondicion");
    if (ctxCondicion) {
      // Si el gráfico ya existe, destrúyelo antes de repintarlo
      if (this.graficoCondicion) {
        this.graficoCondicion.destroy();
      }

      this.graficoCondicion = new Chart(ctxCondicion, {
        type: "doughnut",
        data: {
          labels: ["Bueno", "Regular", "Malo"],
          datasets: [
            {
              data: [0, 0, 0], // Inicia en 0
              backgroundColor: ["#a1bbe4", "#cdb2e7", "#2f3135"],
              borderColor: "#24262d",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "bottom",
              labels: { color: "#97b0db", padding: 20 },
            },
          },
        },
      });
    }

/* Herramientas mas usadas */
    const ctxCategorias = document.getElementById("chartCategorias");
    if (ctxCategorias) {
      // Destruir si ya existe
      if (this.graficoCategorias) {
        this.graficoCategorias.destroy();
      }

      this.graficoCategorias = new Chart(ctxCategorias, {
        type: "bar",
        data: {
          labels: ["---", "---", "---", "---", "---"], // Etiquetas dinámicas
          datasets: [
            {
              label: "Cantidad de Préstamos",
              data: [0, 0, 0, 0, 0], // Inicia en 0
              backgroundColor: "#5e4377",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: true, labels: { color: "#9ca3af" } } },
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: "#374151" },
              ticks: { color: "#9ca3af" },
            },
            x: { grid: { display: false }, ticks: { color: "#9ca3af" } },
          },
        },
      });
    }

    // GRÁFICO DE PRÉSTAMOS (Pie)
    const ctxPrestamos = document.getElementById("chartPrestamos");
    if (ctxPrestamos) {
      // Destruir si ya existe
      if (this.graficoPrestamos) {
        this.graficoPrestamos.destroy();
      }

      this.graficoPrestamos = new Chart(ctxPrestamos, {
        type: "pie",
        data: {
          labels: ["Activos", "Devueltos", "Vencidos"],
          datasets: [
            {
              data: [0, 0, 0], // Inicia en 0
              backgroundColor: ["#e9d28c", "#a8f3c4", "#f5b7b7"],
              borderColor: "#24262d",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "bottom",
              labels: { color: "#97b0db", padding: 20 },
            },
          },
        },
      });
    }
  },

  async loadStats() {
    try {
      const response = await fetch("/api/dashboard/stats");
      const result = await response.json();

      if (result.success) {
        // 1. Actualizar las tarjetas numéricas
        const { totalHerramientas, totalTrabajadores, prestamosActivos } =
          result.data;

        document.getElementById("stat-herramientas").innerText =
          totalHerramientas || 0;
        document.getElementById("stat-trabajadores").innerText =
          totalTrabajadores || 0;
        document.getElementById("stat-prestamos").innerText =
          prestamosActivos || 0;


        // Gráfico Condición
        const dataCondicion = result.data.graficoCondicion || [0, 0, 0];
        if (this.graficoCondicion) {
          this.graficoCondicion.data.datasets[0].data = dataCondicion;
          this.graficoCondicion.update();
        }

        // Gráfico Herramientas Más Usadas
        const etiquetas = result.data.etiquetasHerramientas || [
          "---",
          "---",
          "---",
          "---",
          "---",
        ];
        const dataCategorias = result.data.prestamosXMes || [0, 0, 0, 0, 0];
        if (this.graficoCategorias) {
          this.graficoCategorias.data.labels = etiquetas;
          this.graficoCategorias.data.datasets[0].data = dataCategorias;
          this.graficoCategorias.update();
        }

        // Gráfico Préstamos
        const dataPrestamos = result.data.graficoPrestamos || [0, 0, 0];
        if (this.graficoPrestamos) {
          this.graficoPrestamos.data.datasets[0].data = dataPrestamos;
          this.graficoPrestamos.update();
        }
      }
    } catch (error) {
      console.error("Error cargando estadísticas y gráficos:", error);
    }
  },

  // Función para refrescar los datos (llamar desde otros módulos)
  async refresh() {
    await this.loadStats();
  },
};

window.Dashboard = Dashboard;
