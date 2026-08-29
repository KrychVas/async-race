import { createElement } from '../../ui/html-builder';
import type { Car } from '../../state/types';
import { startEngine, stopEngine, driveEngine } from '../../api/engine';
import {
  animateCar,
  stopAnimation,
  pauseAnimation,
} from '../../animation/race-animation';
import { getCarSvgContent } from '../../utils/car-mapping';
import { audioManager } from '../../utils/audio';

type BreakEffect = 'crash' | 'pedestrian' | 'police';
const EFFECT_TYPES: BreakEffect[] = ['crash', 'pedestrian', 'police'];
const EFFECT_COUNT = EFFECT_TYPES.length;

const showEffect = (
  carCard: HTMLElement,
  carId: number,
  effect: BreakEffect,
): void => {
  const container = carCard.querySelector(`#effect-${carId}`);
  if (!container) return;
  if (effect === 'crash') {
    container.innerHTML = '<span class="break-effect">💥 Engine Broken</span>';
    audioManager.playSound('crash');
  } else if (effect === 'pedestrian') {
    container.innerHTML = '<span class="break-effect">🚶 Pedestrian!</span>';
    audioManager.playSound('honk');
  } else {
    container.innerHTML =
      '<span class="break-effect">🚓 Stopped by Police</span>';
    audioManager.playSound('police');
  }
};

const clearEffect = (carCard: HTMLElement, carId: number): void => {
  const container = carCard.querySelector(`#effect-${carId}`);
  if (container) container.replaceChildren();
};

const setDrivingState = (
  buttonA: HTMLButtonElement,
  buttonB: HTMLButtonElement,
  isDriving: boolean,
): void => {
  if (isDriving) {
    buttonA.setAttribute('disabled', 'true');
    buttonB.removeAttribute('disabled');
  } else {
    buttonB.setAttribute('disabled', 'true');
    buttonA.removeAttribute('disabled');
  }
};

const setupEngineControls = (
  carCard: HTMLElement,
  carId: number,
  buttonA: HTMLButtonElement,
  buttonB: HTMLButtonElement,
): void => {
  buttonA.addEventListener('click', async () => {
    setDrivingState(buttonA, buttonB, true);
    clearEffect(carCard, carId);

    const { velocity, distance } = await startEngine(carId);
    audioManager.playSound('start');

    const animationPromise = animateCar(carId, velocity, distance);
    const driveResult = await driveEngine(carId);

    if (!driveResult.success) {
      pauseAnimation(carId);
      const effect = EFFECT_TYPES[Math.floor(Math.random() * EFFECT_COUNT)];
      showEffect(carCard, carId, effect);
      return;
    }

    await animationPromise;
    setDrivingState(buttonA, buttonB, false);
  });

  buttonB.addEventListener('click', async () => {
    buttonB.setAttribute('disabled', 'true');
    stopAnimation(carId);
    clearEffect(carCard, carId);
    await stopEngine(carId);
    buttonA.removeAttribute('disabled');
  });
};

const createTrackElement = (carId: number): HTMLElement =>
  createElement({
    tag: 'div',
    classNames: ['track'],
    children: [
      createElement({ tag: 'div', classNames: ['finish-line'] }),
      createElement({
        tag: 'div',
        classNames: ['car-skid-mark'],
        attributes: { id: `skid-${carId}` },
      }),
      createElement({
        tag: 'div',
        classNames: ['car-icon'],
        attributes: { id: `car-${carId}` },
      }),
      createElement({
        tag: 'div',
        classNames: ['effect-container'],
        attributes: { id: `effect-${carId}` },
      }),
    ],
  });

const buildHeader = (car: Car): HTMLElement =>
  createElement({
    tag: 'div',
    classNames: ['car-header'],
    children: [
      createElement({
        tag: 'button',
        classNames: ['btn'],
        textContent: 'SELECT',
      }),
      createElement({
        tag: 'button',
        classNames: ['btn', 'btn-danger'],
        textContent: 'REMOVE',
      }),
      createElement({ tag: 'span', textContent: car.name }),
    ],
  });

export const renderCarCard = (car: Car): HTMLElement => {
  const buttonA = createElement({
    tag: 'button',
    classNames: ['btn', 'btn-primary'],
    textContent: 'A',
  });
  const buttonB = createElement({
    tag: 'button',
    classNames: ['btn', 'btn-warning'],
    textContent: 'B',
    attributes: { disabled: 'true' },
  });

  const carCard = createElement({
    tag: 'div',
    classNames: ['car-row'],
    children: [
      buildHeader(car),
      createElement({
        tag: 'div',
        classNames: ['car-header'],
        children: [buttonA, buttonB],
      }),
      createTrackElement(car.id),
    ],
  });

  const carIcon = carCard.querySelector(`#car-${car.id}`);
  if (carIcon) carIcon.innerHTML = getCarSvgContent(car.name, car.color);

  setupEngineControls(carCard, car.id, buttonA, buttonB);
  return carCard;
};
