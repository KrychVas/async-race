import './style.css';
import { createElement } from './ui/html-builder';
import { renderCarCard } from './views/garage/car-card';
import { getCars, createCar, deleteCar, updateCar } from './api/garage';
import { handleGenerateCars } from './views/garage/garage-view';
import { appState } from './state/app-state';
import { CARS_PER_PAGE } from './constants';

const app = document.getElementById('app');
let selectedCarId: number | null = null;

export const renderApp = async () => {
  if (!app) return;
  app.innerHTML = '';

  // Form: Create
  const createNameInput = createElement({ tag: 'input', attributes: { type: 'text', placeholder: 'Car name' } });
  const createColorInput = createElement({ tag: 'input', attributes: { type: 'color', value: '#e66465' } });
  const createBtn = createElement({ tag: 'button', classNames: ['btn', 'btn-primary'], textContent: 'CREATE' });

  createBtn.addEventListener('click', async () => {
    const name = createNameInput.value.trim();
    const color = createColorInput.value;
    if (!name) return alert('Please enter a car name!');

    await createCar({ name, color });
    createNameInput.value = '';
    renderApp();
  });

  // Form: Update
  const updateNameInput = createElement({ tag: 'input', attributes: { type: 'text', placeholder: 'Select a car...' } });
  const updateColorInput = createElement({ tag: 'input', attributes: { type: 'color', value: '#3b82f6' } });
  const updateBtn = createElement({ tag: 'button', classNames: ['btn', 'btn-primary'], textContent: 'UPDATE' });
  
  if (!selectedCarId) {
    updateNameInput.disabled = true;
    updateColorInput.disabled = true;
    updateBtn.disabled = true;
  }

  updateBtn.addEventListener('click', async () => {
    if (!selectedCarId) return;
    const name = updateNameInput.value.trim();
    const color = updateColorInput.value;
    if (!name) return alert('Car name cannot be empty!');

    await updateCar(selectedCarId, { name, color });
    selectedCarId = null;
    renderApp();
  });

  // Action: Generate 100 Cars
  const generateBtn = createElement({ tag: 'button', classNames: ['btn'], textContent: 'GENERATE CARS' });
  generateBtn.addEventListener('click', async () => {
    generateBtn.disabled = true;
    await handleGenerateCars();
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
        children: [createNameInput, createColorInput, createBtn],
      }),
      createElement({
        tag: 'div',
        classNames: ['control-row'],
        children: [updateNameInput, updateColorInput, updateBtn],
      }),
      createElement({
        tag: 'div',
        classNames: ['control-row'],
        children: [
          createElement({ tag: 'button', classNames: ['btn', 'btn-primary'], textContent: 'RACE' }),
          createElement({ tag: 'button', classNames: ['btn', 'btn-warning'], textContent: 'RESET' }),
          generateBtn,
        ],
      }),
    ],
  });

  const trackContainer = createElement({
    tag: 'div',
    classNames: ['track-container'],
  });

  try {
    // 1. Отримуємо машини конкретно для поточного номера сторінки
    const { items: cars, totalCount } = await getCars(appState.currentPage);
    appState.totalCars = totalCount;

    // 2. Розраховуємо загальну кількість сторінок
    const totalPages = Math.ceil(totalCount / CARS_PER_PAGE) || 1;

    const title = createElement({
      tag: 'h1',
      textContent: `Garage (${totalCount})`,
    });

    const pageSubtitle = createElement({
      tag: 'h2',
      textContent: `Page #${appState.currentPage} / ${totalPages}`,
    });

    // 3. Кнопки пагінації (PREV / NEXT)
    const prevBtn = createElement({
      tag: 'button',
      classNames: ['btn'],
      textContent: 'PREV',
      attributes: appState.currentPage <= 1 ? { disabled: 'true' } : {},
    });

    const nextBtn = createElement({
      tag: 'button',
      classNames: ['btn'],
      textContent: 'NEXT',
      attributes: appState.currentPage >= totalPages ? { disabled: 'true' } : {},
    });

    prevBtn.addEventListener('click', async () => {
      if (appState.currentPage > 1) {
        appState.currentPage -= 1;
        await renderApp();
      }
    });

    nextBtn.addEventListener('click', async () => {
      if (appState.currentPage < totalPages) {
        appState.currentPage += 1;
        await renderApp();
      }
    });

    const paginationPanel = createElement({
      tag: 'div',
      classNames: ['control-row'],
      children: [prevBtn, nextBtn],
    });

    cars.forEach((car) => {
      const carCard = renderCarCard(car);

      // Listener for REMOVE
      const removeBtn = carCard.querySelector('.btn-danger');
      removeBtn?.addEventListener('click', async () => {
        await deleteCar(car.id);
        if (selectedCarId === car.id) selectedCarId = null;
        
        // Якщо видалили останню авто на сторінці — автоматично повертаємося на сторінку назад
        if (cars.length === 1 && appState.currentPage > 1) {
          appState.currentPage -= 1;
        }
        renderApp();
      });

      // Listener for SELECT
      const selectBtn = carCard.querySelector('.car-header .btn:not(.btn-danger)');
      selectBtn?.addEventListener('click', () => {
        selectedCarId = car.id;
        updateNameInput.disabled = false;
        updateColorInput.disabled = false;
        updateBtn.disabled = false;
        updateNameInput.value = car.name;
        updateColorInput.value = car.color;
      });

      trackContainer.appendChild(carCard);
    });

    app.append(nav, controls, title, pageSubtitle, paginationPanel, trackContainer);
  } catch (error) {
    const title = createElement({
      tag: 'h1',
      textContent: 'Garage (Server connection failed)',
    });
    app.append(nav, controls, title, trackContainer);
  }
};

renderApp();