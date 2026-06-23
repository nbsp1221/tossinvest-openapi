import { TossInvestClient } from 'tossinvest-openapi';

const clientId = process.env.TOSS_INVEST_CLIENT_ID;
const clientSecret = process.env.TOSS_INVEST_CLIENT_SECRET;
const accountSeqValue = process.env.TOSS_INVEST_ACCOUNT_SEQ;
const enableRealOrder = process.env.TOSS_INVEST_ENABLE_REAL_ORDER;

if (
  clientId === undefined ||
  clientSecret === undefined ||
  accountSeqValue === undefined
) {
  throw new Error(
    'Set TOSS_INVEST_CLIENT_ID, TOSS_INVEST_CLIENT_SECRET, and TOSS_INVEST_ACCOUNT_SEQ before running this example.',
  );
}

if (enableRealOrder !== 'true') {
  throw new Error(
    'This example places a real order. Set TOSS_INVEST_ENABLE_REAL_ORDER=true only after reviewing every order input.',
  );
}

const accountSeq = Number(accountSeqValue);

if (!Number.isInteger(accountSeq)) {
  throw new Error('TOSS_INVEST_ACCOUNT_SEQ must be an integer.');
}

const symbol = process.env.TOSS_INVEST_ORDER_SYMBOL;
const price = process.env.TOSS_INVEST_ORDER_PRICE;

if (symbol === undefined || price === undefined) {
  throw new Error(
    'Set TOSS_INVEST_ORDER_SYMBOL and TOSS_INVEST_ORDER_PRICE before running this example.',
  );
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

console.log({
  clientOrderId: order.clientOrderId,
  orderId: order.orderId,
});
