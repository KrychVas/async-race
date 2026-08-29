export interface Car {
  name: string;
  color: string;
  id: number;
}

export interface EngineStatus {
  velocity: number;
  distance: number;
}

export interface Winner {
  id: number;
  wins: number;
  time: number;
}

export type SortBy = 'id' | 'wins' | 'time';
export type SortOrder = 'ASC' | 'DESC';

export interface AppState {
  view: 'garage' | 'winners';
  garagePage: number;
  winnersPage: number;
  carsCount: number;
  winnersCount: number;
  sortBy: SortBy;
  sortOrder: SortOrder;
}