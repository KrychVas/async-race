import { createCar, getCars } from '../../api/garage';
import { appState } from '../../state/app-state';
import { generate100Cars } from '../../utils/generate-cars';

export const handleGenerateCars = async (): Promise<void> => {
  const newCars = generate100Cars();
  await Promise.all(newCars.map((car) => createCar(car)));
  const { items, totalCount } = await getCars(appState.currentPage);
  appState.cars = items;
  appState.totalCars = totalCount;
};