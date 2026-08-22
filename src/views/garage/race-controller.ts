import type { Car } from '../../state/types';
import { startEngine, stopEngine, driveEngine } from '../../api/engine';
import { animateCar, stopAnimation, pauseAnimation } from '../../animation/race-animation';
import { audioManager } from '../../utils/audio';

export interface WinnerResult {
  car: Car;
  time: number;
}

type BreakEffect = 'crash' | 'pedestrian' | 'police';
const EFFECT_TYPES: BreakEffect[] = ['crash', 'pedestrian', 'police'];
const EFFECT_COUNT = EFFECT_TYPES.length;

const MS_PER_SEC = 1000;
const TIME_DECIMALS = 2;

const showBreakEffect = (carId: number, effect: BreakEffect): void => {
  const effectContainer = document.querySelector(`#effect-${carId}`);
  if (!effectContainer) return;

  if (effect === 'crash') {
    effectContainer.innerHTML = '<span class="break-effect">💥 Engine Broken</span>';
    audioManager.playSound('crash');
  } else if (effect === 'pedestrian') {
    effectContainer.innerHTML = '<span class="break-effect">🚶 Pedestrian!</span>';
    audioManager.playSound('honk');
  } else {
    effectContainer.innerHTML = '<span class="break-effect">🚓 Stopped by Police</span>';
    audioManager.playSound('police');
  }
};

const clearEffect = (carId: number): void => {
  const effectContainer = document.querySelector(`#effect-${carId}`);
  if (effectContainer) effectContainer.replaceChildren();
};

const runCarRace = async (
  car: Car,
  onWin: (result: WinnerResult) => void,
  onFinish: () => void,
): Promise<void> => {
  clearEffect(car.id);

  try {
    const { velocity, distance } = await startEngine(car.id);
    audioManager.playSound('start');

    // startTime measured AFTER engine response — accurate race time
    const startTime = performance.now();

    const animationPromise = animateCar(car.id, velocity, distance);
    const driveResult = await driveEngine(car.id);

    if (!driveResult.success) {
      pauseAnimation(car.id);
      const effect = EFFECT_TYPES[Math.floor(Math.random() * EFFECT_COUNT)];
      showBreakEffect(car.id, effect);
      return;
    }

    await animationPromise;

    const time = Number(((performance.now() - startTime) / MS_PER_SEC).toFixed(TIME_DECIMALS));
    onWin({ car, time });
  } catch (error) {
    console.warn(`Race error on car #${car.id}:`, error);
    pauseAnimation(car.id);
  } finally {
    onFinish();
  }
};

export const startRace = (cars: Car[]): Promise<WinnerResult | undefined> => {
  return new Promise((resolve) => {
    if (cars.length === 0) {
      resolve(undefined);
      return;
    }

    let isWinnerFound = false;
    let finishedCount = 0;
    const total = cars.length;

    const onWin = (result: WinnerResult): void => {
      if (isWinnerFound) {
        return;
      }

      isWinnerFound = true;
      resolve(result);
    };

    const onFinish = (): void => {
      finishedCount += 1;
      if (finishedCount === total && !isWinnerFound) {
        resolve(undefined);
      }
    };

    for (const car of cars) {
      runCarRace(car, onWin, onFinish);
    }
  });
};

export const resetRace = async (cars: Car[]): Promise<void> => {
  await Promise.all(
    cars.map(async (car) => {
      try {
        stopAnimation(car.id);
        await stopEngine(car.id);
        clearEffect(car.id);
      } catch (error) {
        console.error(`Reset error for car #${car.id}:`, error);
      }
    }),
  );
};