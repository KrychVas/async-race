const svgs: Record<string, string> = import.meta.glob(
  '/src/assets/images/*.svg',
  {
    as: 'raw',
    eager: true,
  },
);

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
  {
    keywords: ['tesla', 'supercar', 'model'],
    file: 'sports-car-svgrepo-com.svg',
  },
  {
    keywords: ['jeep', 'suv', 'xc90', 'off-road'],
    file: 'tabler--car-off-road.svg',
  },
  { keywords: ['bmw', 'x5', 'sedan'], file: 'car-side-solid-svgrepo-com.svg' },
  {
    keywords: ['mercedes', 'c-class', 'classic'],
    file: 'car-round-647-svgrepo-com.svg',
  },
  { keywords: ['audi', 'a6'], file: 'car-side-svgrepo-com (1).svg' },
  { keywords: ['toyota', 'camry'], file: 'car-side-svgrepo-com (2).svg' },
  { keywords: ['honda', 'civic', 'compact'], file: 'hugeicons--car-03.svg' },
  { keywords: ['nissan', 'gt-r', 'city'], file: 'hugeicons--car-04.svg' },
  { keywords: ['volvo', 'minimal'], file: 'humbleicons--car.svg' },
];

const DEFAULT_SVG_STRING = `<svg viewBox="0 0 512 512" width="50" height="25"><path d="M499.99 176h-59.87l-16.64-41.6C416.38 116.17 398.73 104 378.78 104H133.22c-19.95 0-37.6 12.17-44.7 30.4L71.88 176H12.01C5.38 176 0 181.38 0 188.01v68c0 6.63 5.38 12.01 12.01 12.01h20.12c1.78 30.95 27.42 55.98 58.87 55.98 31.45 0 57.09-25.03 58.87-55.98h212.26c1.78 30.95 27.42 55.98 58.87 55.98 31.45 0 57.09-25.03 58.87-55.98h20.12c6.63 0 12.01-5.38 12.01-12.01v-68c0-6.63-5.38-12.01-12.01-12.01zM91 292c-15.46 0-28-12.54-28-28s12.54-28 28-28 28 12.54 28 28-12.54 28-28 28zm330 0c-15.46 0-28-12.54-28-28s12.54-28 28-28 28 12.54 28 28-12.54 28-28 28z"/></svg>`;

const getHash = (inputString: string): number => {
  let calculatedHash = 0;
  for (let index = 0; index < inputString.length; index += 1) {
    const codePoint = inputString.codePointAt(index) ?? 0;
    calculatedHash =
      (calculatedHash << HASH_SHIFT) - calculatedHash + codePoint;
    calculatedHash = Math.trunc(calculatedHash);
  }
  return Math.abs(calculatedHash);
};

const resolveSvgKey = (carIdentifier: string): string => {
  const trimmedName = carIdentifier.trim();

  if (!trimmedName) {
    return availableKeys[0] ?? '/src/assets/images/car-side-svgrepo-com.svg';
  }

  const lowerName = trimmedName.toLowerCase();

  // 1. Пошук за ключовими словами
  for (const entry of CAR_MAP) {
    const isMatched = entry.keywords.some((keyword: string) =>
      lowerName.includes(keyword),
    );
    if (!isMatched) {
      continue;
    }

    const matchedKey = `/src/assets/images/${entry.file}`;
    if (svgs[matchedKey] !== undefined) {
      return matchedKey;
    }
  }

  // 2. Фолбек за хешем (для невідомих назв)
  if (availableKeys.length > 0) {
    const hashIndex = getHash(trimmedName) % availableKeys.length;
    const candidateKey = availableKeys[hashIndex];

    if (candidateKey !== undefined && svgs[candidateKey] !== undefined) {
      return candidateKey;
    }

    return availableKeys[0] ?? '/src/assets/images/car-side-svgrepo-com.svg';
  }

  return '/src/assets/images/car-side-svgrepo-com.svg';
};

const replaceFillAndStroke = (svgRaw: string, targetColor: string): string => {
  let result = svgRaw.replaceAll(
    /fill="(?!none)[^"]*"/gi,
    () => `fill="${targetColor}"`,
  );
  result = result.replaceAll(
    /fill='(?!none)[^']*'/gi,
    () => `fill='${targetColor}'`,
  );
  result = result.replaceAll(
    /stroke="(?!none)[^"]*"/gi,
    () => `stroke="${targetColor}"`,
  );
  return result.replaceAll(
    /stroke='(?!none)[^']*'/gi,
    () => `stroke='${targetColor}'`,
  );
};

const replaceInlineStyles = (svgRaw: string, targetColor: string): string =>
  svgRaw.replaceAll(/style="([^"]*)"/gi, (_, styleGroup: string) => {
    let newStyle = styleGroup;
    if (newStyle.includes('fill:')) {
      newStyle = newStyle.replaceAll(
        /fill:\s*[^;"]+/gi,
        () => `fill: ${targetColor}`,
      );
    }
    if (newStyle.includes('stroke:')) {
      newStyle = newStyle.replaceAll(
        /stroke:\s*[^;"]+/gi,
        () => `stroke: ${targetColor}`,
      );
    }
    return `style="${newStyle}"`;
  });

const replaceColorsInSvg = (svgRaw: string, targetColor: string): string => {
  let cleanedSvg = svgRaw.replaceAll(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  cleanedSvg = replaceFillAndStroke(cleanedSvg, targetColor);
  cleanedSvg = replaceInlineStyles(cleanedSvg, targetColor);
  cleanedSvg = cleanedSvg.replaceAll(/\sclass="[^"]*"/gi, '');
  return cleanedSvg.replace(
    /<svg([^>]*)>/i,
    (_, originalAttributes: string) => {
      const viewBoxMatch = originalAttributes.match(/viewBox\s*=\s*"[^"]*"/i);
      const xmlnsMatch = originalAttributes.match(/xmlns\s*=\s*"[^"]*"/i);
      const preservedAttributes = [viewBoxMatch?.[0], xmlnsMatch?.[0]]
        .filter(Boolean)
        .join(' ');
      return `<svg ${preservedAttributes} fill="${targetColor}" stroke="${targetColor}" style="fill: ${targetColor}; stroke: ${targetColor}; color: ${targetColor};">`;
    },
  );
};

export const getCarSvgContent = (
  carIdentifier: string,
  targetColor: string,
): string => {
  const svgKey = resolveSvgKey(carIdentifier);
  let svgContent = svgs[svgKey];

  if (!svgContent) {
    const defaultKey = availableKeys[0];
    svgContent =
      defaultKey === undefined
        ? DEFAULT_SVG_STRING
        : svgs[defaultKey] || DEFAULT_SVG_STRING;
  }

  return replaceColorsInSvg(svgContent, targetColor);
};
