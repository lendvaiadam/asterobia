import { Game } from './Core/Game.js';

window.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    
    // Set callback for when game is fully rendered
    game.onFirstRender = () => {
        const loader = document.getElementById('loader');
        if (loader) {
            // Smooth fade out over 0.8s
            loader.style.transition = 'opacity 0.8s ease-out';
            loader.style.opacity = '0';
            // Remove from DOM after fade
            setTimeout(() => {
                loader.style.display = 'none';
            }, 800);
        }
    };
    
    game.start();
});
