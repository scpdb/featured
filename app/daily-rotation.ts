import log from 'scpdb-logger';
import {
  getListCards,
  updateCardList,
  DAILY_BACKLOG_LIST_ID,
  DAILY_PREVIOUS_LIST_ID,
} from './trello';
import wk from './wikidot-kit';

const PAGE_NAME_REG = /^[a-zA-Z0-9_:-]+$/;
const FEATURED_BLOCK_REGEXP = /\[!--\sFEATURED_DAILY_START\s--][\s\S]*\[!--\sFEATURED_DAILY_END\s--]/;
const WIKI_NAME = 'scp-ru';
const PAGE_NAME = '_default:main';

export default async function rotateDaily(): Promise<any> {
  const previousCards = (await getListCards(DAILY_PREVIOUS_LIST_ID)).slice(0, 3);
  const backlogCards = await getListCards(DAILY_BACKLOG_LIST_ID);
  const current = backlogCards[0];

  if (!current) {
    throw new Error('Featured Daily Queue is empty');
  }

  const { name } = current;
  if (!PAGE_NAME_REG.test(name)) {
    throw new Error(`Featured Daily page name is not valid ("${name}")`);
  }

  log(`Rotating featured daily page to ${name}`);

  const currentPage = await wk.fetchPage({ wiki: WIKI_NAME, name });
  const previousPages = await Promise.all(previousCards.map(async ({ name: cardName }) => wk.fetchPage({
    wiki: WIKI_NAME,
    name: cardName,
  })));

  const previousPagesLinks = previousPages.map(page => `- [/${page.fullname} ${page.title}]`).join('\n');

  const updatedBlock = `
[!-- FEATURED_DAILY_START --]
[[div class="scp-featured__block scp-featured__block_type_daily"]]
  [[div class="scp-featured__title"]]
    Объект дня
  [[/div]]
  [[div class="scp-featured__page-title"]]
    [/${currentPage.fullname} ${currentPage.title}]
  [[/div]]
  [[div class="scp-featured__content"]]
  [[/div]]

  [[div class="scp-featured__previous"]]
    [[span class="scp-featured__previous-title"]]Предыдущие дни:[[/span]]
      ${previousPagesLinks}
  [[/div]]
[[/div]]
[!-- FEATURED_DAILY_END --]
    `.trim();

  const { content } = await wk.fetchPage({ wiki: WIKI_NAME, name: PAGE_NAME });
  const updatedContent = content.replace(FEATURED_BLOCK_REGEXP, updatedBlock);

  await wk.call({
    wiki: WIKI_NAME,
    method: 'pages.save_one',
    args: {
      page: PAGE_NAME,
      content: updatedContent,
    },
  });

  await updateCardList(current.id, DAILY_PREVIOUS_LIST_ID, (previousCards[0] && previousCards[0].pos - 1));

  log(`Successfully rotated featured daily page to ${name}`);
}
