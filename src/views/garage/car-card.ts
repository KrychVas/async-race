import { createElement } from '../../ui/html-builder';
import type { Car } from '../../state/types';

export const getCarSvg = (color: string): string => `
  <svg viewBox="0 0 512 512" width="50" height="25" fill="${color}">
    <path d="M499.99 176h-59.87l-16.64-41.6C416.38 116.17 398.73 104 378.78 104H133.22c-19.95 0-37.6 12.17-44.7 30.4L71.88 176H12.01C5.38 176 0 181.38 0 188.01v68c0 6.63 5.38 12.01 12.01 12.01h20.12c1.78 30.95 27.42 55.98 58.87 55.98 31.45 0 57.09-25.03 58.87-55.98h212.26c1.78 30.95 27.42 55.98 58.87 55.98 31.45 0 57.09-25.03 58.87-55.98h20.12c6.63 0 12.01-5.38 12.01-12.01v-68c0-6.63-5.38-12.01-12.01-12.01zM91 292c-15.46 0-28-12.54-28-28s12.54-28 28-28 28 12.54 28 28-12.54 28-28 28zm330 0c-15.46 0-28-12.54-28-28s12.54-28 28-28 28 12.54 28 28-12.54 28-28 28z"/>
  </svg>
`;

export const renderCarCard = (car: Car): HTMLElement => {
  const carCard = createElement({
    tag: 'div',
    classNames: ['car-row'],
    children: [
      createElement({
        tag: 'div',
        classNames: ['car-header'],
        children: [
          createElement({ tag: 'button', classNames: ['btn'], textContent: 'SELECT' }),
          createElement({ tag: 'button', classNames: ['btn', 'btn-danger'], textContent: 'REMOVE' }),
          createElement({ tag: 'span', textContent: car.name }),
        ],
      }),
      createElement({
        tag: 'div',
        classNames: ['car-header'],
        children: [
          createElement({ tag: 'button', classNames: ['btn', 'btn-primary'], textContent: 'A' }),
          createElement({ tag: 'button', classNames: ['btn', 'btn-warning'], textContent: 'B', attributes: { disabled: 'true' } }),
        ],
      }),
      createElement({
        tag: 'div',
        classNames: ['track'],
        children: [
          createElement({
            tag: 'div',
            classNames: ['car-icon'],
            attributes: { id: `car-${car.id}` },
          }),
          createElement({ tag: 'div', classNames: ['finish-line'] }),
        ],
      }),
    ],
  });

  const carIcon = carCard.querySelector(`#car-${car.id}`);
  if (carIcon) {
    carIcon.innerHTML = getCarSvg(car.color);
  }

  return carCard;
};