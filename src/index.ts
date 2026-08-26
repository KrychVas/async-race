import './style.css';
import { initTheme } from './utils/theme';
import { registerRender } from './state/render-scheduler';
import { renderApp } from './main';
import { audioManager } from './utils/audio';

initTheme();

// Фонова музика одразу після завантаження сторінки
audioManager.playBgMusic();

registerRender(renderApp);
await renderApp();
