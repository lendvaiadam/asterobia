import { Game } from './Core/Game.js';

window.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    game.start();
    
    // Force preloader to stay for 2 seconds (User Request)
    setTimeout(() => {
        const loader = document.getElementById('loader');
        if (loader) {
            loader.style.transition = 'opacity 0.5s';
            loader.style.opacity = '0';
            setTimeout(() => loader.style.display = 'none', 500);
        }
    }, 2000);
});
