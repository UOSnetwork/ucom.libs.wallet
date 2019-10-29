import { JEST_TIMEOUT_LONGER } from '../../helpers/jest/jest-dictionary';

import Helper = require('../../helpers/helper');
import SocialKeyApi = require('../../../src/lib/social-key/api/social-key-api');
import SocialApi = require('../../../src/lib/social-transactions/api/social-api');
import PermissionsDictionary = require('../../../src/lib/dictionary/permissions-dictionary');
import EosClient = require('../../../src/lib/common/client/eos-client');
import CommonChecker = require('../../helpers/common/common-checker');
import WalletApi = require('../../../src/lib/wallet/api/wallet-api');
import RegistrationApi = require('../../../src/lib/registration/api/registration-api');
import ContentProfileHelper = require('../../helpers/content/content-profile-helper');

Helper.initForEnvByProcessVariable();

const accountName       = Helper.getTesterAccountName();
const activePrivateKey  = Helper.getTesterAccountPrivateKey();

const accountNameTo     = Helper.getAccountNameTo();

const JEST_TIMEOUT = 30000;

async function checkTrustAndProfileUpdating(user): Promise<void> {
  const signedTrust = await SocialApi.getTrustUserSignedTransaction(
    user.accountName,
    user.socialPrivateKey,
    accountName,
    PermissionsDictionary.social(),
  );

  await EosClient.pushTransaction(signedTrust);
  await ContentProfileHelper.updateProfileSetMinimum(user.accountName, user.socialPrivateKey, PermissionsDictionary.social());
}

it('Suppress an error about permission already set', async () => {
  const result = await SocialKeyApi.addSocialPermissionsToEmissionAndProfile(accountName, activePrivateKey);

  expect(result).toBeNull();
}, JEST_TIMEOUT * 3);

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

  expect(bytesForSocialKey).toBeLessThan(2000);
}, JEST_TIMEOUT * 10);

it('Bind emission and profile updating rules', async () => {
  const user = RegistrationApi.generateRandomDataForRegistration();

  await RegistrationApi.createNewAccountInBlockchain(
    Helper.getCreatorAccountName(),
    Helper.getCreatorPrivateKey(),
    user.accountName,
    user.ownerPublicKey,
    user.activePublicKey,
  );

  await SocialKeyApi.bindSocialKeyWithoutEmissionAndProfile(
    user.accountName,
    user.activePrivateKey,
    user.socialPublicKey,
  );

  await SocialKeyApi.addSocialPermissionsToEmissionAndProfile(
    user.accountName,
    user.activePrivateKey,
  );

  await checkTrustAndProfileUpdating(user);
}, JEST_TIMEOUT_LONGER);

it('Bind a social key', async () => {
  const user = RegistrationApi.generateRandomDataForRegistration();

  await RegistrationApi.createNewAccountInBlockchain(
    Helper.getCreatorAccountName(),
    Helper.getCreatorPrivateKey(),
    user.accountName,
    user.ownerPublicKey,
    user.activePublicKey,
  );

  await SocialKeyApi.bindSocialKeyWithSocialPermissions(
    user.accountName,
    user.activePrivateKey,
    user.socialPublicKey,
  );

  const socialKey = await SocialKeyApi.getAccountCurrentSocialKey(user.accountName);

  expect(socialKey).toBe(user.socialPublicKey);

  await checkTrustAndProfileUpdating(user);
}, JEST_TIMEOUT * 3);

export {};
