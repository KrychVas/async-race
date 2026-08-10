export const renderCarSvg = (color: string, _carId: number = 0): string => {
  return `
    <svg width="80" height="35" viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg">
      <g fill="${color}">
        <path d="M10 24 Q18 12 35 10 L65 10 Q85 14 94 22 L96 28 C96 31 93 32 88 32 L12 32 C7 32 4 31 4 28 Z" />
        <circle cx="24" cy="31" r="6" fill="#1e293b" stroke="#94a3b8" stroke-width="2" />
        <circle cx="76" cy="31" r="6" fill="#1e293b" stroke="#94a3b8" stroke-width="2" />
      </g>
    </svg>
  `;
};