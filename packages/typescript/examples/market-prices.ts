import { TossInvestClient } from 'tossinvest-openapi';

const clientId = process.env.TOSS_INVEST_CLIENT_ID;
const clientSecret = process.env.TOSS_INVEST_CLIENT_SECRET;

if (clientId === undefined || clientSecret === undefined) {
  throw new Error(
    'Set TOSS_INVEST_CLIENT_ID and TOSS_INVEST_CLIENT_SECRET before running this example.',
  );
}

const client = new TossInvestClient({ clientId, clientSecret });
const symbols = process.env.TOSS_INVEST_SYMBOLS ?? '005930,AAPL';
const prices = await client.getPrices({ symbols });

console.log({
  symbols,
  prices,
});
