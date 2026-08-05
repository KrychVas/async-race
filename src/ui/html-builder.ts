export interface ElementOptions {
  tag: keyof HTMLElementTagNameMap;
  classNames?: string[];
  textContent?: string;
  attributes?: Record<string, string>;
  children?: HTMLElement[];
}

export const createElement = <K extends keyof HTMLElementTagNameMap>(
  options: ElementOptions & { tag: K }
): HTMLElementTagNameMap[K] => {
  const element = document.createElement(options.tag) as HTMLElementTagNameMap[K];

  if (options.classNames) {
    element.classList.add(...options.classNames);
  }

  if (options.textContent) {
    element.textContent = options.textContent;
  }

  if (options.attributes) {
    Object.entries(options.attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
  }

  if (options.children) {
    options.children.forEach((child) => element.appendChild(child));
  }

  return element;
};