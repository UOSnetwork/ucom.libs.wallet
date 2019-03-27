const { SocialApi, EosClient }       = require('../index');

const helper = require('./helper');
const TrustExpectedDataHelper = require('./helpers/social/trust-expected-data-helper');
const TransactionsPushResponseChecker = require('./helpers/common/transactions-push-response-checker');

const JEST_TIMEOUT = 10000;

async function signAndSendTransaction() {
  const accountName             = helper.getTesterAccountName();
  const privateKey              = helper.getTesterAccountPrivateKey();

  const accountNameTo           = helper.getAccountNameTo();

  const signed      = await SocialApi.getTrustUserSignedTransaction(accountName, privateKey, accountNameTo);
  const signedJson  = SocialApi.signedTransactionToString(signed);

  const signedParsed = SocialApi.parseSignedTransactionJson(signedJson);
  expect(signed).toMatchObject(signedParsed);

  const trustTrxResponse = await EosClient.pushTransaction(signedParsed);

  const expected = TrustExpectedDataHelper.getOneUserToOtherPushResponse(accountName, accountNameTo);
  TransactionsPushResponseChecker.checkOneTransaction(trustTrxResponse, expected);
}

describe('Send trust transactions to blockchain', () => {
  it('Send signed transaction to staging uos.activity', async () => {
    helper.initForStagingEnv();

    await signAndSendTransaction();
  }, JEST_TIMEOUT);

  it('Send signed transaction to production', async () => {
    helper.initForProductionEnv();

    await signAndSendTransaction();
  }, JEST_TIMEOUT);

  it('Send signed transaction to staging uos.activity - fetch json', async () => {
    helper.initForStagingEnv();

    const accountName = helper.getTesterAccountName();
    const privateKey = helper.getTesterAccountPrivateKey();
    const accountNameTo = helper.getAccountNameTo();

    const signedJson = await SocialApi.getTrustUserSignedTransactionsAsJson(accountName, privateKey, accountNameTo);
    const signedParsed = SocialApi.parseSignedTransactionJson(signedJson);

    const trustTrxResponse = await EosClient.pushTransaction(signedParsed);

    const expected = TrustExpectedDataHelper.getOneUserToOtherPushResponse(accountName, accountNameTo);
    TransactionsPushResponseChecker.checkOneTransaction(trustTrxResponse, expected);
  }, JEST_TIMEOUT);
});
