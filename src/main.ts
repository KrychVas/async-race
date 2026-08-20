import './style.css';
import { createElement } from './ui/html-builder';
import { renderCarCard } from './views/garage/car-card';
import { getCars, createCar, deleteCar, updateCar } from './api/garage';
import { deleteWinner, saveWinnerResult } from './api/winners';
import { handleGenerateCars, handleClearGarage } from './views/garage/garage-view';
import { startRace, resetRace } from './views/garage/race-controller';
import { showWinnerModal } from './ui/winner-modal';
import { showSettingsModal } from './ui/settings-modal';
import { openColorPickerModal } from './ui/color-picker-modal';
import { renderWinnersView } from './views/winners/winners-view';
import { appState } from './state/app-state';
import { CARS_PER_PAGE } from './constants';
import { audioManager } from './utils/audio';
import { initTheme } from './utils/theme';
import { BODY_TYPES, getCarSvgContent } from './utils/car-mapping';
import { registerRender } from './state/render-scheduler';

const app = document.querySelector('#app');
let selectedCarId: number | null = null;
let currentView: 'garage' | 'winners' = 'garage';

// Init theme on load
initTheme();

// Start bg music on first user interaction (browser autoplay policy)
document.addEventListener(
  'click',
  () => {
    audioManager.playBgMusic();
  },
  { once: true },
);

