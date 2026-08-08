export interface AnimationState {
  id: number;
  requestId: number;
}

const activeAnimations = new Map<number, AnimationState>();

export const animateCar = (
  id: number,
  velocity: number,
  distance: number,
): Promise<{ success: boolean; id: number }> => {
  const carElement = document.getElementById(`car-${id}`);
  const track = carElement?.parentElement;

  // 1. Ранній повернення, якщо елемента немає в DOM
  if (!carElement || !track) return Promise.resolve({ success: false, id });

  const trackWidth = track.clientWidth - 100;
  const duration = distance / velocity;
  let start: number | null = null;

  return new Promise((resolve) => {
    function step(timestamp: number) {
      // 2. Додаткова перевірка всередині кадру анімації для TypeScript
      if (!carElement) {
        resolve({ success: false, id });
        return;
      }

      if (!start) start = timestamp;
      const progress = timestamp - start;
      const passed = Math.min(progress / duration, 1);

      const currentPos = passed * trackWidth;
      carElement.style.transform = `translateX(${currentPos}px)`;

      if (passed < 1) {
        const requestId = requestAnimationFrame(step);
        activeAnimations.set(id, { id, requestId });
      } else {
        activeAnimations.delete(id);
        resolve({ success: true, id });
      }
    }

    const requestId = requestAnimationFrame(step);
    activeAnimations.set(id, { id, requestId });
  });
};

export const stopAnimation = (id: number): void => {
  const animation = activeAnimations.get(id);
  if (animation) {
    cancelAnimationFrame(animation.requestId);
    activeAnimations.delete(id);
  }

  const carElement = document.getElementById(`car-${id}`);
  if (carElement) {
    carElement.style.transform = 'translateX(0)';
  }
};

export const pauseAnimation = (id: number): void => {
  const animation = activeAnimations.get(id);
  if (animation) {
    cancelAnimationFrame(animation.requestId);
    activeAnimations.delete(id);
  }
};