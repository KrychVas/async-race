import { createElement } from './ui/html-builder';
import { renderCarCard } from './views/garage/car-card';
import { getCars, createCar, deleteCar, updateCar } from './api/garage';
import { deleteWinner, saveWinnerResult } from './api/winners';
import {
  handleGenerateCars,
  handleClearGarage,
} from './views/garage/garage-view';
import { startRace, resetRace } from './views/garage/race-controller';
import { showWinnerModal } from './ui/winner-modal';
import { showSettingsModal } from './ui/settings-modal';
import { openColorPickerModal } from './ui/color-picker-modal';
import { renderWinnersView } from './views/winners/winners-view';
import { appState } from './state/app-state';
import { CARS_PER_PAGE } from './constants';
import { audioManager } from './utils/audio';
import { BODY_TYPES, getCarSvgContent } from './utils/car-mapping';
import type { Car } from './state/types';

const app = document.querySelector('#app');

const renderTitle = (): HTMLElement =>
  createElement({
    tag: 'h1',
    classNames: ['main-title'],
    textContent: 'ASYNC RACE',
  });

const buildNamedInput = (placeholder: string): HTMLInputElement =>
  createElement({
    tag: 'input',
    attributes: { type: 'text', placeholder },
  }) as HTMLInputElement;

const buildModelSelect = (): HTMLSelectElement =>
  createElement({
    tag: 'select',
    children: BODY_TYPES.map((bt) =>
      createElement({
        tag: 'option',
        textContent: bt.name,
        attributes: { value: bt.id },
      }),
    ),
  }) as HTMLSelectElement;

const buildColorButton = (color: string): HTMLButtonElement =>
  createElement({
    tag: 'button',
    classNames: ['color-btn'],
    attributes: {
      style: `background-color: ${color};`,
      title: 'Click to choose color',
    },
  });

const buildPreviewBox = (): HTMLElement =>
  createElement({
    tag: 'div',
    classNames: ['car-preview-box'],
    attributes: { title: 'Click to choose color' },
  });

const buildNavButton = (text: string, extraClass?: string): HTMLElement =>
  createElement({
    tag: 'button',
    classNames: ['btn', ...(extraClass ? [extraClass] : [])],
    textContent: text,
  });

const navigate = async (view: 'garage' | 'winners'): Promise<void> => {
  appState.view = view;
  await renderApp();
};

const carDisplayName = (
  nameInput: HTMLInputElement,
  modelSelect: HTMLSelectElement,
  fallback: string,
): string => {
  const rawName = nameInput.value.trim();
  const bodyType = modelSelect.value;
  if (bodyType === 'auto') return rawName || fallback;
  const brand =
    BODY_TYPES.find((b) => b.id === bodyType)?.name.split(' ', 1)[0] ||
    bodyType;
  return brand ? `${brand} ${rawName}` : rawName || fallback;
};

const prefillBrand = (rawName: string, bodyType: string): string => {
  if (bodyType === 'auto') return rawName;
  const brand =
    BODY_TYPES.find((b) => b.id === bodyType)?.name.split(' ', 1)[0] ||
    bodyType;
  if (!rawName.toLowerCase().includes(brand.toLowerCase()))
    return `${brand} ${rawName}`;
  return rawName;
};

const openColorModal = (
  currentColor: string,
  carName: () => string,
  onApply: (color: string) => void,
): void => {
  openColorPickerModal({ currentColor, carName: carName(), onApply });
};

const makePickColor =
  (
    getColor: () => string,
    getName: () => string,
    onApply: (color: string) => void,
    requiresSelection: boolean,
  ): (() => void) =>
  () => {
    if (requiresSelection && !appState.selectedCarId) return;
    openColorModal(getColor(), getName, onApply);
  };

