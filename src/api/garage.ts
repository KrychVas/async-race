import { API_URL, CARS_PER_PAGE } from '../constants';
import type { Car } from '../state/types';
import { deleteWinner } from './winners';

export interface GetCarsResponse {
  items: Car[];
  totalCount: number;
}

export const getCars = async (page = 1, limit = CARS_PER_PAGE): Promise<GetCarsResponse> => {
  const response = await fetch(`${API_URL}/garage?_page=${page}&_limit=${limit}`);
  const totalCount = Number(response.headers.get('X-Total-Count')) || 0;
  const items: Car[] = await response.json();

  return { items, totalCount };
};

export const getAllCars = async (): Promise<Car[]> => {
  const response = await fetch(`${API_URL}/garage`);
  return response.json();
};

export const getCar = async (id: number): Promise<Car> => {
  const response = await fetch(`${API_URL}/garage/${id}`);
  return response.json();
};

export const createCar = async (car: Omit<Car, 'id'>): Promise<Car> => {
  const response = await fetch(`${API_URL}/garage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(car),
  });
  return response.json();
};

export const deleteCar = async (id: number): Promise<void> => {
  await fetch(`${API_URL}/garage/${id}`, { method: 'DELETE' });
};

export const clearAllCars = async (): Promise<void> => {
  const allCars = await getAllCars();
  await Promise.all(
    allCars.map(async (car) => {
      await deleteCar(car.id);
      await deleteWinner(car.id).catch(() => {});
    }),
  );
};

export const updateCar = async (id: number, car: Omit<Car, 'id'>): Promise<Car> => {
  const response = await fetch(`${API_URL}/garage/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(car),
  });
  return response.json();
};