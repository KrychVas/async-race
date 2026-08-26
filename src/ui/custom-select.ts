import {
  BODY_TYPES,
  getCarSvgContent,
  type BodyTypeOption,
} from '../utils/car-mapping';

export class CustomSelect {
  private element: HTMLElement;

  private selectedValue: string;

  private currentColor: string;

  private onChangeCallback: (selectedOptionValue: string) => void;

  private documentClickHandler: ((event_: Event) => void) | undefined;

  constructor(
    initialValue: string,
    currentColor: string,
    onChange: (selectedOptionValue: string) => void,
  ) {
    this.selectedValue = initialValue;
    this.currentColor = currentColor;
    this.onChangeCallback = onChange;
    this.element = document.createElement('div');
    this.element.className = 'custom-select-container';

    this.buildMarkup();
    this.attachEvents();
  }

  private attachEvents(): void {
    const trigger = this.element.querySelector(':scope .custom-select-trigger');
    const options = this.element.querySelector(':scope .custom-select-options');

    trigger?.addEventListener('click', (event_) => {
      event_.stopPropagation();
      options?.classList.toggle('hidden');
    });

    const optionElements = this.element.querySelectorAll<HTMLElement>(
      ':scope .custom-select-option',
    );
    for (const optionElement of optionElements) {
      optionElement.addEventListener('click', (event_) => {
        event_.stopPropagation();
        const selectedValueName = optionElement.dataset.value || 'auto';
        this.selectedValue = selectedValueName;
        this.onChangeCallback(selectedValueName);

        options?.classList.add('hidden');
        this.updateTriggerContent();
        this.updateActiveOptionState();
      });
    }

    if (this.documentClickHandler) {
      document.removeEventListener('click', this.documentClickHandler);
    }

    this.documentClickHandler = () => {
      options?.classList.add('hidden');
    };

    document.addEventListener('click', this.documentClickHandler);
  }

  private updateTriggerContent(): void {
    const selectedOption =
      BODY_TYPES.find(
        (bodyType: BodyTypeOption) => bodyType.id === this.selectedValue,
      ) || BODY_TYPES[0];
    const svgIcon = getCarSvgContent(selectedOption.id, this.currentColor);

    const iconSpan = this.element.querySelector(
      ':scope .custom-select-trigger .custom-select-icon',
    );
    const textSpan = this.element.querySelector(
      ':scope .custom-select-trigger .custom-select-text',
    );

    if (iconSpan) iconSpan.innerHTML = svgIcon;
    if (textSpan) textSpan.textContent = selectedOption.name;
  }

  private updateActiveOptionState(): void {
    const optionElements = this.element.querySelectorAll<HTMLElement>(
      ':scope .custom-select-option',
    );
    for (const optionElement of optionElements) {
      const optionValue = optionElement.dataset.value;
      optionElement.classList.toggle(
        'selected',
        optionValue === this.selectedValue,
      );
    }
  }

  private buildMarkup(): void {
    const selectedOption =
      BODY_TYPES.find(
        (bodyType: BodyTypeOption) => bodyType.id === this.selectedValue,
      ) || BODY_TYPES[0];
    const svgIcon = getCarSvgContent(selectedOption.id, this.currentColor);

    this.element.innerHTML = `
      <div class="custom-select-trigger">
        <span class="custom-select-icon">${svgIcon}</span>
        <span class="custom-select-text">${selectedOption.name}</span>
        <span class="custom-select-arrow">▼</span>
      </div>
      <div class="custom-select-options hidden">
        ${BODY_TYPES.map(
          (type: BodyTypeOption) => `
          <div class="custom-select-option ${type.id === this.selectedValue ? 'selected' : ''}" data-value="${type.id}">
            <span class="custom-select-icon">${getCarSvgContent(type.id, this.currentColor)}</span>
            <span>${type.name}</span>
          </div>
        `,
        ).join('')}
      </div>
    `;
  }

  public render(newColor: string): void {
    this.currentColor = newColor;
    this.buildMarkup();
    this.attachEvents();
  }

  public getElement(): HTMLElement {
    return this.element;
  }

  public getValue(): string {
    return this.selectedValue;
  }
}
