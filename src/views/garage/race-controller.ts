import type { Car } from '../../state/types';
import { startEngine, stopEngine, driveEngine } from '../../api/engine';
import { animateCar, stopAnimation, pauseAnimation } from '../../animation/race-animation';

export interface WinnerResult {
  car: Car;
  time: number;
}

// Запуск масової гонки для поточних машин на сторінці
export const startRace = async (cars: Car[]): Promise<WinnerResult | null> => {
  let winnerFound = false;

  const racePromises = cars.map(async (car) => {
    const startTime = performance.now();

    try {
      const { velocity, distance } = await startEngine(car.id);
      const animationPromise = animateCar(car.id, velocity, distance);
      const drivePromise = driveEngine(car.id);

      const driveResult = await drivePromise;

      if (!driveResult.success) {
        pauseAnimation(car.id);
        return null;
      }

      const animationResult = await animationPromise;
      const endTime = performance.now();
      const time = Number(((endTime - startTime) / 1000).toFixed(2));

      // Перша машина, яка успішно доїхала без поломки — переможець
      if (animationResult.success && !winnerFound) {
        winnerFound = true;
        return { car, time };
      }
    } catch {
      pauseAnimation(car.id);
    }

    return null;
  });

  const results = await Promise.all(racePromises);
  const winner = results.find((result): result is WinnerResult => result !== null);

  return winner || null;
};

// Зупинка та скидання всіх машин на сторінці
export const resetRace = async (cars: Car[]): Promise<void> => {
  const stopPromises = cars.map(async (car) => {
    stopAnimation(car.id);
    await stopEngine(car.id);
  });

  await Promise.all(stopPromises);
};