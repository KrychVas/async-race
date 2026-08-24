import { createElement } from '../../ui/html-builder';
import { getWinners, type Winner } from '../../api/winners';
import { getCarSvgContent } from '../../utils/car-mapping';
import { appState } from '../../state/app-state';
import { WINNERS_PER_PAGE } from '../../constants';

const UNKNOWN_NAME = 'Unknown';
const UNKNOWN_COLOR = '#ffffff';

const sortIndicator = (field: 'wins' | 'time' | undefined): string => {
  if (appState.winnersSortBy !== field) return '↕';
  return appState.winnersSortOrder === 'ASC' ? '▲' : '▼';
};

const toggleSort = (field: 'wins' | 'time'): void => {
  if (appState.winnersSortBy === field) {
    appState.winnersSortOrder =
      appState.winnersSortOrder === 'ASC' ? 'DESC' : 'ASC';
  } else {
    appState.winnersSortBy = field;
    appState.winnersSortOrder = 'ASC';
  }
};

const buildSortableHeader = (
  text: string,
  field: 'wins' | 'time',
): HTMLElement => {
  const header = createElement({
    tag: 'th',
    classNames: ['sortable-header'],
    textContent: `${text} ${sortIndicator(field)}`,
  });

  header.addEventListener('click', async () => {
    toggleSort(field);
    await refreshWinners();
  });

  return header;
};

const buildHeaderRow = (): HTMLElement =>
  createElement({
    tag: 'tr',
    children: [
      createElement({ tag: 'th', textContent: 'Number' }),
      createElement({ tag: 'th', textContent: 'Car' }),
      createElement({ tag: 'th', textContent: 'Name' }),
      buildSortableHeader('Wins', 'wins'),
      buildSortableHeader('Best time (s)', 'time'),
    ],
  });

const buildWinnerRow = (winner: Winner, index: number): HTMLElement => {
  const globalIndex = (appState.winnersPage - 1) * WINNERS_PER_PAGE + index + 1;
  const svgWrapper = createElement({ tag: 'div' });
  svgWrapper.innerHTML = getCarSvgContent(
    winner.car?.name || UNKNOWN_NAME,
    winner.car?.color || UNKNOWN_COLOR,
  );

  return createElement({
    tag: 'tr',
    children: [
      createElement({ tag: 'td', textContent: `${globalIndex}` }),
      createElement({ tag: 'td', children: [svgWrapper] }),
      createElement({
        tag: 'td',
        textContent: winner.car?.name || UNKNOWN_NAME,
      }),
      createElement({ tag: 'td', textContent: `${winner.wins}` }),
      createElement({ tag: 'td', textContent: `${winner.time}` }),
    ],
  });
};

const buildRows = (winners: Winner[]): HTMLElement[] =>
  winners.map((winner, index) => buildWinnerRow(winner, index));

const buildTable = (winners: Winner[]): HTMLElement =>
  createElement({
    tag: 'table',
    classNames: ['winners-table'],
    children: [buildHeaderRow(), ...buildRows(winners)],
  });

const buildPagination = (totalPages: number): HTMLElement => {
  const previousButton = createElement({
    tag: 'button',
    classNames: ['btn', 'btn-primary'],
    textContent: 'PREV',
    attributes: appState.winnersPage <= 1 ? { disabled: 'true' } : {},
  });

  const nextButton = createElement({
    tag: 'button',
    classNames: ['btn', 'btn-primary'],
    textContent: 'NEXT',
    attributes: appState.winnersPage >= totalPages ? { disabled: 'true' } : {},
  });

  previousButton.addEventListener('click', async () => {
    if (appState.winnersPage <= 1) return;

    appState.winnersPage -= 1;
    await refreshWinners();
  });

  nextButton.addEventListener('click', async () => {
    if (appState.winnersPage >= totalPages) return;

    appState.winnersPage += 1;
    await refreshWinners();
  });

  return createElement({
    tag: 'div',
    classNames: ['pagination-controls'],
    children: [previousButton, nextButton],
  });
};

export const renderWinnersView = async (): Promise<HTMLElement> => {
  const { items: winners, totalCount } = await getWinners(
    appState.winnersPage,
    WINNERS_PER_PAGE,
    appState.winnersSortBy,
    appState.winnersSortOrder,
  );
  const totalPages = Math.ceil(totalCount / WINNERS_PER_PAGE) || 1;

  return createElement({
    tag: 'div',
    classNames: ['winners-view'],
    children: [
      createElement({ tag: 'h2', textContent: `Winners (${totalCount})` }),
      createElement({
        tag: 'h3',
        textContent: `Page #${appState.winnersPage}`,
      }),
      buildTable(winners),
      buildPagination(totalPages),
    ],
  });
};

const refreshWinners = async (): Promise<void> => {
  const container = document.querySelector<HTMLElement>('.winners-view');
  if (!container?.parentElement) return;

  container.remove();
  container.parentElement.append(await renderWinnersView());
};
