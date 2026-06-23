import {
  TossInvestApiError,
  TossInvestClient,
  TossInvestConnectionError,
} from 'tossinvest-openapi';

const clientId = process.env.TOSS_INVEST_CLIENT_ID;
const clientSecret = process.env.TOSS_INVEST_CLIENT_SECRET;

if (clientId === undefined || clientSecret === undefined) {
  throw new Error(
    'Set TOSS_INVEST_CLIENT_ID and TOSS_INVEST_CLIENT_SECRET before running this example.',
  );
}

const client = new TossInvestClient({ clientId, clientSecret });

try {
  const prices = await client.getPrices({ symbols: '005930' });
  console.log({
    priceCount: prices.length,
    returnedSymbols: prices.map((price) => price.symbol),
  });
} catch (error) {
  if (error instanceof TossInvestApiError) {
    console.error({
      type: 'api',
      status: error.status,
      code: error.code,
      requestId: error.requestId,
      message: error.message,
    });
  } else if (error instanceof TossInvestConnectionError) {
    console.error({
      type: 'connection',
      message: error.message,
    });
  } else {
    throw error;
  }
}
