import { getCar } from './garage';
import type { Car } from '../state/types';

const WINNERS_URL = 'http://127.0.0.1:3000/winners';

export interface WinnerData {
  id: number;
  wins: number;
  time: number;
}

export interface Winner extends WinnerData {
  car?: Car;
}

export interface GetWinnersResponse {
  items: Winner[];
  totalCount: number;
}

export const deleteWinner = async (id: number): Promise<void> => {
  await fetch(`${WINNERS_URL}/${id}`, { method: 'DELETE' });
};

export const getWinners = async (
  page = 1,
  limit = 10,
  sort?: 'wins' | 'time',
  order?: 'ASC' | 'DESC'
): Promise<GetWinnersResponse> => {
  let url = `${WINNERS_URL}?_page=${page}&_limit=${limit}`;
  if (sort && order) {
    url += `&_sort=${sort}&_order=${order}`;
  }

  const res = await fetch(url);
  const totalCount = Number(res.headers.get('X-Total-Count') || 0);
  const winnersData: WinnerData[] = await res.json();

  const winnersWithCars = await Promise.all(
    winnersData.map(async (winner) => {
      try {
        const car = await getCar(winner.id);
        return { ...winner, car };
      } catch {
        // Автоматично видаляємо застарілий запис з сервера, якщо машина не існує
        await deleteWinner(winner.id).catch(() => {});
        return null;
      }
    })
  );

  // Відфільтровуємо видалені машини
  const validWinners = winnersWithCars.filter((item): item is Winner => item !== null);

  return { items: validWinners, totalCount };
};

export const getWinner = async (id: number): Promise<WinnerData | null> => {
  const res = await fetch(`${WINNERS_URL}/${id}`);
  if (res.status === 404) return null;
  return res.json();
};

export const createWinner = async (winner: WinnerData): Promise<WinnerData> => {
  const res = await fetch(WINNERS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(winner),
  });
  return res.json();
};

export const updateWinner = async (id: number, winner: { wins: number; time: number }): Promise<WinnerData> => {
  const res = await fetch(`${WINNERS_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(winner),
  });
  return res.json();
};

export const saveWinnerResult = async (id: number, time: number): Promise<void> => {
  const existingWinner = await getWinner(id);

  if (existingWinner) {
    await updateWinner(id, {
      wins: existingWinner.wins + 1,
      time: Math.min(existingWinner.time, time),
    });
  } else {
    await createWinner({ id, wins: 1, time });
  }
};