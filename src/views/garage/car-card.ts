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

export const renderCarCard = (car: Car): HTMLElement => {
  const btnA = createElement({
    tag: 'button',
    classNames: ['btn', 'btn-primary'],
    textContent: 'A',
  });
  const btnB = createElement({
    tag: 'button',
    classNames: ['btn', 'btn-warning'],
    textContent: 'B',
    attributes: { disabled: 'true' },
  });

  const carCard = createElement({
    tag: 'div',
    classNames: ['car-row'],
    children: [
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
      }),
      createElement({
        tag: 'div',
        classNames: ['car-header'],
        children: [btnA, btnB],
      }),
      createElement({
        tag: 'div',
        classNames: ['track'],
        children: [
          createElement({ tag: 'div', classNames: ['finish-line'] }),
          createElement({
            tag: 'div',
            classNames: ['car-skid-mark'],
            attributes: { id: `skid-${car.id}` },
          }),
          createElement({
            tag: 'div',
            classNames: ['car-icon'],
            attributes: { id: `car-${car.id}` },
          }),
          createElement({
            tag: 'div',
            classNames: ['effect-container'],
            attributes: { id: `effect-${car.id}` },
          }),
        ],
      }),
    ],
  });

  const carIcon = carCard.querySelector(`#car-${car.id}`);
  if (carIcon) {
    carIcon.innerHTML = getCarSvgContent(car.name, car.color);
  }

  const getEffectContainer = (): Element | null =>
    carCard.querySelector(`#effect-${car.id}`);

  const showEffect = (effect: BreakEffect): void => {
    const container = getEffectContainer();
    if (!container) return;
    if (effect === 'crash') {
      container.innerHTML =
        '<span class="break-effect">💥 Engine Broken</span>';
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

  const clearEffect = (): void => {
    const container = getEffectContainer();
    if (container) container.innerHTML = '';
  };

  const setDriving = (isDriving: boolean): void => {
    if (isDriving) {
      btnA.setAttribute('disabled', 'true');
      btnB.removeAttribute('disabled');
    } else {
      btnB.setAttribute('disabled', 'true');
      btnA.removeAttribute('disabled');
    }
  };

  // 1. Старт двигуна (Кнопка A)
  btnA.addEventListener('click', async () => {
    setDriving(true);
    clearEffect();

    const { velocity, distance } = await startEngine(car.id);
    audioManager.playSound('start');

    const animationPromise = animateCar(car.id, velocity, distance);
    const driveResult = await driveEngine(car.id);

    if (!driveResult.success) {
      pauseAnimation(car.id);
      const effect = EFFECT_TYPES[Math.floor(Math.random() * EFFECT_COUNT)];
      showEffect(effect);
      return;
    }

    // Wait for animation to finish, THEN re-enable A
    await animationPromise;
    setDriving(false);
  });

  // 2. Зупинка двигуна (Кнопка B)
  btnB.addEventListener('click', async () => {
    btnB.setAttribute('disabled', 'true');
    stopAnimation(car.id);
    clearEffect();
    await stopEngine(car.id);
    btnA.removeAttribute('disabled');
  });

  return carCard;
};
