const WINNERS_URL = 'http://127.0.0.1:3000/winners';

export interface WinnerData {
  id: number;
  wins: number;
  time: number;
}

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