import { createElement } from './html-builder';
import { audioManager, TRACK_OPTIONS } from '../utils/audio';
import { THEME_OPTIONS, getSavedTheme, setTheme } from '../utils/theme';

const createMusicGroup = (): HTMLElement => {
  const musicSelect = createElement({
    tag: 'select',
    children: TRACK_OPTIONS.map((track) => {
      const option = createElement({
        tag: 'option',
        textContent: track.name,
        attributes: { value: track.id },
      }) as HTMLOptionElement;
      if (track.id === audioManager.currentTrack) {
        option.selected = true;
      }
      return option;
    }),
  }) as HTMLSelectElement;

  musicSelect.addEventListener('change', () => {
    audioManager.setTrack(musicSelect.value);
  });

  return createElement({
    tag: 'div',
    classNames: ['settings-group'],
    children: [
      createElement({ tag: 'label', textContent: '🎵 Background Music Track:' }),
      musicSelect,
    ],
  });
};

const createThemeGroup = (): HTMLElement => {
  const themeSelect = createElement({
    tag: 'select',
    children: THEME_OPTIONS.map((theme) => {
      const option = createElement({
        tag: 'option',
        textContent: theme.name,
        attributes: { value: theme.id },
      }) as HTMLOptionElement;
      if (theme.id === getSavedTheme()) {
        option.selected = true;
      }
      return option;
    }),
  }) as HTMLSelectElement;

  themeSelect.addEventListener('change', () => {
    setTheme(themeSelect.value);
  });

  return createElement({
    tag: 'div',
    classNames: ['settings-group'],
    children: [
      createElement({ tag: 'label', textContent: '🎨 Visual Theme / Background:' }),
      themeSelect,
    ],
  });
};

export const showSettingsModal = (): void => {
  const existing = document.querySelector('.settings-overlay');
  if (existing) existing.remove();

  const overlay = createElement({ tag: 'div', classNames: ['settings-overlay'] });

  const closeButton = createElement({
    tag: 'button',
    classNames: ['btn', 'btn-primary'],
    textContent: 'Close & Save',
  });

  closeButton.addEventListener('click', () => {
    overlay.remove();
  });

  const modal = createElement({
    tag: 'div',
    classNames: ['settings-modal'],
    children: [
      createElement({ tag: 'h2', textContent: '⚙️ Settings' }),
      createMusicGroup(),
      createThemeGroup(),
      closeButton,
    ],
  });

  overlay.append(modal);
  document.body.append(overlay);
};