const svgs = import.meta.glob('/src/assets/images/*.svg', { as: 'raw', eager: true });

const availableKeys = Object.keys(svgs);

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

const getHash = (string_: string): number => {
  let hash = 0;
  for (let index = 0; index < string_.length; index += 1) {
    hash = (hash << 5) - hash + string_.charCodeAt(index);
    hash = Math.trunc(hash);
  }
  return Math.abs(hash);
};

export const getCarSvgContent = (name: string, color: string): string => {
  const lowerName = name.toLowerCase();
  let svgKey = '';

  if (lowerName.includes('porsche') || lowerName.includes('911')) {
    svgKey = '/src/assets/images/porsche-svgrepo-com.svg';
  } else if (lowerName.includes('corvette')) {
    svgKey = '/src/assets/images/corvette-svgrepo-com.svg';
  } else if (lowerName.includes('mustang') || lowerName.includes('sport')) {
    svgKey = '/src/assets/images/sport-car-svgrepo-com.svg';
  } else if (lowerName.includes('tesla') || lowerName.includes('supercar') || lowerName.includes('model')) {
    svgKey = '/src/assets/images/sports-car-svgrepo-com.svg';
  } else if (lowerName.includes('jeep') || lowerName.includes('suv') || lowerName.includes('xc90') || lowerName.includes('off-road')) {
    svgKey = '/src/assets/images/tabler--car-off-road.svg';
  } else if (lowerName.includes('bmw') || lowerName.includes('x5') || lowerName.includes('sedan')) {
    svgKey = '/src/assets/images/car-side-solid-svgrepo-com.svg';
  } else if (lowerName.includes('mercedes') || lowerName.includes('c-class') || lowerName.includes('classic')) {
    svgKey = '/src/assets/images/car-round-647-svgrepo-com.svg';
  } else if (lowerName.includes('audi') || lowerName.includes('a6')) {
    svgKey = '/src/assets/images/car-side-svgrepo-com (1).svg';
  } else if (lowerName.includes('toyota') || lowerName.includes('camry')) {
    svgKey = '/src/assets/images/car-side-svgrepo-com (2).svg';
  } else if (lowerName.includes('honda') || lowerName.includes('civic') || lowerName.includes('compact')) {
    svgKey = '/src/assets/images/hugeicons--car-03.svg';
  } else if (lowerName.includes('nissan') || lowerName.includes('gt-r') || lowerName.includes('city')) {
    svgKey = '/src/assets/images/hugeicons--car-04.svg';
  } else if (lowerName.includes('volvo') || lowerName.includes('minimal')) {
    svgKey = '/src/assets/images/humbleicons--car.svg';
  } else if (availableKeys.length > 0) {
    const index = getHash(name) % availableKeys.length;
    svgKey = availableKeys[index];
  } else {
    svgKey = '/src/assets/images/car-side-svgrepo-com.svg';
  }

  let svgContent = svgs[svgKey];
  if (!svgContent) {
    svgContent = svgs['/src/assets/images/car-side-svgrepo-com.svg'] ||
      `<svg viewBox="0 0 512 512" width="50" height="25" fill="${color}"><path d="M499.99 176h-59.87l-16.64-41.6C416.38 116.17 398.73 104 378.78 104H133.22c-19.95 0-37.6 12.17-44.7 30.4L71.88 176H12.01C5.38 176 0 181.38 0 188.01v68c0 6.63 5.38 12.01 12.01 12.01h20.12c1.78 30.95 27.42 55.98 58.87 55.98 31.45 0 57.09-25.03 58.87-55.98h212.26c1.78 30.95 27.42 55.98 58.87 55.98 31.45 0 57.09-25.03 58.87-55.98h20.12c6.63 0 12.01-5.38 12.01-12.01v-68c0-6.63-5.38-12.01-12.01-12.01zM91 292c-15.46 0-28-12.54-28-28s12.54-28 28-28 28 12.54 28 28-12.54 28-28 28zm330 0c-15.46 0-28-12.54-28-28s12.54-28 28-28 28 12.54 28 28-12.54 28-28 28z"/></svg>`;
  }

  // 1. Remove all internal <style> tags (to avoid global CSS leaking across SVGs)
  svgContent = svgContent.replaceAll(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

  // 2. Replace internal non-none fill attributes with the car's color
  svgContent = svgContent.replaceAll(/fill="(?!none)[^"]*"/gi, `fill="${color}"`);
  svgContent = svgContent.replaceAll(/fill='(?!none)[^']*'/gi, `fill='${color}'`);

  // 3. Replace internal non-none stroke attributes with the car's color
  svgContent = svgContent.replaceAll(/stroke="(?!none)[^"]*"/gi, `stroke="${color}"`);
  svgContent = svgContent.replaceAll(/stroke='(?!none)[^']*'/gi, `stroke='${color}'`);

  // 4. Clean style attributes so they don't lock hardcoded colors
  svgContent = svgContent.replaceAll(/style="([^"]*)"/gi, (_match, styleGroup) => {
    let newStyle = styleGroup;
    if (newStyle.includes('fill:')) {
      newStyle = newStyle.replaceAll(/fill:\s*[^;"]+/gi, `fill: ${color}`);
    }
    if (newStyle.includes('stroke:')) {
      newStyle = newStyle.replaceAll(/stroke:\s*[^;"]+/gi, `stroke: ${color}`);
    }
    return `style="${newStyle}"`;
  });

  // 5. Clean class attributes that may reference stripped styles
  svgContent = svgContent.replaceAll(/\sclass="[^"]*"/gi, '');

  // 6. Set root <svg> fill, stroke, and dimensions
  svgContent = svgContent.replace(
    /<svg([^>]*)>/i,
    `<svg$1 fill="${color}" stroke="${color}" style="fill: ${color}; stroke: ${color}; color: ${color}; width: 50px; height: 25px;">`,
  );

  return svgContent;
};
