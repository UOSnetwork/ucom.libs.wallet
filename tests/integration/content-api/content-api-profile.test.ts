/* eslint-disable security/detect-object-injection */
import Helper = require('../../helpers/helper');
import PermissionsDictionary = require('../../../src/lib/dictionary/permissions-dictionary');
import ContentApi = require('../../../src/lib/content/api/content-api');
import EosClient = require('../../../src/lib/common/client/eos-client');
import WalletApi = require('../../../src/lib/wallet/api/wallet-api');
import ContentProfileHelper = require('../../helpers/content/content-profile-helper');
import moment = require('moment');

const JEST_TIMEOUT = 10000;

describe('Send profile and get profile status', () => {
  // Works only on production
  Helper.initForProductionEnv();

  const accountNameFrom = Helper.getTesterAccountName();
  const privateKey      = Helper.getTesterAccountPrivateKey();
  const permission      = PermissionsDictionary.active();

  describe('Positive', () => {
    it('Account RAM is decreased', async () => {
      await ContentProfileHelper.updateProfileSetMinimum(accountNameFrom, privateKey);
      const stateBefore = await WalletApi.getAccountState(accountNameFrom);
      const { ram: ramUsedLess } = stateBefore.resources;

      await ContentProfileHelper.updateProfileSetExtended(accountNameFrom, privateKey);
      const stateAfter = await WalletApi.getAccountState(accountNameFrom);
      const { ram: ramUsedMore } = stateAfter.resources;

      expect(ramUsedMore.free).toBeLessThan(ramUsedLess.free);
      expect(ramUsedMore.used).toBeGreaterThan(ramUsedLess.used);
      expect(ramUsedMore.total).toEqual(ramUsedLess.total);
    }, JEST_TIMEOUT);

    it('Account RAM is increased', async () => {
      await ContentProfileHelper.updateProfileSetExtended(accountNameFrom, privateKey);
      const stateBefore = await WalletApi.getAccountState(accountNameFrom);
      const { ram: ramUsedMore } = stateBefore.resources;

      await ContentProfileHelper.updateProfileSetMinimum(accountNameFrom, privateKey);
      const stateAfter = await WalletApi.getAccountState(accountNameFrom);
      const { ram: ramUsedLess } = stateAfter.resources;

      expect(ramUsedLess.free).toBeGreaterThan(ramUsedMore.free);
      expect(ramUsedLess.used).toBeLessThan(ramUsedMore.used);
      expect(ramUsedLess.total).toEqual(ramUsedMore.total);
    }, JEST_TIMEOUT);

    it('Send new user profile to blockchain', async () => {
      const profile = ContentProfileHelper.getMinimumProfile(accountNameFrom);

      const signed = await ContentApi.updateProfile(accountNameFrom, privateKey, profile, permission);
      const pushResponse = await EosClient.pushTransaction(signed);

      ContentProfileHelper.checkPushResponse(accountNameFrom, profile, pushResponse);
    }, JEST_TIMEOUT);

    it('save minimum profile settings to blockchain', async () => {
      const isTrackingAllowed = true;
      const userCreatedAt = moment().utc().format();

      const signed = await ContentApi.createProfileAfterRegistration(
        accountNameFrom,
        privateKey,
        isTrackingAllowed,
        userCreatedAt,
      );

      await EosClient.pushTransaction(signed);

      const smartContractData = await ContentApi.getOneAccountProfileFromSmartContractTable(accountNameFrom);

      const expectedProfile = {
        account_name:         accountNameFrom,
        is_tracking_allowed:  isTrackingAllowed,
        profile_updated_at:   userCreatedAt,
      };

      const expectedData = {
        acc: accountNameFrom,
        profile_json: JSON.stringify(expectedProfile),
      };

      expect(smartContractData).toMatchObject(expectedData);
    }, JEST_TIMEOUT);
  });

  describe('Negative', () => {
    it('show error message if not enough RAM', async () => {
      const alreadyReceiptErrorPattern = new RegExp('account autumnknight has insufficient ram');

      const accountNameTo = Helper.getAccountNameTo();
      const accountNameToPrivateKey = Helper.getAccountNameToPrivateKey();

      const profile = {
        about: ContentProfileHelper.getVeryLongString(),
      };

      await expect(ContentProfileHelper.signAndPushUpdateProfile(accountNameTo, accountNameToPrivateKey, profile))
        .rejects.toThrow(alreadyReceiptErrorPattern);
    }, JEST_TIMEOUT);
  });
});

export {};
