export const oauthTokenResponse = {
  access_token: 'token',
  token_type: 'Bearer',
  expires_in: 3600,
} as const;

export const brokerageAccount = {
  accountNo: '12345678901',
  accountSeq: 1,
  accountType: 'BROKERAGE',
} as const;
