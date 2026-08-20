import { createElement } from './html-builder';
import { getCarSvgContent } from '../utils/car-mapping';

const PRESET_COLORS = [
  '#e66465', '#3b82f6', '#22c55e', '#f59e0b', '#ef4444',
  '#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f97316',
  '#eab308', '#64748b', '#ffffff', '#000000', '#00ffcc',
];

export interface OpenColorPickerOptions {
  currentColor: string;
  carName: string;
  onApply: (selectedColor: string) => void;
}

export const openColorPickerModal = (options: OpenColorPickerOptions): void => {
  const existing = document.querySelector('.color-picker-overlay');
  if (existing) existing.remove();

  let temporaryColor = options.currentColor;

  const overlay = createElement({ tag: 'div', classNames: ['settings-overlay', 'color-picker-overlay'] });

  const modalTitle = createElement({ tag: 'h2', textContent: '🎨 Select Car Color' });

  // Preview Box inside modal
  const previewBox = createElement({ tag: 'div', classNames: ['car-preview-box', 'modal-car-preview'] });
  const updateModalPreview = (): void => {
    previewBox.innerHTML = getCarSvgContent(options.carName, temporaryColor);
  };
  updateModalPreview();

  // Native input for fine-tuning
  const nativeColorInput = createElement({
    tag: 'input',
    attributes: { type: 'color', value: temporaryColor },
  }) as HTMLInputElement;

  nativeColorInput.addEventListener('input', () => {
    temporaryColor = nativeColorInput.value;
    updateModalPreview();
  });
  nativeColorInput.addEventListener('change', () => {
    temporaryColor = nativeColorInput.value;
    updateModalPreview();
  });

  // Preset Palette
  const paletteContainer = createElement({ tag: 'div', classNames: ['color-palette-grid'] });

  for (const colorHex of PRESET_COLORS) {
    const swatch = createElement({
      tag: 'button',
      classNames: ['color-swatch'],
      attributes: { style: `background-color: ${colorHex};` },
    });

    swatch.addEventListener('click', () => {
      temporaryColor = colorHex;
      nativeColorInput.value = colorHex;
      updateModalPreview();
    });

    paletteContainer.append(swatch);
  }

  // Controls group
  const colorControlRow = createElement({
    tag: 'div',
    classNames: ['control-row', 'color-modal-row'],
    children: [
      createElement({ tag: 'label', textContent: 'Custom Color:' }),
      nativeColorInput,
    ],
  });

  // OK / Cancel Buttons
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

  okButton.addEventListener('click', () => {
    options.onApply(temporaryColor);
    overlay.remove();
  });

  cancelButton.addEventListener('click', () => {
    overlay.remove();
  });

  const buttonRow = createElement({
    tag: 'div',
    classNames: ['control-row'],
    children: [okButton, cancelButton],
  });

  const modal = createElement({
    tag: 'div',
    classNames: ['settings-modal', 'color-picker-modal'],
    children: [
      modalTitle,
      previewBox,
      paletteContainer,
      colorControlRow,
      buttonRow,
    ],
  });

  overlay.append(modal);
  document.body.append(overlay);
};
