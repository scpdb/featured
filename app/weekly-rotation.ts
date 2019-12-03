import log from 'scpdb-logger';
import {
  getListCards,
  updateCardList,
  WEEKLY_BACKLOG_LIST_ID,
  WEEKLY_PREVIOUS_LIST_ID,
} from './trello';
import wk from './wikidot-kit';

const PAGE_NAME_REG = /^[a-zA-Z0-9_:-]+$/;
const FEATURED_BLOCK_REGEXP = /\[!--\sFEATURED_WEEKLY_START\s--][\s\S]*\[!--\sFEATURED_WEEKLY_END\s--]/;
const WIKI_NAME = 'scp-ru';
// const PAGE_NAME = '_default:main';
const PAGE_NAME = 'draft:resure';

export default async function rotateWeekly(): Promise<void> {
  const previousCards = (await getListCards(WEEKLY_PREVIOUS_LIST_ID));
  const backlogCards = await getListCards(WEEKLY_BACKLOG_LIST_ID);
  const current = backlogCards[0];

  if (!current) {
    throw new Error('Featured Weekly Queue is empty');
  }

  const { name } = current;
  if (!PAGE_NAME_REG.test(name)) {
    throw new Error(`Featured Weekly page name is not valid ("${name}")`);
  }
  const annotation = current.desc;

  log(`Rotating featured weekly to page ${name}`);

  const currentPage = await wk.fetchPage(WIKI_NAME, name);

  const updatedBlock = `
[!-- FEATURED_WEEKLY_START --]
[[div class="scp-featured__block"]]
  [[div class="scp-featured__title"]]
    Объект недели
  [[/div]]
  [[div class="scp-featured__page-title"]]
    [/${currentPage.fullname} ${currentPage.title}]
  [[/div]]
  [[div class="scp-featured__content"]]
    //${annotation}//
  [[/div]]
[[/div]]
[!-- FEATURED_WEEKLY_END --]
    `.trim();

  const { content } = await wk.fetchPage(WIKI_NAME, PAGE_NAME);
  const updatedContent = content.replace(FEATURED_BLOCK_REGEXP, updatedBlock);

  await wk.call('pages.save_one', {
    site: WIKI_NAME,
    page: PAGE_NAME,
    content: updatedContent,
  });

  await updateCardList(current.id, WEEKLY_PREVIOUS_LIST_ID, (previousCards[0] && previousCards[0].pos - 1));

  log(`Successfully rotated featured weekly page to ${name}`);
}