const handleCreateSubmit = async (
  nameInput: HTMLInputElement,
  modelSelect: HTMLSelectElement,
  getColor: () => string,
): Promise<void> => {
  const name = prefillBrand(nameInput.value.trim(), modelSelect.value);
  if (!name) {
    alert('Please enter a car name!');
    return;
  }
  await createCar({ name, color: getColor() });
  nameInput.value = '';
  await renderApp();
};

const handleUpdateSubmit = async (
  nameInput: HTMLInputElement,
  modelSelect: HTMLSelectElement,
  getColor: () => string,
): Promise<void> => {
  if (!appState.selectedCarId) return;
  const name = prefillBrand(nameInput.value.trim(), modelSelect.value);
  if (!name) {
    alert('Car name cannot be empty!');
    return;
  }
  await updateCar(appState.selectedCarId, { name, color: getColor() });
  appState.selectedCarId = undefined;
  await renderApp();
};

const handleGenerate = async (button: HTMLButtonElement): Promise<void> => {
  button.setAttribute('disabled', 'true');
  await handleGenerateCars();
};

const handleClear = async (button: HTMLButtonElement): Promise<void> => {
  if (!confirm('Are you sure you want to delete all cars from the garage?'))
    return;
  button.setAttribute('disabled', 'true');
  await handleClearGarage();
};

const handleRace = async (
  raceButton: HTMLButtonElement,
  resetButton: HTMLButtonElement,
): Promise<void> => {
  raceButton.setAttribute('disabled', 'true');
  resetButton.setAttribute('disabled', 'true');
  const { items: cars } = await getCars(appState.currentPage);
  const winner = await startRace(cars);
  if (winner) {
    showWinnerModal(winner.car.name, winner.time);
    await saveWinnerResult(winner.car.id, winner.time);
  }
  resetButton.removeAttribute('disabled');
};

const handleReset = async (
  raceButton: HTMLButtonElement,
  resetButton: HTMLButtonElement,
): Promise<void> => {
  resetButton.setAttribute('disabled', 'true');
  const { items: cars } = await getCars(appState.currentPage);
  await resetRace(cars);
  raceButton.removeAttribute('disabled');
};

const refreshCarPreview = (
  colorButton: HTMLElement,
  previewBox: HTMLElement,
  getColor: () => string,
  getName: () => string,
): void => {
  colorButton.style.backgroundColor = getColor();
  previewBox.innerHTML = getCarSvgContent(getName(), getColor());
};

interface FormControls {
  nameInput: HTMLInputElement;
  modelSelect: HTMLSelectElement;
  colorButton: HTMLButtonElement;
  previewBox: HTMLElement;
  getColor: () => string;
  setColor: (color: string) => void;
  refreshPreview: () => void;
  pickColor: () => void;
}

const createFormControls = (
  placeholder: string,
  defaultColor: string,
  requiresSelection: boolean,
): FormControls => {
  let color = defaultColor;
  const nameInput = buildNamedInput(placeholder);
  const modelSelect = buildModelSelect();
  const colorButton = buildColorButton(color);
  const previewBox = buildPreviewBox();

  const getColor = (): string => color;
  const setColor = (value: string): void => {
    color = value;
  };
  const getName = (): string => carDisplayName(nameInput, modelSelect, 'Tesla');
  const refreshPreview = (): void =>
    refreshCarPreview(colorButton, previewBox, getColor, getName);
  const pickColor = makePickColor(
    getColor,
    getName,
    (nextColor) => {
      setColor(nextColor);
      refreshPreview();
    },
    requiresSelection,
  );

  nameInput.addEventListener('input', refreshPreview);
  modelSelect.addEventListener('change', refreshPreview);
  refreshPreview();

  return {
    nameInput,
    modelSelect,
    colorButton,
    previewBox,
    getColor,
    setColor,
    refreshPreview,
    pickColor,
  };
};

