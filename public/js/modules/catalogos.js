const Catalogos = {
    init: async () => {
        await Catalogos.render();
    },
    render: async () => {
        document.getElementById('pageContainer').innerHTML = `
            <div class="container-fluid">
                <h2>Catálogos del Sistema</h2>
                <ul>
                    <li>Marcas</li>
                    <li>Modelos</li>
                    <li>Áreas</li>
                </ul>
            </div>
        `;
    }
};
window.Catalogos = Catalogos;
