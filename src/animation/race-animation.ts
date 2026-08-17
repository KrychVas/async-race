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

  // Finish line is at right: 60px. Track width calculated for car to stop fully visible past it.
  const trackWidth = track.clientWidth - 50;
  const duration = distance / velocity;
  let start: number | null = null;

  const skidElement = document.getElementById(`skid-${id}`);
  const finishLineX = track.clientWidth - 76;

  return new Promise((resolve) => {
    function step(timestamp: number) {
      if (!carElement) {
        resolve({ success: false, id });
        return;
      }

      if (!start) start = timestamp;
      const progress = timestamp - start;
      const passed = Math.min(progress / duration, 1);

      const currentPos = passed * trackWidth;
      carElement.style.transform = `translateX(${currentPos}px)`;

      // Draw tire skid trail on asphalt after crossing the finish line
      if (skidElement && currentPos > finishLineX) {
        const skidStart = finishLineX + 10;
        const skidWidth = Math.max(0, currentPos - skidStart);
        skidElement.style.left = `${skidStart}px`;
        skidElement.style.width = `${skidWidth}px`;
        skidElement.style.opacity = '1';
      }

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

  const skidElement = document.getElementById(`skid-${id}`);
  if (skidElement) {
    skidElement.style.width = '0px';
    skidElement.style.opacity = '0';
  }
};

export const pauseAnimation = (id: number): void => {
  const animation = activeAnimations.get(id);
  if (animation) {
    cancelAnimationFrame(animation.requestId);
    activeAnimations.delete(id);
  }
};