const populateUpdateForm = (
  car: Car,
  nameInput: HTMLInputElement,
  modelSelect: HTMLSelectElement,
  colorButton: HTMLButtonElement,
  updateButton: HTMLButtonElement,
  setColor: (color: string) => void,
  refreshPreview: () => void,
): void => {
  appState.selectedCarId = car.id;
  setColor(car.color);
  nameInput.value = car.name;
  nameInput.disabled = false;
  modelSelect.disabled = false;
  colorButton.disabled = false;
  updateButton.disabled = false;
  refreshPreview();
};

const handleDeleteCar = async (car: Car, cars: Car[]): Promise<void> => {
  await deleteCar(car.id);
  try {
    await deleteWinner(car.id);
  } catch {
    // Ignore missing winner record
  }
  if (appState.selectedCarId === car.id) appState.selectedCarId = undefined;
  if (cars.length === 1 && appState.currentPage > 1) appState.currentPage -= 1;
  await renderApp();
};

const buildErrorGarageView = (
  updateControls: UpdateControls,
  actionBar: HTMLElement,
  trackContainer: HTMLElement,
): HTMLElement => {
  const title = createElement({
    tag: 'h1',
    textContent: 'Garage (Server connection failed)',
  });
  const controls = buildCreateControls();
  return createElement({
    tag: 'div',
    children: [
      controls,
      updateControls.element,
      actionBar,
      title,
      trackContainer,
    ],
  });
};

const renderNavigation = (): HTMLElement => {
  const garageNavButton = buildNavButton('GARAGE');
  const winnersNavButton = buildNavButton('WINNERS');
  const settingsNavButton = buildNavButton('⚙️ SETTINGS', 'btn-primary');
  const muteNavButton = buildNavButton(
    audioManager.isMutedState ? 'UNMUTE' : 'MUTE',
    'btn-warning',
  );

  garageNavButton.addEventListener('click', () => navigate('garage'));
  winnersNavButton.addEventListener('click', () => navigate('winners'));
  settingsNavButton.addEventListener('click', () => showSettingsModal());
  muteNavButton.addEventListener('click', () => {
    const isMuted = audioManager.toggleMute();
    muteNavButton.textContent = isMuted ? 'UNMUTE' : 'MUTE';
  });

  return createElement({
    tag: 'nav',
    classNames: ['header-nav'],
    children: [
      garageNavButton,
      winnersNavButton,
      settingsNavButton,
      muteNavButton,
    ],
  });
};

const buildCreateControls = (): HTMLElement => {
  const {
    nameInput,
    modelSelect,
    colorButton,
    previewBox,
    getColor,
    pickColor,
  } = createFormControls('Car name', '#e66465', false);
  const createButton = createElement({
    tag: 'button',
    classNames: ['btn', 'btn-primary'],
    textContent: 'CREATE',
  });

  colorButton.addEventListener('click', pickColor);
  previewBox.addEventListener('click', pickColor);
  createButton.addEventListener('click', () =>
    handleCreateSubmit(nameInput, modelSelect, getColor),
  );

  return createElement({
    tag: 'div',
    classNames: ['control-row'],
    children: [nameInput, modelSelect, colorButton, previewBox, createButton],
  });
};

interface UpdateControls {
  element: HTMLElement;
  populate: (car: Car) => void;
}

const buildUpdateControls = (): UpdateControls => {
  const {
    nameInput,
    modelSelect,
    colorButton,
    previewBox,
    getColor,
    setColor,
    refreshPreview,
    pickColor,
  } = createFormControls('Select a car...', '#3b82f6', true);
  const updateButton = createElement({
    tag: 'button',
    classNames: ['btn', 'btn-primary'],
    textContent: 'UPDATE',
  });

  colorButton.addEventListener('click', pickColor);
  previewBox.addEventListener('click', pickColor);

  const populate = (car: Car): void =>
    populateUpdateForm(
      car,
      nameInput,
      modelSelect,
      colorButton,
      updateButton,
      setColor,
      refreshPreview,
    );

  updateButton.addEventListener('click', () =>
    handleUpdateSubmit(nameInput, modelSelect, getColor),
  );

  const element = createElement({
    tag: 'div',
    classNames: ['control-row'],
    children: [nameInput, modelSelect, colorButton, previewBox, updateButton],
  });

  return { element, populate };
};

