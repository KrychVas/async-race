import { createElement } from './html-builder';

export const showWinnerModal = (name: string, time: number): void => {
  const modal = createElement({
    tag: 'div',
    classNames: ['winner-modal'],
    textContent: `🏆 Переможець: ${name} (${time}s)!`,
  });

  document.body.appendChild(modal);

  setTimeout(() => {
    modal.remove();
  }, 5000);
};