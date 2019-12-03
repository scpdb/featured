import log from 'scpdb-logger';

const Trello = require('node-trello');

const t = new Trello(process.env.TRELLO_API_KEY, process.env.TRELLO_API_TOKEN);

export const FEATURED_PAGES_BOARD_ID = '5a7fb4d8f343cbdce8d7ee07';
export const DAILY_BACKLOG_LIST_ID = '5a7fb55bc5f0ecbf4b0496e6';
export const DAILY_PREVIOUS_LIST_ID = '5a7fb5605fb6efdcb8a0b4f0';
export const WEEKLY_BACKLOG_LIST_ID = '5a7fb5632634e18ada2a7ade';
export const WEEKLY_PREVIOUS_LIST_ID = '5a7fb566c70bafd8cfce26e5';
export const IN_PROGRESS_LABEL_ID = '5a7fb4d89ae3d60b0c64ae18';

export interface TrelloCard {
  id: string;
  name: string;
  desc: string;
  pos: number;
}

export function getListCards(listId: string): Promise<TrelloCard[]> {
  return new Promise((resolve, reject) => {
    t.get(`/1/lists/${listId}/cards`, (error: Error, data: any) => {
      if (error) {
        throw error;
      }

      const result = data.map((card: TrelloCard) => ({
        id: card.id, name: card.name, desc: card.desc, pos: card.pos,
      }));

      resolve(result);
    });
  });
}

export function updateCardList(cardId: string, listId: string, position?: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const data: { idList: string; pos?: number } = { idList: listId };
    if (position) {
      data.pos = position;
    }

    t.put(`/1/cards/${cardId}`, data, (error: Error) => {
      if (error) {
        reject(error);
      }
      log('[TRELLO] TrelloCard list updated', {
        extra: { cardId, listId },
      });
      resolve();
    });
  });
}
