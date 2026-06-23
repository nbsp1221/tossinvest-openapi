import { TossInvestClient } from 'tossinvest-openapi';

const clientId = process.env.TOSS_INVEST_CLIENT_ID;
const clientSecret = process.env.TOSS_INVEST_CLIENT_SECRET;

if (clientId === undefined || clientSecret === undefined) {
  throw new Error(
    'Set TOSS_INVEST_CLIENT_ID and TOSS_INVEST_CLIENT_SECRET before running this example.',
  );
}

const client = new TossInvestClient({ clientId, clientSecret });

const accounts = await client.getAccounts();
const accountSeq = accounts[0]?.accountSeq;

if (accountSeq === undefined) {
  throw new Error('No Toss Securities account was returned.');
}

const holdings = await client.getHoldings({ accountSeq });

console.log({
  accountSeq,
  holdingCount: holdings.items.length,
  symbols: holdings.items.map((item) => item.symbol),
});
