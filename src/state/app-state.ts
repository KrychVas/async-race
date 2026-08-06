export interface Car {
  name: string;
  color: string;
  id: number;
}

export interface AppState {
  currentPage: number;
  cars: Car[];
  totalCars: number;
  view: 'garage' | 'winners';
}

export const appState: AppState = {
  currentPage: 1,
  cars: [],
  totalCars: 0,
  view: 'garage',
};