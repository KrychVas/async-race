export interface AnimationState {
  id: number;
  requestId: number;
}

const TRACK_PADDING = 50;
const DEFAULT_FINISH_OFFSET = 76;
const SKID_START_OFFSET = 10;

const activeAnimations = new Map<number, AnimationState>();

const updateSkidMark = (
  skidElement: HTMLElement | null,
  currentPos: number,
  finishLineX: number,
): void => {
  if (!skidElement || currentPos <= finishLineX) return;
  const skidStart = finishLineX + SKID_START_OFFSET;
  const skidWidth = Math.max(0, currentPos - skidStart);
  skidElement.style.left = `${skidStart}px`;
  skidElement.style.width = `${skidWidth}px`;
  skidElement.style.opacity = '1';
};

export const animateCar = (
  id: number,
  velocity: number,
  distance: number,
): Promise<{ success: boolean; id: number }> => {
  const carElement = document.querySelector<HTMLElement>(`#car-${id}`);
  const track = carElement?.parentElement;

  if (!carElement || !track) return Promise.resolve({ success: false, id });

  const trackWidth = track.clientWidth - TRACK_PADDING;
  const duration = distance / velocity;
  let start: number | undefined;

  const skidElement = document.querySelector<HTMLElement>(`#skid-${id}`);
  const finishLineElement = track.querySelector<HTMLElement>('.finish-line');
  const finishLineX = finishLineElement
    ? finishLineElement.offsetLeft
    : track.clientWidth - DEFAULT_FINISH_OFFSET;

  return new Promise((resolve) => {
    function step(timestamp: number) {
      if (!carElement) {
        resolve({ success: false, id });
        return;
      }

      if (start === undefined) start = timestamp;
      const progress = timestamp - start;
      const passed = Math.min(progress / duration, 1);
      const currentPos = passed * trackWidth;

      carElement.style.transform = `translateX(${currentPos}px)`;
      updateSkidMark(skidElement, currentPos, finishLineX);

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

  const carElement = document.querySelector<HTMLElement>(`#car-${id}`);
  if (carElement) {
    carElement.style.transform = 'translateX(0)';
  }

  const skidElement = document.querySelector<HTMLElement>(`#skid-${id}`);
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