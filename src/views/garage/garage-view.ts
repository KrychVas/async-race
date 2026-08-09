import { createElement } from '../../ui/html-builder';
import { getCars, createCar } from '../../api/garage';
import { renderCarCard } from './car-card';
import { startRace, resetRace } from './race-controller';
import { showWinnerModal } from '../../ui/winner-modal';
import { appState } from '../../state/app-state';
import type { Car } from '../../state/types';
import { generate100Cars } from '../../utils/generate-cars';
import { saveWinnerResult } from '../../api/winners';

export const handleGenerateCars = async (): Promise<void> => {
  const newCars = generate100Cars();
  await Promise.all(newCars.map((car) => createCar(car)));
  location.reload();
};

// Global Event Delegation for all action buttons
document.addEventListener('click', async (event) => {
  const target = event.target as HTMLElement;
  if (!target || target.tagName !== 'BUTTON') return;

  const btnText = target.textContent?.trim().toUpperCase();

  // 1. Click on RACE button
  if (btnText === 'RACE') {
    target.setAttribute('disabled', 'true');

    const { items: cars } = await getCars(appState.currentPage);
    const winner = await startRace(cars);

    if (winner) {
      showWinnerModal(winner.car.name, winner.time);
      await saveWinnerResult(winner.car.id, winner.time);
    }
  }

  // 2. Click on RESET button
  if (btnText === 'RESET') {
    target.setAttribute('disabled', 'true');

    const { items: cars } = await getCars(appState.currentPage);
    await resetRace(cars);

    const raceBtn = Array.from(document.querySelectorAll('button')).find(
      (btn) => btn.textContent?.trim().toUpperCase() === 'RACE'
    );
    if (raceBtn) raceBtn.removeAttribute('disabled');
  }

  // 3. Click on GENERATE CARS button
  if (btnText === 'GENERATE CARS') {
    target.setAttribute('disabled', 'true');
    await handleGenerateCars();
  }
});

export const renderGarageView = async (): Promise<HTMLElement> => {
  const { items: cars, totalCount } = await getCars(appState.currentPage);

  const carList = createElement({
    tag: 'div',
    classNames: ['car-list'],
    children: cars.map((car: Car) => renderCarCard(car)),
  });

  return createElement({
    tag: 'div',
    classNames: ['garage-view'],
    children: [
      createElement({ tag: 'h2', textContent: `Garage (${totalCount})` }),
      createElement({ tag: 'h3', textContent: `Page #${appState.currentPage}` }),
      carList,
    ],
  });
};