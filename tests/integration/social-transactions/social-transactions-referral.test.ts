/* eslint-disable max-len */
import Helper = require('../../helpers/helper');
import SocialActionExpectedDataHelper = require('../../helpers/social/social-action-expected-data-helper');
import TransactionsPushResponseChecker = require('../../helpers/common/transactions-push-response-checker');
import SocialApi = require('../../../src/lib/social-transactions/api/social-api');
import EosClient = require('../../../src/lib/common/client/eos-client');
import PermissionsDictionary = require('../../../src/lib/dictionary/permissions-dictionary');
import InteractionsDictionary = require('../../../src/lib/dictionary/interactions-dictionary');

const JEST_TIMEOUT = 10000;

async function signAndSendTransaction() {
  const permission = PermissionsDictionary.social();

  const accountName = Helper.getTesterAccountName();
  const privateKey = Helper.getTesterAccountSocialPrivateKey();

  const accountNameTo = Helper.getAccountNameTo();

  const signed: any = await SocialApi.getReferralFromUserSignedTransaction(
    accountName,
    privateKey,
    accountNameTo,
    permission,
  );

  const pushResponse = await EosClient.pushTransaction(signed);

  const expected = SocialActionExpectedDataHelper.getOneUserToOtherPushResponse(
    accountName,
    accountNameTo,
    InteractionsDictionary.referral(),
    'account_to',
    permission,
  );
  TransactionsPushResponseChecker.checkOneTransaction(pushResponse, expected);
}

it('Send signed referral transaction', async () => {
  Helper.initForEnvByProcessVariable();

  await signAndSendTransaction();
}, JEST_TIMEOUT);

export {};
