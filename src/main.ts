import './style.css';
import { createElement } from './ui/html-builder';

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
          createElement({ tag: 'button', classNames: ['btn'], textContent: 'CREATE' }),
        ],
      }),
      createElement({
        tag: 'div',
        classNames: ['control-row'],
        children: [
          createElement({ tag: 'button', classNames: ['btn'], textContent: 'RACE' }),
          createElement({ tag: 'button', classNames: ['btn'], textContent: 'RESET' }),
          createElement({ tag: 'button', classNames: ['btn'], textContent: 'GENERATE CARS' }),
        ],
      }),
    ],
  });

  const title = createElement({
    tag: 'h1',
    textContent: 'Garage (0)',
  });

  app.append(nav, controls, title);
}