export const renderApp = async (): Promise<void> => {
  if (!app) return;
  app.replaceChildren();

  // --- Main Title (ASYNC RACE) ---
  const mainTitle = createElement({
    tag: 'h1',
    classNames: ['main-title'],
    textContent: 'ASYNC RACE',
  });

  // --- Navigation ---
  const garageNavButton = createElement({ tag: 'button', classNames: ['btn'], textContent: 'GARAGE' });
  const winnersNavButton = createElement({ tag: 'button', classNames: ['btn'], textContent: 'WINNERS' });
  const settingsNavButton = createElement({ tag: 'button', classNames: ['btn', 'btn-primary'], textContent: '⚙️ SETTINGS' });
  const muteNavButton = createElement({
    tag: 'button',
    classNames: ['btn', 'btn-warning'],
    textContent: audioManager.isMutedState ? 'UNMUTE' : 'MUTE',
  });

  garageNavButton.addEventListener('click', () => {
    currentView = 'garage';
    renderApp();
  });

  winnersNavButton.addEventListener('click', () => {
    currentView = 'winners';
    renderApp();
  });

  settingsNavButton.addEventListener('click', () => {
    showSettingsModal();
  });

  muteNavButton.addEventListener('click', () => {
    const isMuted = audioManager.toggleMute();
    muteNavButton.textContent = isMuted ? 'UNMUTE' : 'MUTE';
  });

  const nav = createElement({
    tag: 'nav',
    classNames: ['header-nav'],
    children: [garageNavButton, winnersNavButton, settingsNavButton, muteNavButton],
  });

  // --- Winners view ---
  if (currentView === 'winners') {
    const winnersView = await renderWinnersView();
    app.append(mainTitle, nav, winnersView);
    return;
  }

  // --- Garage view ---

  // Form: Create
  let selectedCreateColor = '#e66465';
  const createNameInput = createElement({ tag: 'input', attributes: { type: 'text', placeholder: 'Car name' } });
  const createModelSelect = createElement({
    tag: 'select',
    children: BODY_TYPES.map((bt) =>
      createElement({ tag: 'option', textContent: bt.name, attributes: { value: bt.id } }),
    ),
  }) as HTMLSelectElement;

  const createColorButton = createElement({
    tag: 'button',
    classNames: ['color-btn'],
    attributes: { style: `background-color: ${selectedCreateColor};`, title: 'Click to choose color' },
  });

  const createPreviewBox = createElement({
    tag: 'div',
    classNames: ['car-preview-box'],
    attributes: { title: 'Click to choose color' },
  });

  const createButton = createElement({ tag: 'button', classNames: ['btn', 'btn-primary'], textContent: 'CREATE' });

  const getCreateTestName = (): string => {
    const rawName = (createNameInput as HTMLInputElement).value.trim();
    const bodyType = createModelSelect.value;
    const brandName = bodyType === 'auto' ? '' : BODY_TYPES.find((b) => b.id === bodyType)?.name.split(' ', 1)[0] || bodyType;
    return brandName ? `${brandName} ${rawName}` : (rawName || 'Tesla');
  };

  const updateCreatePreview = (): void => {
    createColorButton.style.backgroundColor = selectedCreateColor;
    createPreviewBox.innerHTML = getCarSvgContent(getCreateTestName(), selectedCreateColor);
  };

  createNameInput.addEventListener('input', updateCreatePreview);
  createModelSelect.addEventListener('change', updateCreatePreview);
  updateCreatePreview();

  const openCreateColorModal = (): void => {
    openColorPickerModal({
      currentColor: selectedCreateColor,
      carName: getCreateTestName(),
      onApply: (color) => {
        selectedCreateColor = color;
        updateCreatePreview();
      },
    });
  };

  createColorButton.addEventListener('click', openCreateColorModal);
  createPreviewBox.addEventListener('click', openCreateColorModal);

  createButton.addEventListener('click', async () => {
    let name = (createNameInput as HTMLInputElement).value.trim();
    const color = selectedCreateColor;
    const bodyType = createModelSelect.value;

    if (!name) {
      alert('Please enter a car name!');
      return;
    }

    if (bodyType !== 'auto') {
      const brandName = BODY_TYPES.find((b) => b.id === bodyType)?.name.split(' ', 1)[0] || bodyType;
      if (!name.toLowerCase().includes(brandName.toLowerCase())) {
        name = `${brandName} ${name}`;
      }
    }

    await createCar({ name, color });
    (createNameInput as HTMLInputElement).value = '';
    await renderApp();
  });

  // Form: Update
  let selectedUpdateColor = '#3b82f6';
  const updateNameInput = createElement({ tag: 'input', attributes: { type: 'text', placeholder: 'Select a car...' } });
  const updateModelSelect = createElement({
    tag: 'select',
    children: BODY_TYPES.map((bt) =>
      createElement({ tag: 'option', textContent: bt.name, attributes: { value: bt.id } }),
    ),
  }) as HTMLSelectElement;

  const updateColorButton = createElement({
    tag: 'button',
    classNames: ['color-btn'],
    attributes: { style: `background-color: ${selectedUpdateColor};`, title: 'Click to choose color' },
  });

  const updatePreviewBox = createElement({
    tag: 'div',
    classNames: ['car-preview-box'],
    attributes: { title: 'Click to choose color' },
  });

  const updateButton = createElement({ tag: 'button', classNames: ['btn', 'btn-primary'], textContent: 'UPDATE' });

  const getUpdateTestName = (): string => {
    const rawName = (updateNameInput as HTMLInputElement).value.trim();
    const bodyType = updateModelSelect.value;
    const brandName = bodyType === 'auto' ? '' : BODY_TYPES.find((b) => b.id === bodyType)?.name.split(' ', 1)[0] || bodyType;
    return brandName ? `${brandName} ${rawName}` : (rawName || 'Tesla');
  };

  const updateUpdatePreview = (): void => {
    updateColorButton.style.backgroundColor = selectedUpdateColor;
    updatePreviewBox.innerHTML = getCarSvgContent(getUpdateTestName(), selectedUpdateColor);
  };

  updateNameInput.addEventListener('input', updateUpdatePreview);
  updateModelSelect.addEventListener('change', updateUpdatePreview);
  updateUpdatePreview();

  const openUpdateColorModal = (): void => {
    if (!selectedCarId) return;
    openColorPickerModal({
      currentColor: selectedUpdateColor,
      carName: getUpdateTestName(),
      onApply: (color) => {
        selectedUpdateColor = color;
        updateUpdatePreview();
      },
    });
  };

  updateColorButton.addEventListener('click', openUpdateColorModal);
  updatePreviewBox.addEventListener('click', openUpdateColorModal);

  if (!selectedCarId) {
    (updateNameInput as HTMLInputElement).disabled = true;
    updateModelSelect.disabled = true;
    (updateColorButton as HTMLButtonElement).disabled = true;
    (updateButton as HTMLButtonElement).disabled = true;
  }

  updateButton.addEventListener('click', async () => {
    if (!selectedCarId) return;
    let name = (updateNameInput as HTMLInputElement).value.trim();
    const color = selectedUpdateColor;
    const bodyType = updateModelSelect.value;

    if (!name) {
      alert('Car name cannot be empty!');
      return;
    }

    if (bodyType !== 'auto') {
      const brandName = BODY_TYPES.find((b) => b.id === bodyType)?.name.split(' ', 1)[0] || bodyType;
      if (!name.toLowerCase().includes(brandName.toLowerCase())) {
        name = `${brandName} ${name}`;
      }
    }

    await updateCar(selectedCarId, { name, color });
    selectedCarId = null;
    await renderApp();
  });

  // Generate button
  const generateButton = createElement({ tag: 'button', classNames: ['btn'], textContent: 'GENERATE CARS' });
  generateButton.addEventListener('click', async () => {
    generateButton.setAttribute('disabled', 'true');
    await handleGenerateCars();
  });

  // Clear Garage button
  const clearGarageButton = createElement({ tag: 'button', classNames: ['btn', 'btn-danger'], textContent: 'CLEAR GARAGE' });
  clearGarageButton.addEventListener('click', async () => {
    if (!confirm('Are you sure you want to delete all cars from the garage?')) {
    	return;
    }

    clearGarageButton.setAttribute('disabled', 'true');
    await handleClearGarage();
  });

  // RACE / RESET buttons
  const raceButton = createElement({ tag: 'button', classNames: ['btn', 'btn-primary'], textContent: 'RACE' });
  const resetButton = createElement({
    tag: 'button',
    classNames: ['btn', 'btn-warning'],
    textContent: 'RESET',
    attributes: { disabled: 'true' },
  });

  raceButton.addEventListener('click', async () => {
    raceButton.setAttribute('disabled', 'true');
    resetButton.setAttribute('disabled', 'true');

    const { items: cars } = await getCars(appState.currentPage);
    const winner = await startRace(cars);

    if (winner) {
      showWinnerModal(winner.car.name, winner.time);
      await saveWinnerResult(winner.car.id, winner.time);
    }

    resetButton.removeAttribute('disabled');
  });

  resetButton.addEventListener('click', async () => {
    resetButton.setAttribute('disabled', 'true');

    const { items: cars } = await getCars(appState.currentPage);
    await resetRace(cars);

    raceButton.removeAttribute('disabled');
  });

  const controls = createElement({
    tag: 'div',
    classNames: ['controls-panel'],
    children: [
      createElement({
        tag: 'div',
        classNames: ['control-row'],
        children: [createNameInput, createModelSelect, createColorButton, createPreviewBox, createButton],
      }),
      createElement({
        tag: 'div',
        classNames: ['control-row'],
        children: [updateNameInput, updateModelSelect, updateColorButton, updatePreviewBox, updateButton],
      }),
      createElement({
        tag: 'div',
        classNames: ['control-row'],
        children: [raceButton, resetButton, generateButton, clearGarageButton],
      }),
    ],
  });

  const trackContainer = createElement({ tag: 'div', classNames: ['track-container'] });

  try {
    const { items: cars, totalCount } = await getCars(appState.currentPage);
    appState.totalCars = totalCount;

    const totalPages = Math.ceil(totalCount / CARS_PER_PAGE) || 1;

    const title = createElement({ tag: 'h1', textContent: `Garage (${totalCount})` });
    const pageSubtitle = createElement({
      tag: 'h2',
      textContent: `Page #${appState.currentPage} / ${totalPages}`,
    });

    const previousButton = createElement({
      tag: 'button',
      classNames: ['btn'],
      textContent: 'PREV',
      attributes: appState.currentPage <= 1 ? { disabled: 'true' } : {},
    });

    const nextButton = createElement({
      tag: 'button',
      classNames: ['btn'],
      textContent: 'NEXT',
      attributes: appState.currentPage >= totalPages ? { disabled: 'true' } : {},
    });

    previousButton.addEventListener('click', async () => {
      if (!(appState.currentPage > 1)) {
      	return;
      }

      appState.currentPage -= 1;
      await renderApp();
    });

    nextButton.addEventListener('click', async () => {
      if (!(appState.currentPage < totalPages)) {
      	return;
      }

      appState.currentPage += 1;
      await renderApp();
    });

    const paginationPanel = createElement({
      tag: 'div',
      classNames: ['control-row'],
      children: [previousButton, nextButton],
    });

    cars.forEach((car) => {
      const carCard = renderCarCard(car);

      // REMOVE with cascading winner delete
      const removeButton = carCard.querySelector('.btn-danger');
      removeButton?.addEventListener('click', async () => {
        await deleteCar(car.id);
        await deleteWinner(car.id).catch(() => {});

        if (selectedCarId === car.id) selectedCarId = null;

        if (cars.length === 1 && appState.currentPage > 1) {
          appState.currentPage -= 1;
        }
        await renderApp();
      });

      // SELECT
      const selectButton = carCard.querySelector<HTMLButtonElement>('.car-header .btn:not(.btn-danger)');
      selectButton?.addEventListener('click', () => {
        selectedCarId = car.id;
        (updateNameInput as HTMLInputElement).disabled = false;
        updateModelSelect.disabled = false;
        (updateColorButton as HTMLButtonElement).disabled = false;
        (updateButton as HTMLButtonElement).disabled = false;
        (updateNameInput as HTMLInputElement).value = car.name;
        selectedUpdateColor = car.color;
        updateUpdatePreview();
      });

      trackContainer.append(carCard);
    });

    app.append(mainTitle, nav, controls, title, pageSubtitle, paginationPanel, trackContainer);
  } catch {
    const title = createElement({ tag: 'h1', textContent: 'Garage (Server connection failed)' });
    app.append(mainTitle, nav, controls, title, trackContainer);
  }
};

registerRender(renderApp);
renderApp();