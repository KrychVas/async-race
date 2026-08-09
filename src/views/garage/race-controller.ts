import type { Car } from '../../state/types';
import { startEngine, stopEngine, driveEngine } from '../../api/engine';
import { animateCar, stopAnimation, pauseAnimation } from '../../animation/race-animation';

export interface WinnerResult {
  car: Car;
  time: number;
}

export const startRace = async (cars: Car[]): Promise<WinnerResult | null> => {
  return new Promise((resolve) => {
    let winnerFound = false;
    let finishedCount = 0;

    if (!cars.length) {
      resolve(null);
      return;
    }

    cars.forEach(async (car) => {
      const startTime = performance.now();

      try {
        const { velocity, distance } = await startEngine(car.id);

        const animationPromise = animateCar(car.id, velocity, distance);
        const drivePromise = driveEngine(car.id);

        const driveResult = await drivePromise;

        // Зупинка при поломці двигуна (500 Server Error)
        if (!driveResult.success) {
          pauseAnimation(car.id);
          return;
        }

        await animationPromise;

        const endTime = performance.now();
        const time = Number(((endTime - startTime) / 1000).toFixed(2));

        // Перше авто без поломки — переможець
        if (!winnerFound) {
          winnerFound = true;
          resolve({ car, time });
        }
      } catch (error) {
        console.warn(`Race error on car #${car.id}:`, error);
        pauseAnimation(car.id);
      } finally {
        finishedCount += 1;
        if (finishedCount === cars.length && !winnerFound) {
          resolve(null);
        }
      }
    });
  });
};

export const resetRace = async (cars: Car[]): Promise<void> => {
  const stopPromises = cars.map(async (car) => {
    try {
      stopAnimation(car.id);
      await stopEngine(car.id);
    } catch (error) {
      console.error(`Reset error for car #${car.id}:`, error);
    }
  });

  await Promise.all(stopPromises);
};