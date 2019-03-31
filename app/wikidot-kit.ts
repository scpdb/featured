
const WikidotKit = require('wikidot-kit');

const apiToken = process.env.WIKIDOT_API_TOKEN;
if (!apiToken) {
  throw new Error('WIKIDOT_API_TOKEN is required');
}

export const wk = new WikidotKit({token: process.env.WIKIDOT_API_TOKEN});
