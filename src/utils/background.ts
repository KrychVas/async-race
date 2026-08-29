const backgrounds = import.meta.glob<{ default: string }>(
  '/src/assets/images/background*.{jpg,jpeg,png,webp}',
  { eager: true },
);

export interface BackgroundOption {
  id: string;
  name: string;
  image?: string;
}

const imagePath = (id: string): string =>
  backgrounds[`/src/assets/images/${id}`]?.default || '';

export const BACKGROUND_OPTIONS: BackgroundOption[] = [
  { id: 'none', name: 'None (Use Color Theme)' },
  {
    id: 'background 1.jpg',
    name: 'Background 1',
    image: imagePath('background 1.jpg'),
  },
  {
    id: 'background 2.png',
    name: 'Background 2',
    image: imagePath('background 2.png'),
  },
  {
    id: 'background 3.png',
    name: 'Background 3',
    image: imagePath('background 3.png'),
  },
  {
    id: 'background 4.png',
    name: 'Background 4',
    image: imagePath('background 4.png'),
  },
];

const SAVED_KEY = 'async_race_background';

const OVERLAY_GRADIENT =
  'linear-gradient(rgba(13, 18, 32, 0.72), rgba(13, 18, 32, 0.72))';

export const DEFAULT_BACKGROUND = 'background 1.jpg';

export const getSavedBackground = (): string => {
  return localStorage.getItem(SAVED_KEY) || DEFAULT_BACKGROUND;
};

export const applyBackground = (id: string): void => {
  const option = BACKGROUND_OPTIONS.find((o) => o.id === id);
  document.body.dataset.background = id;
  localStorage.setItem(SAVED_KEY, id);

  if (!option?.image) {
    document.body.style.backgroundImage = '';
    document.body.style.backgroundSize = '';
    document.body.style.backgroundPosition = '';
    document.body.style.backgroundAttachment = '';
    return;
  }

  document.body.style.backgroundImage = `${OVERLAY_GRADIENT}, url('${option.image}')`;
  document.body.style.backgroundSize = 'cover';
  document.body.style.backgroundPosition = 'center';
  document.body.style.backgroundAttachment = 'fixed';
};

export const initBackground = (): void => {
  applyBackground(getSavedBackground());
};
