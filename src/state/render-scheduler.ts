/**
 * A simple render scheduler to avoid circular imports between
 * main.ts and garage-view.ts.
 * main.ts registers the render function; other modules call scheduleRender().
 */

type RenderFunction = () => Promise<void>;

let registeredRender: RenderFunction | null = null;

export const registerRender = (function_: RenderFunction): void => {
  registeredRender = function_;
};

export const scheduleRender = async (): Promise<void> => {
  if (registeredRender) {
    await registeredRender();
  }
};
