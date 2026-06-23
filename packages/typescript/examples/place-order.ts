import { TossInvestClient } from 'tossinvest-openapi';

const clientId = process.env.TOSS_INVEST_CLIENT_ID;
const clientSecret = process.env.TOSS_INVEST_CLIENT_SECRET;
const accountSeq = process.env.TOSS_INVEST_ACCOUNT_SEQ;

if (
  clientId === undefined ||
  clientSecret === undefined ||
  accountSeq === undefined
) {
  throw new Error(
    'Set TOSS_INVEST_CLIENT_ID, TOSS_INVEST_CLIENT_SECRET, and TOSS_INVEST_ACCOUNT_SEQ before running this example.',
  );
}

const symbol = process.env.TOSS_INVEST_ORDER_SYMBOL ?? '005930';
const price = process.env.TOSS_INVEST_ORDER_PRICE;

if (price === undefined) {
  throw new Error('Set TOSS_INVEST_ORDER_PRICE before running this example.');
}

const client = new TossInvestClient({ clientId, clientSecret });

// This example places a real order when pointed at a real Toss Securities account.
// Review every environment variable before running it.
const order = await client.createOrder({
  accountSeq,
  clientOrderId: `example-${Date.now()}`,
  symbol,
  side: 'BUY',
  orderType: 'LIMIT',
  timeInForce: 'DAY',
  quantity: '1',
  price,
  confirmHighValueOrder: false,
});

console.log(order);
