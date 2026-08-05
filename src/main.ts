import './style.css';
import { createElement } from './ui/html-builder';
import { renderCarCard } from './views/garage/car-card';
import { getCars, createCar } from './api/garage';

const app = document.getElementById('app');

const renderApp = async () => {
  if (!app) return;
  app.innerHTML = '';

  const nameInput = createElement({ tag: 'input', attributes: { type: 'text', placeholder: 'Car name' } });
  const colorInput = createElement({ tag: 'input', attributes: { type: 'color', value: '#e66465' } });
  const createBtn = createElement({ tag: 'button', classNames: ['btn', 'btn-primary'], textContent: 'CREATE' });

  createBtn.addEventListener('click', async () => {
    const name = nameInput.value.trim();
    const color = colorInput.value;

    if (!name) {
      alert('Please enter a car name!');
      return;
    }

    await createCar({ name, color });
    nameInput.value = '';
    renderApp();
  });

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
        children: [nameInput, colorInput, createBtn],
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

  const trackContainer = createElement({
    tag: 'div',
    classNames: ['track-container'],
  });

  try {
    const { items: cars, totalCount } = await getCars(1);
    
    const title = createElement({
      tag: 'h1',
      textContent: `Garage (${totalCount})`,
    });

    cars.forEach((car) => {
      trackContainer.appendChild(renderCarCard(car));
    });

    app.append(nav, controls, title, trackContainer);
  } catch (error) {
    const title = createElement({
      tag: 'h1',
      textContent: 'Garage (Server connection failed)',
    });
    app.append(nav, controls, title, trackContainer);
  }
};

renderApp();