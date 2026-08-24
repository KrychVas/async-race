import './style.css';
import { initTheme } from './utils/theme';
import { registerRender } from './state/render-scheduler';
import { renderApp } from './main';
import { audioManager } from './utils/audio';

initTheme();

// Запуск фонової музики після першої взаємодії (політика автозапуску браузера)
document.addEventListener(
  'click',
  () => {
    audioManager.playBgMusic();
  },
  { once: true },
);

registerRender(renderApp);
await renderApp();
