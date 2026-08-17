export interface ThemeOption {
  id: string;
  name: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  { id: 'dark', name: 'Midnight Neon (Default)' },
  { id: 'cyberpunk', name: 'Cyberpunk City' },
  { id: 'sunset', name: 'Retro Sunset Drive' },
  { id: 'matrix', name: 'Matrix Digital' },
];

export const setTheme = (themeId: string): void => {
  document.body.setAttribute('data-theme', themeId);
  localStorage.setItem('async_race_theme', themeId);
};

export const getSavedTheme = (): string => {
  return localStorage.getItem('async_race_theme') || 'dark';
};

export const initTheme = (): void => {
  setTheme(getSavedTheme());
};
