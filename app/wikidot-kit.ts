import WikidotKit from 'wikidot-kit';

const apiToken = process.env.WIKIDOT_API_TOKEN;
if (!apiToken) {
  throw new Error('WIKIDOT_API_TOKEN is required');
}

export default new WikidotKit(apiToken);
