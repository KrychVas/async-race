import { createElement } from './html-builder';
import { getCarSvgContent } from '../utils/car-mapping';

const PRESET_COLORS = [
  '#e66465',
  '#3b82f6',
  '#22c55e',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#10b981',
  '#f97316',
  '#eab308',
  '#64748b',
  '#ffffff',
  '#000000',
  '#00ffcc',
];

export interface OpenColorPickerOptions {
  currentColor: string;
  carName: string;
  onApply: (selectedColor: string) => void;
}

const createPaletteGrid = (
  onSelect: (colorHex: string) => void,
): HTMLElement => {
  const paletteContainer = createElement({
    tag: 'div',
    classNames: ['color-palette-grid'],
  });

  for (const colorHex of PRESET_COLORS) {
    const swatch = createElement({
      tag: 'button',
      classNames: ['color-swatch'],
      attributes: { style: `background-color: ${colorHex};` },
    });

    swatch.addEventListener('click', () => onSelect(colorHex));
    paletteContainer.append(swatch);
  }

  return paletteContainer;
};

const createActionButtons = (
  onApply: () => void,
  onCancel: () => void,
): HTMLElement => {
  const okButton = createElement({
    tag: 'button',
    classNames: ['btn', 'btn-primary'],
    textContent: 'OK (Apply Color)',
  });
  const cancelButton = createElement({
    tag: 'button',
    classNames: ['btn', 'btn-danger'],
    textContent: 'Cancel',
  });

  okButton.addEventListener('click', onApply);
  cancelButton.addEventListener('click', onCancel);

  return createElement({
    tag: 'div',
    classNames: ['control-row'],
    children: [okButton, cancelButton],
  });
};

const createModalPreview = (carName: string, color: string): HTMLElement => {
  const previewBox = createElement({
    tag: 'div',
    classNames: ['car-preview-box', 'modal-car-preview'],
  });
  previewBox.innerHTML = getCarSvgContent(carName, color);
  return previewBox;
};

const createNativeColorInput = (
  value: string,
  onChange: (newColor: string) => void,
): HTMLInputElement => {
  const input = createElement({
    tag: 'input',
    attributes: { type: 'color', value },
  });
  input.addEventListener('input', () => onChange(input.value));
  input.addEventListener('change', () => onChange(input.value));
  return input;
};

const createColorControlRow = (input: HTMLInputElement): HTMLElement =>
  createElement({
    tag: 'div',
    classNames: ['control-row', 'color-modal-row'],
    children: [
      createElement({ tag: 'label', textContent: 'Custom Color:' }),
      input,
    ],
  });

const createColorModal = (
  title: HTMLElement,
  previewBox: HTMLElement,
  paletteContainer: HTMLElement,
  colorControlRow: HTMLElement,
  buttonRow: HTMLElement,
): HTMLElement =>
  createElement({
    tag: 'div',
    classNames: ['settings-modal', 'color-picker-modal'],
    children: [title, previewBox, paletteContainer, colorControlRow, buttonRow],
  });

const createColorPickerOverlay = (): HTMLElement =>
  createElement({
    tag: 'div',
    classNames: ['settings-overlay', 'color-picker-overlay'],
  });

const createColorModalTitle = (): HTMLElement =>
  createElement({ tag: 'h2', textContent: '🎨 Select Car Color' });

export const openColorPickerModal = (options: OpenColorPickerOptions): void => {
  const existing = document.querySelector('.color-picker-overlay');
  if (existing) existing.remove();

  let temporaryColor = options.currentColor;
  const overlay = createColorPickerOverlay();
  const modalTitle = createColorModalTitle();
  const previewBox = createModalPreview(options.carName, temporaryColor);

  const handleColorChange = (newColor: string): void => {
    temporaryColor = newColor;
    previewBox.innerHTML = getCarSvgContent(options.carName, temporaryColor);
  };

  const nativeColorInput = createNativeColorInput(
    temporaryColor,
    handleColorChange,
  );
  const paletteContainer = createPaletteGrid(handleColorChange);
  const colorControlRow = createColorControlRow(nativeColorInput);
  const buttonRow = createActionButtons(
    () => {
      options.onApply(temporaryColor);
      overlay.remove();
    },
    () => overlay.remove(),
  );

  const modal = createColorModal(
    modalTitle,
    previewBox,
    paletteContainer,
    colorControlRow,
    buttonRow,
  );

  overlay.append(modal);
  document.body.append(overlay);
};
