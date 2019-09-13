import Helper = require('../../helpers/helper');
import TrustExpectedDataHelper = require('../../helpers/social/social-action-expected-data-helper');
import TransactionsPushResponseChecker = require('../../helpers/common/transactions-push-response-checker');
import SocialApi = require('../../../src/lib/social-transactions/api/social-api');
import EosClient = require('../../../src/lib/common/client/eos-client');
import InteractionsDictionary = require('../../../src/lib/dictionary/interactions-dictionary');
import PermissionsDictionary = require('../../../src/lib/dictionary/permissions-dictionary');
import CommonChecker = require('../../helpers/common/common-checker');

const JEST_TIMEOUT = 40000;

Helper.initForEnvByProcessVariable();

const accountName = Helper.getTesterAccountName();
const privateKey = Helper.getTesterAccountSocialPrivateKey();
const permission = PermissionsDictionary.social();

const accountNameTo = Helper.getAccountNameTo();

async function signAndSendTransaction() {
  const signed = await SocialApi.getTrustUserSignedTransaction(accountName, privateKey, accountNameTo, permission);
  const signedJson = SocialApi.signedTransactionToString(signed);

  const signedParsed = SocialApi.parseSignedTransactionJson(signedJson);
  expect(signed).toMatchObject(signedParsed);

  const trustTrxResponse = await EosClient.pushTransaction(signedParsed);

  const expected = TrustExpectedDataHelper.getOneUserToOtherPushResponse(
    accountName,
    accountNameTo,
    InteractionsDictionary.trust(),
    'account_to',
    permission,
  );
  TransactionsPushResponseChecker.checkOneTransaction(trustTrxResponse, expected);
}

describe('Trust', () => {
  it('Send signed transaction to staging uos.activity', async () => {
    await signAndSendTransaction();
  }, JEST_TIMEOUT);

  it('Send signed transaction to staging uos.activity - fetch json', async () => {
    const signedJson =
      await SocialApi.getTrustUserSignedTransactionsAsJson(accountName, privateKey, accountNameTo, permission);
    const signedParsed = SocialApi.parseSignedTransactionJson(signedJson);

    const trustTrxResponse = await EosClient.pushTransaction(signedParsed);

    const expected = TrustExpectedDataHelper.getOneUserToOtherPushResponse(
      accountName,
      accountNameTo,
      InteractionsDictionary.trust(),
      'account_to',
      permission,
    );
    TransactionsPushResponseChecker.checkOneTransaction(trustTrxResponse, expected);
  }, JEST_TIMEOUT);

  it('should send signed transaction with auto update post', async () => {
    const { blockchain_id, signed_transaction } = await SocialApi.getTrustUserWithAutoUpdateSignedTransaction(
      accountName,
      privateKey,
      accountNameTo,
      permission,
    );

    CommonChecker.expectNotEmpty(blockchain_id);

    const pushResponse = await EosClient.pushTransaction(signed_transaction);

    const { processed } = pushResponse;

    expect(processed.action_traces.length).toBe(2);

    const actionTrust = processed.action_traces.find((item) => item.act.data.action_json.includes(InteractionsDictionary.trust()));
    const actionAutoUpdate = processed.action_traces.find((item) => item.act.data.action_json.includes(InteractionsDictionary.createAutoUpdatePostFromAccount()));

    CommonChecker.expectNotEmpty(actionTrust);
    CommonChecker.expectNotEmpty(actionAutoUpdate);
    /*
      TODO
      check auto update structure
      check trust act structure

      same - for untrust

     */
  }, JEST_TIMEOUT);
});

describe('Untrust', () => {
  it('Send signed untrust transaction to staging uos.activity - fetch json', async () => {
    const signedJson =
      await SocialApi.getUnTrustUserSignedTransactionsAsJson(accountName, privateKey, accountNameTo, permission);
    const signedParsed = SocialApi.parseSignedTransactionJson(signedJson);

    const trustTrxResponse = await EosClient.pushTransaction(signedParsed);

    const expected = TrustExpectedDataHelper.getOneUserToOtherPushResponse(
      accountName,
      accountNameTo,
      InteractionsDictionary.untrust(),
      'account_to',
      permission,
    );
    TransactionsPushResponseChecker.checkOneTransaction(trustTrxResponse, expected);
  }, JEST_TIMEOUT);
});

export {};
