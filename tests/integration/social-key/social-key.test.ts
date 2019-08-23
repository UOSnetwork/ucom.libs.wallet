import Helper = require('../../helpers/helper');
import SocialKeyApi = require('../../../src/lib/social-key/api/social-key-api');
// @ts-ignore
import SocialApi = require('../../../src/lib/social-transactions/api/social-api');
import PermissionsDictionary = require('../../../src/lib/dictionary/permissions-dictionary');
import EosClient = require('../../../src/lib/common/client/eos-client');
import CommonChecker = require('../../helpers/common/common-checker');

Helper.initForEnvByProcessVariable();

const accountName       = Helper.getTesterAccountName();
const activePrivateKey  = Helper.getTesterAccountPrivateKey();

const accountNameTo     = Helper.getAccountNameTo();

const JEST_TIMEOUT = 30000;

it('Get current account permissions state and try to send transaction', async () => {
  const current = await SocialKeyApi.getAccountCurrentSocialKey(accountName);

  const { publicKey, privateKey } = SocialKeyApi.generateSocialKeyFromActivePrivateKey(activePrivateKey);

  expect(current).toBe(publicKey);

  const signedTransaction =
    await SocialApi.getTrustUserSignedTransaction(accountName, privateKey, accountNameTo, PermissionsDictionary.social());

  const response = await EosClient.pushTransaction(signedTransaction);

  CommonChecker.expectNotEmpty(response.processed);
  CommonChecker.expectNotEmpty(response.transaction_id);
}, JEST_TIMEOUT);

it.skip('Bind social key', async () => {
  // #task - unbind social key beforehand
  const { publicKey: socialPublicKey } = SocialKeyApi.generateSocialKeyFromActivePrivateKey(activePrivateKey);

  const socialKeyResponse = await SocialKeyApi.bindSocialKeyWithSocialPermissions(
    accountName,
    activePrivateKey,
    socialPublicKey,
  );

  // eslint-disable-next-line no-console
  console.dir(socialKeyResponse);
}, JEST_TIMEOUT);

export {};
