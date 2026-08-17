/**
 * A simple render scheduler to avoid circular imports between
 * main.ts and garage-view.ts.
 * main.ts registers the render function; other modules call scheduleRender().
 */

type RenderFn = () => Promise<void>;

let registeredRender: RenderFn | null = null;

export const registerRender = (fn: RenderFn): void => {
  registeredRender = fn;
};

export const scheduleRender = async (): Promise<void> => {
  if (registeredRender) {
    await registeredRender();
  }
};
