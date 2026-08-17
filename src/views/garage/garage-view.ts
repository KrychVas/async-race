import { createCar, clearAllCars } from '../../api/garage';
import { generate100Cars } from '../../utils/generate-cars';
import { scheduleRender } from '../../state/render-scheduler';

export { startRace, resetRace } from './race-controller';
export { showWinnerModal } from '../../ui/winner-modal';
export { saveWinnerResult } from '../../api/winners';
export { getCars, clearAllCars } from '../../api/garage';

export const handleGenerateCars = async (): Promise<void> => {
  const newCars = generate100Cars();
  await Promise.all(newCars.map((car) => createCar(car)));
  await scheduleRender();
};

export const handleClearGarage = async (): Promise<void> => {
  await clearAllCars();
  await scheduleRender();
};