export interface ElementOptions {
  tag: keyof HTMLElementTagNameMap;
  classNames?: string[];
  textContent?: string;
  attributes?: Record<string, string>;
  children?: HTMLElement[];
}

export const createElement = <K extends keyof HTMLElementTagNameMap>(
  options: ElementOptions & { tag: K },
): HTMLElementTagNameMap[K] => {
  const element = document.createElement(
    options.tag,
  ) as HTMLElementTagNameMap[K];

  if (options.classNames) {
    element.classList.add(...options.classNames);
  }

  if (options.textContent) {
    element.textContent = options.textContent;
  }

  if (options.attributes) {
    for (const [key, value] of Object.entries(options.attributes)) {
      element.setAttribute(key, value);
    }
  }

  if (options.children) {
    for (const child of options.children) {
      element.append(child);
    }
  }

  return element;
};
