import './style.css';
import { createElement } from './ui/html-builder';
import { renderCarCard } from './views/garage/car-card';

const app = document.getElementById('app');

if (app) {
  const nav = createElement({
    tag: 'nav',
    classNames: ['header-nav'],
    children: [
      createElement({ tag: 'button', classNames: ['btn'], textContent: 'GARAGE' }),
      createElement({ tag: 'button', classNames: ['btn'], textContent: 'WINNERS' }),
    ],
  });

  const controls = createElement({
    tag: 'div',
    classNames: ['controls-panel'],
    children: [
      createElement({
        tag: 'div',
        classNames: ['control-row'],
        children: [
          createElement({ tag: 'input', attributes: { type: 'text', placeholder: 'Car name' } }),
          createElement({ tag: 'input', attributes: { type: 'color', value: '#e66465' } }),
          createElement({ tag: 'button', classNames: ['btn', 'btn-primary'], textContent: 'CREATE' }),
        ],
      }),
      createElement({
        tag: 'div',
        classNames: ['control-row'],
        children: [
          createElement({ tag: 'button', classNames: ['btn', 'btn-primary'], textContent: 'RACE' }),
          createElement({ tag: 'button', classNames: ['btn', 'btn-warning'], textContent: 'RESET' }),
          createElement({ tag: 'button', classNames: ['btn'], textContent: 'GENERATE CARS' }),
        ],
      }),
    ],
  });

  const title = createElement({
    tag: 'h1',
    textContent: 'Garage (2)',
  });

  const trackContainer = createElement({
    tag: 'div',
    classNames: ['track-container'],
  });

  // Тестові машинки для перевірки вигляду
  const sampleCar1 = renderCarCard({ id: 1, name: 'Tesla Model S', color: '#ef4444' });
  const sampleCar2 = renderCarCard({ id: 2, name: 'BMW M5', color: '#3b82f6' });

  trackContainer.append(sampleCar1, sampleCar2);

  app.append(nav, controls, title, trackContainer);
}