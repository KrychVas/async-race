const BRANDS = [
  'Tesla',
  'BMW',
  'Mercedes',
  'Audi',
  'Ford',
  'Toyota',
  'Porsche',
  'Honda',
  'Nissan',
  'Volvo',
];
const MODELS = [
  'Model S',
  'X5',
  'C-Class',
  'A6',
  'Mustang',
  'Camry',
  '911',
  'Civic',
  'GT-R',
  'XC90',
];

export const getRandomColor = (): string => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let index = 0; index < 6; index += 1) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

export const getRandomName = (): string => {
  const brand = BRANDS[Math.floor(Math.random() * BRANDS.length)];
  const model = MODELS[Math.floor(Math.random() * MODELS.length)];
  return `${brand} ${model}`;
};

export const generate100Cars = (): { name: string; color: string }[] => {
  return Array.from({ length: 100 }, () => ({
    name: getRandomName(),
    color: getRandomColor(),
  }));
};
