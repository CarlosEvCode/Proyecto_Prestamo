'use strict';

//Objeto compuesto por funciones: funcion1, funcion2, funcion3
const HerramientasModule = {
    async init() {
        this._bindEvents();
        await this.load();
    },

    async load() {},

    _bindEvents() {
        
    }
}