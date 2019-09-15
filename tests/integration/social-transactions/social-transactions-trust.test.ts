import Helper = require('../../helpers/helper');
import TrustExpectedDataHelper = require('../../helpers/social/social-action-expected-data-helper');
import TransactionsPushResponseChecker = require('../../helpers/common/transactions-push-response-checker');
import SocialApi = require('../../../src/lib/social-transactions/api/social-api');
import EosClient = require('../../../src/lib/common/client/eos-client');
import InteractionsDictionary = require('../../../src/lib/dictionary/interactions-dictionary');
import PermissionsDictionary = require('../../../src/lib/dictionary/permissions-dictionary');
import CommonChecker = require('../../helpers/common/common-checker');
import SocialActionExpectedDataHelper = require('../../helpers/social/social-action-expected-data-helper');

const JEST_TIMEOUT = 40000;

Helper.initForEnvByProcessVariable();

const accountName = Helper.getTesterAccountName();
const privateKey = Helper.getTesterAccountSocialPrivateKey();
const permission = PermissionsDictionary.social();

const accountNameTo = Helper.getAccountNameTo();

it('Trust - should send signed transaction with auto update post', async () => {
  const trustInteraction = InteractionsDictionary.trust();

  const { blockchain_id, signed_transaction } = await SocialApi.getTrustUserWithAutoUpdateSignedTransaction(
    accountName,
    privateKey,
    accountNameTo,
    permission,
  );

  await pushAndCheckTrustWithAutoUpdate(trustInteraction, blockchain_id, signed_transaction);
}, JEST_TIMEOUT);

it('Untrust - should send signed transaction with auto update post', async () => {
  const trustInteraction = InteractionsDictionary.untrust();

  const { blockchain_id, signed_transaction } = await SocialApi.getUntrustUserWithAutoUpdateSignedTransaction(
    accountName,
    privateKey,
    accountNameTo,
    permission,
  );

  await pushAndCheckTrustWithAutoUpdate(trustInteraction, blockchain_id, signed_transaction);
}, JEST_TIMEOUT);

async function pushAndCheckTrustWithAutoUpdate(
  trustInteraction: string,
  blockchain_id: string,
  signed_transaction: string,
) {
  const autoUpdateInteraction = InteractionsDictionary.createAutoUpdatePostFromAccount();

  CommonChecker.expectNotEmpty(blockchain_id);

  const pushResponse = await EosClient.pushTransaction(signed_transaction);

  const { processed } = pushResponse;

  expect(processed.action_traces.length).toBe(2);

  SocialActionExpectedDataHelper.expectTrustActionInsidePushResponse(pushResponse, trustInteraction, accountName, accountNameTo);
  SocialActionExpectedDataHelper.expectAutoUpdateActionInsidePushResponse(
    pushResponse,
    autoUpdateInteraction,
    accountName,
    blockchain_id,
  );
}

describe('Legacy - trust should be pushed with the auto-update', () => {
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
export {};
