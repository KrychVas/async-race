import { API_URL } from '../constants';

export interface EngineResponse {
  velocity: number;
  distance: number;
}

export interface DriveResponse {
  success: boolean;
}

export const startEngine = async (id: number): Promise<EngineResponse> => {
  const response = await fetch(`${API_URL}/engine?id=${id}&status=started`, {
    method: 'PATCH',
  });
  return response.json();
};

export const stopEngine = async (id: number): Promise<EngineResponse> => {
  const response = await fetch(`${API_URL}/engine?id=${id}&status=stopped`, {
    method: 'PATCH',
  });
  return response.json();
};

export const driveEngine = async (id: number): Promise<DriveResponse> => {
  const response = await fetch(`${API_URL}/engine?id=${id}&status=drive`, {
    method: 'PATCH',
  }).catch(() => null);

  if (response && response.ok) {
    return response.json();
  }

  return { success: false };
};