const buildActionBar = (): HTMLElement => {
  const raceButton = createElement({
    tag: 'button',
    classNames: ['btn', 'btn-primary'],
    textContent: 'RACE',
  });
  const resetButton = createElement({
    tag: 'button',
    classNames: ['btn', 'btn-warning'],
    textContent: 'RESET',
    attributes: { disabled: 'true' },
  });
  const generateButton = createElement({
    tag: 'button',
    classNames: ['btn'],
    textContent: 'GENERATE CARS',
  });
  const clearButton = createElement({
    tag: 'button',
    classNames: ['btn', 'btn-danger'],
    textContent: 'CLEAR GARAGE',
  });

  generateButton.addEventListener('click', () =>
    handleGenerate(generateButton),
  );
  clearButton.addEventListener('click', () => handleClear(clearButton));
  raceButton.addEventListener('click', () =>
    handleRace(raceButton, resetButton),
  );
  resetButton.addEventListener('click', () =>
    handleReset(raceButton, resetButton),
  );

  return createElement({
    tag: 'div',
    classNames: ['control-row'],
    children: [raceButton, resetButton, generateButton, clearButton],
  });
};

const buildPagination = (totalPages: number): HTMLElement => {
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
    if (appState.currentPage <= 1) return;
    appState.currentPage -= 1;
    await renderApp();
  });

  nextButton.addEventListener('click', async () => {
    if (appState.currentPage >= totalPages) return;
    appState.currentPage += 1;
    await renderApp();
  });

  return createElement({
    tag: 'div',
    classNames: ['control-row'],
    children: [previousButton, nextButton],
  });
};

const renderCarCards = (
  cars: Car[],
  trackContainer: HTMLElement,
  updateControls: UpdateControls,
): void => {
  for (const car of cars) {
    const carCard = renderCarCard(car);

    const removeButton =
      carCard.querySelector<HTMLElement>(':scope .btn-danger');
    removeButton?.addEventListener('click', () => handleDeleteCar(car, cars));

    const selectButton = carCard.querySelector<HTMLButtonElement>(
      ':scope .car-header .btn:not(.btn-danger)',
    );
    selectButton?.addEventListener('click', () => updateControls.populate(car));

    trackContainer.append(carCard);
  }
};

const buildGarageView = async (): Promise<HTMLElement> => {
  const updateControls = buildUpdateControls();
  const actionBar = buildActionBar();
  const trackContainer = createElement({
    tag: 'div',
    classNames: ['track-container'],
  });

  let cars: Car[] = [];
  try {
    const response = await getCars(appState.currentPage);
    cars = response.items;
    appState.totalCars = response.totalCount;
  } catch {
    return buildErrorGarageView(updateControls, actionBar, trackContainer);
  }

  const totalPages = Math.ceil(appState.totalCars / CARS_PER_PAGE) || 1;
  const controls = buildCreateControls();
  const title = createElement({
    tag: 'h1',
    textContent: `Garage (${appState.totalCars})`,
  });
  const pageSubtitle = createElement({
    tag: 'h2',
    textContent: `Page #${appState.currentPage} / ${totalPages}`,
  });
  const pagination = buildPagination(totalPages);
  renderCarCards(cars, trackContainer, updateControls);

  return createElement({
    tag: 'div',
    children: [
      controls,
      updateControls.element,
      actionBar,
      title,
      pageSubtitle,
      pagination,
      trackContainer,
    ],
  });
};

export const renderApp = async (): Promise<void> => {
  if (!app) return;
  app.replaceChildren();

  const view =
    appState.view === 'winners'
      ? await renderWinnersView()
      : await buildGarageView();
  app.append(renderTitle(), renderNavigation(), view);
};
