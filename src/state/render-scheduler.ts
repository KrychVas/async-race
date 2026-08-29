/**
 * A simple render scheduler to avoid circular imports between
 * main.ts and garage-view.ts.
 * main.ts registers the render function; other modules call scheduleRender().
 */

type RenderFunction = () => Promise<void>;

const state: { registeredRender?: RenderFunction } = {
  registeredRender: undefined,
};

export const registerRender = (function_: RenderFunction): void => {
  state.registeredRender = function_;
};

export const scheduleRender = async (): Promise<void> => {
  if (state.registeredRender) {
    await state.registeredRender();
  }
};