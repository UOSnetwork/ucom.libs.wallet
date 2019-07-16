import Helper = require('../../helpers/helper');
import TrustExpectedDataHelper = require('../../helpers/social/social-action-expected-data-helper');
import TransactionsPushResponseChecker = require('../../helpers/common/transactions-push-response-checker');
import SocialApi = require('../../../src/lib/social-transactions/api/social-api');
import EosClient = require('../../../src/lib/common/client/eos-client');
import InteractionsDictionary = require('../../../src/lib/dictionary/interactions-dictionary');

const JEST_TIMEOUT = 10000;

Helper.initForEnvByProcessVariable();

async function signAndSendTransaction() {
  const accountName = Helper.getTesterAccountName();
  const privateKey = Helper.getTesterAccountPrivateKey();

  const accountNameTo = Helper.getAccountNameTo();

  const signed = await SocialApi.getTrustUserSignedTransaction(accountName, privateKey, accountNameTo);
  const signedJson = SocialApi.signedTransactionToString(signed);

  const signedParsed = SocialApi.parseSignedTransactionJson(signedJson);
  expect(signed).toMatchObject(signedParsed);

  const trustTrxResponse = await EosClient.pushTransaction(signedParsed);

  const expected = TrustExpectedDataHelper.getOneUserToOtherPushResponse(
    accountName,
    accountNameTo,
    InteractionsDictionary.trust(),
  );
  TransactionsPushResponseChecker.checkOneTransaction(trustTrxResponse, expected);
}

describe('Trust', () => {
  it('Send signed transaction to staging uos.activity', async () => {
    await signAndSendTransaction();
  }, JEST_TIMEOUT);

  it('Send signed transaction to staging uos.activity - fetch json', async () => {
    const accountName = Helper.getTesterAccountName();
    const privateKey = Helper.getTesterAccountPrivateKey();
    const accountNameTo = Helper.getAccountNameTo();

    const signedJson = await SocialApi.getTrustUserSignedTransactionsAsJson(accountName, privateKey, accountNameTo);
    const signedParsed = SocialApi.parseSignedTransactionJson(signedJson);

    const trustTrxResponse = await EosClient.pushTransaction(signedParsed);

    const expected = TrustExpectedDataHelper.getOneUserToOtherPushResponse(
      accountName,
      accountNameTo,
      InteractionsDictionary.trust(),
    );
    TransactionsPushResponseChecker.checkOneTransaction(trustTrxResponse, expected);
  }, JEST_TIMEOUT);
});

describe('Untrust', () => {
  it('Send signed untrust transaction to staging uos.activity - fetch json', async () => {
    const accountName = Helper.getTesterAccountName();
    const privateKey = Helper.getTesterAccountPrivateKey();
    const accountNameTo = Helper.getAccountNameTo();

    const signedJson = await SocialApi.getUnTrustUserSignedTransactionsAsJson(accountName, privateKey, accountNameTo);
    const signedParsed = SocialApi.parseSignedTransactionJson(signedJson);

    const trustTrxResponse = await EosClient.pushTransaction(signedParsed);

    const expected = TrustExpectedDataHelper.getOneUserToOtherPushResponse(
      accountName,
      accountNameTo,
      InteractionsDictionary.untrust(),
    );
    TransactionsPushResponseChecker.checkOneTransaction(trustTrxResponse, expected);
  }, JEST_TIMEOUT);
});

export {};
