/* eslint-disable max-len */
import Helper = require('../../helpers/helper');
import TrustExpectedDataHelper = require('../../helpers/social/trust-expected-data-helper');
import TransactionsPushResponseChecker = require('../../helpers/common/transactions-push-response-checker');
import SocialApi = require('../../../src/lib/social-transactions/api/social-api');
import EosClient = require('../../../src/lib/common/client/eos-client');
import PermissionsDictionary = require('../../../src/lib/dictionary/permissions-dictionary');
import InteractionsDictionary = require('../../../src/lib/dictionary/interactions-dictionary');

const JEST_TIMEOUT = 10000;

async function signAndSendTransaction() {
  const permission = PermissionsDictionary.active();

  const accountName = Helper.getTesterAccountName();
  const privateKey = Helper.getTesterAccountPrivateKey();

  const accountNameTo = Helper.getAccountNameTo();

  const signed: any = await SocialApi.getReferralFromUserSignedTransaction(
    accountName,
    privateKey,
    accountNameTo,
    permission,
  );

  const pushResponse = await EosClient.pushTransaction(signed);

  const expected = TrustExpectedDataHelper.getOneUserToOtherPushResponse(
    accountName,
    accountNameTo,
    InteractionsDictionary.referral(),
  );
  TransactionsPushResponseChecker.checkOneTransaction(pushResponse, expected);
}

describe('Social common transactions', () => {
  describe('Referrer', () => {
    it('Send signed transaction to staging uos.activity', async () => {
      Helper.initForStagingEnv();

      await signAndSendTransaction();
    }, JEST_TIMEOUT);

    it('Send signed transaction to production', async () => {
      Helper.initForProductionEnv();

      await signAndSendTransaction();
    }, JEST_TIMEOUT);
  });
});


export {};
