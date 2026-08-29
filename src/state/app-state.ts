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
  selectedCarId?: number;
  winnersPage: number;
  winnersSortBy?: 'wins' | 'time';
  winnersSortOrder: 'ASC' | 'DESC';
}

export const appState: AppState = {
  currentPage: 1,
  cars: [],
  totalCars: 0,
  view: 'garage',
  selectedCarId: undefined,
  winnersPage: 1,
  winnersSortBy: undefined,
  winnersSortOrder: 'ASC',
};
