const svgs = import.meta.glob('/src/assets/images/*.svg', { as: 'raw', eager: true });

const availableKeys = Object.keys(svgs);
const HASH_SHIFT = 5;

export interface BodyTypeOption {
  id: string;
  name: string;
}

export const BODY_TYPES: BodyTypeOption[] = [
  { id: 'auto', name: 'Auto (Detect by name)' },
  { id: 'porsche', name: 'Porsche (Fast Coupe)' },
  { id: 'corvette', name: 'Corvette (American Muscle)' },
  { id: 'sport', name: 'Sport (Roadster)' },
  { id: 'tesla', name: 'Supercar (Hypercar)' },
  { id: 'jeep', name: 'Off-Road SUV (Jeep/XC90)' },
  { id: 'bmw', name: 'Sedan Solid (BMW/X5)' },
  { id: 'mercedes', name: 'Classic Round (Mercedes/C-Class)' },
  { id: 'audi', name: 'Audi Style (A6)' },
  { id: 'toyota', name: 'Toyota Style (Camry)' },
  { id: 'honda', name: 'Compact (Honda/Civic)' },
  { id: 'nissan', name: 'City Car (Nissan/GT-R)' },
  { id: 'volvo', name: 'Minimalist (Volvo)' },
];

const CAR_MAP: Array<{ keywords: string[]; file: string }> = [
  { keywords: ['porsche', '911'], file: 'porsche-svgrepo-com.svg' },
  { keywords: ['corvette'], file: 'corvette-svgrepo-com.svg' },
  { keywords: ['mustang', 'sport'], file: 'sport-car-svgrepo-com.svg' },
  { keywords: ['tesla', 'supercar', 'model'], file: 'sports-car-svgrepo-com.svg' },
  { keywords: ['jeep', 'suv', 'xc90', 'off-road'], file: 'tabler--car-off-road.svg' },
  { keywords: ['bmw', 'x5', 'sedan'], file: 'car-side-solid-svgrepo-com.svg' },
  { keywords: ['mercedes', 'c-class', 'classic'], file: 'car-round-647-svgrepo-com.svg' },
  { keywords: ['audi', 'a6'], file: 'car-side-svgrepo-com (1).svg' },
  { keywords: ['toyota', 'camry'], file: 'car-side-svgrepo-com (2).svg' },
  { keywords: ['honda', 'civic', 'compact'], file: 'hugeicons--car-03.svg' },
  { keywords: ['nissan', 'gt-r', 'city'], file: 'hugeicons--car-04.svg' },
  { keywords: ['volvo', 'minimal'], file: 'humbleicons--car.svg' },
];

const getHash = (string_: string): number => {
  let hash = 0;
  for (let index = 0; index < string_.length; index += 1) {
    const code = string_.codePointAt(index) ?? 0;
    hash = (hash << HASH_SHIFT) - hash + code;
    hash = Math.trunc(hash);
  }
  return Math.abs(hash);
};

const resolveSvgKey = (name: string): string => {
  const lowerName = name.toLowerCase();
  for (const entry of CAR_MAP) {
    if (entry.keywords.some((kw) => lowerName.includes(kw))) {
      return `/src/assets/images/${entry.file}`;
    }
  }

  if (availableKeys.length > 0) {
    const index = getHash(name) % availableKeys.length;
    return availableKeys[index];
  }

  return '/src/assets/images/car-side-svgrepo-com.svg';
};

const replaceColorsInSvg = (svgRaw: string, color: string): string => {
  let result = svgRaw.replaceAll(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  result = result.replaceAll(/fill="(?!none)[^"]*"/gi, () => `fill="${color}"`);
  result = result.replaceAll(/fill='(?!none)[^']*'/gi, () => `fill='${color}'`);
  result = result.replaceAll(/stroke="(?!none)[^"]*"/gi, () => `stroke="${color}"`);
  result = result.replaceAll(/stroke='(?!none)[^']*'/gi, () => `stroke='${color}'`);
  
  result = result.replaceAll(/style="([^"]*)"/gi, (_, styleGroup: string) => {
    let newStyle = styleGroup;
    if (newStyle.includes('fill:')) {
      newStyle = newStyle.replaceAll(/fill:\s*[^;"]+/gi, () => `fill: ${color}`);
    }
    if (newStyle.includes('stroke:')) {
      newStyle = newStyle.replaceAll(/stroke:\s*[^;"]+/gi, () => `stroke: ${color}`);
    }
    return `style="${newStyle}"`;
  });

  result = result.replaceAll(/\sclass="[^"]*"/gi, '');
  return result.replace(
    /<svg([^>]*)>/i,
    () => `<svg fill="${color}" stroke="${color}" style="fill: ${color}; stroke: ${color}; color: ${color}; width: 50px; height: 25px;">`,
  );
};

export const getCarSvgContent = (name: string, color: string): string => {
  const svgKey = resolveSvgKey(name);
  let svgContent = svgs[svgKey];

  if (!svgContent) {
    svgContent = svgs['/src/assets/images/car-side-svgrepo-com.svg'] ||
      `<svg viewBox="0 0 512 512" width="50" height="25" fill="${color}"><path d="M499.99 176h-59.87l-16.64-41.6C416.38 116.17 398.73 104 378.78 104H133.22c-19.95 0-37.6 12.17-44.7 30.4L71.88 176H12.01C5.38 176 0 181.38 0 188.01v68c0 6.63 5.38 12.01 12.01 12.01h20.12c1.78 30.95 27.42 55.98 58.87 55.98 31.45 0 57.09-25.03 58.87-55.98h212.26c1.78 30.95 27.42 55.98 58.87 55.98 31.45 0 57.09-25.03 58.87-55.98h20.12c6.63 0 12.01-5.38 12.01-12.01v-68c0-6.63-5.38-12.01-12.01-12.01zM91 292c-15.46 0-28-12.54-28-28s12.54-28 28-28 28 12.54 28 28-12.54 28-28 28zm330 0c-15.46 0-28-12.54-28-28s12.54-28 28-28 28 12.54 28 28-12.54 28-28 28z"/></svg>`;
  }

  return replaceColorsInSvg(svgContent, color);
};