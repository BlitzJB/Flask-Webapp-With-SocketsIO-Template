import { Player } from "./player.js";

document.addEventListener('DOMContentLoaded', () => {

    const player = new Player(document.querySelector('#player'));
    window.player = player;


})