import { createElement } from '../../ui/html-builder';
import { getWinners } from '../../api/winners';
import { getCarSvgContent } from '../../utils/car-mapping';

let winnersPage = 1;
let sortField: 'wins' | 'time' | undefined;
let sortOrder: 'ASC' | 'DESC' = 'ASC';

export const renderWinnersView = async (): Promise<HTMLElement> => {
  const { items: winners, totalCount } = await getWinners(winnersPage, 10, sortField, sortOrder);
  const totalPages = Math.ceil(totalCount / 10) || 1;

  // Header row with sorting toggles
  const winsHeader = createElement({
    tag: 'th',
    classNames: ['sortable-header'],
    textContent: `Wins ${sortField === 'wins' ? (sortOrder === 'ASC' ? '▲' : '▼') : '↕'}`,
  });

  const timeHeader = createElement({
    tag: 'th',
    classNames: ['sortable-header'],
    textContent: `Best time (s) ${sortField === 'time' ? (sortOrder === 'ASC' ? '▲' : '▼') : '↕'}`,
  });

  winsHeader.addEventListener('click', async () => {
    if (sortField === 'wins') {
      sortOrder = sortOrder === 'ASC' ? 'DESC' : 'ASC';
    } else {
      sortField = 'wins';
      sortOrder = 'ASC';
    }
    await refreshWinners();
  });

  timeHeader.addEventListener('click', async () => {
    if (sortField === 'time') {
      sortOrder = sortOrder === 'ASC' ? 'DESC' : 'ASC';
    } else {
      sortField = 'time';
      sortOrder = 'ASC';
    }
    await refreshWinners();
  });

  const tableHeader = createElement({
    tag: 'tr',
    children: [
      createElement({ tag: 'th', textContent: 'Number' }),
      createElement({ tag: 'th', textContent: 'Car' }),
      createElement({ tag: 'th', textContent: 'Name' }),
      winsHeader,
      timeHeader,
    ],
  });

  // Table rows
  const rows = winners.map((winner, index) => {
    const globalIndex = (winnersPage - 1) * 10 + index + 1;
    const svgWrapper = createElement({ tag: 'div' });
    svgWrapper.innerHTML = getCarSvgContent(winner.car?.name || 'Unknown', winner.car?.color || '#ffffff');

    return createElement({
      tag: 'tr',
      children: [
        createElement({ tag: 'td', textContent: `${globalIndex}` }),
        createElement({ tag: 'td', children: [svgWrapper] }),
        createElement({ tag: 'td', textContent: winner.car?.name || 'Unknown' }),
        createElement({ tag: 'td', textContent: `${winner.wins}` }),
        createElement({ tag: 'td', textContent: `${winner.time}` }),
      ],
    });
  });

  const table = createElement({
    tag: 'table',
    classNames: ['winners-table'],
    children: [tableHeader, ...rows],
  });

  // Navigation
  const previousButton = createElement({
    tag: 'button',
    classNames: ['btn', 'btn-primary'],
    textContent: 'PREV',
    attributes: winnersPage <= 1 ? { disabled: 'true' } : {},
  });

  const nextButton = createElement({
    tag: 'button',
    classNames: ['btn', 'btn-primary'],
    textContent: 'NEXT',
    attributes: winnersPage >= totalPages ? { disabled: 'true' } : {},
  });

  previousButton.addEventListener('click', async () => {
    if (!(winnersPage > 1)) {
    	return;
    }

    winnersPage -= 1;
    await refreshWinners();
  });

  nextButton.addEventListener('click', async () => {
    if (!(winnersPage < totalPages)) {
    	return;
    }

    winnersPage += 1;
    await refreshWinners();
  });

  const pagination = createElement({
    tag: 'div',
    classNames: ['pagination-controls'],
    children: [previousButton, nextButton],
  });

  return createElement({
    tag: 'div',
    classNames: ['winners-view'],
    children: [
      createElement({ tag: 'h2', textContent: `Winners (${totalCount})` }),
      createElement({ tag: 'h3', textContent: `Page #${winnersPage}` }),
      table,
      pagination,
    ],
  });
};

const refreshWinners = async (): Promise<void> => {
  const container = document.querySelector('.winners-view');
  if (container && container.parentElement) {
    const parent = container.parentElement;
    container.remove();
    parent.append(await renderWinnersView());
  }
};