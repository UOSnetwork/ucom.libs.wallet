import Helper = require('../../helpers/helper');
import SocialKeyApi = require('../../../src/lib/social-key/api/social-key-api');
import SocialApi = require('../../../src/lib/social-transactions/api/social-api');
import PermissionsDictionary = require('../../../src/lib/dictionary/permissions-dictionary');
import EosClient = require('../../../src/lib/common/client/eos-client');
import CommonChecker = require('../../helpers/common/common-checker');
import WalletApi = require('../../../src/lib/wallet/api/wallet-api');
import RegistrationApi = require('../../../src/lib/registration/api/registration-api');

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

it('Account RAM is decreased during the social key creation but not very much', async () => {
  const data = RegistrationApi.generateRandomDataForRegistration();

  await RegistrationApi.createNewAccountInBlockchain(
    Helper.getCreatorAccountName(),
    Helper.getCreatorPrivateKey(),
    data.accountName,
    data.ownerPublicKey,
    data.activePublicKey,
  );

  const stateBefore = await WalletApi.getAccountState(data.accountName);
  const { ram: ramUsedLess } = stateBefore.resources;

  await SocialKeyApi.bindSocialKeyWithSocialPermissions(
    data.accountName,
    data.activePrivateKey,
    data.socialPublicKey,
  );

  const stateAfter = await WalletApi.getAccountState(data.accountName);
  const { ram: ramUsedMore } = stateAfter.resources;

  expect(ramUsedMore.free).toBeLessThan(ramUsedLess.free);
  expect(ramUsedMore.used).toBeGreaterThan(ramUsedLess.used);
  expect(ramUsedMore.total).toEqual(ramUsedLess.total);

  const bytesForSocialKey = (ramUsedMore.used - ramUsedLess.used) * 1024;

  expect(bytesForSocialKey).toBeLessThan(1000);
}, JEST_TIMEOUT);

it('Bind a social key', async () => {
  const data = RegistrationApi.generateRandomDataForRegistration();

  await RegistrationApi.createNewAccountInBlockchain(
    Helper.getCreatorAccountName(),
    Helper.getCreatorPrivateKey(),
    data.accountName,
    data.ownerPublicKey,
    data.activePublicKey,
  );

  await SocialKeyApi.bindSocialKeyWithSocialPermissions(
    data.accountName,
    data.activePrivateKey,
    data.socialPublicKey,
  );

  const socialKey = await SocialKeyApi.getAccountCurrentSocialKey(data.accountName);

  expect(socialKey).toBe(data.socialPublicKey);
}, JEST_TIMEOUT);

export {};
