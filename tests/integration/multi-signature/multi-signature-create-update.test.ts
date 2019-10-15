import { JEST_TIMEOUT_LONGER } from '../../helpers/jest/jest-dictionary';
import { IStringToAny } from '../../../src/lib/common/interfaces/common-interfaces';
import { extractAccountsFromMultiSignaturePermission } from '../../../src/lib/account/helpers/account-data-helper';

import Helper = require('../../helpers/helper');
import RegistrationApi = require('../../../src/lib/registration/api/registration-api');
import BlockchainRegistry = require('../../../src/lib/blockchain-registry');
import MultiSignatureApi = require('../../../src/lib/multi-signature/api/multi-signature-api');
import PermissionsDictionary = require('../../../src/lib/dictionary/permissions-dictionary');
import ContentApi = require('../../../src/lib/content/api/content-api');
import moment = require('moment');
import delay = require('delay');

Helper.initForEnvByProcessVariable();

const activePrivateKey  = Helper.getTesterAccountPrivateKey();

const accountName = Helper.getTesterAccountName();

it('should create new multi-signature account', async () => {
  const data = RegistrationApi.generateRandomDataForRegistration();

  const fakeProfile = {
    name: 'helloworld',
    about: 'about the community',
  };

  await MultiSignatureApi.createMultiSignatureAccount(
    accountName, activePrivateKey,
    data.accountName, data.ownerPrivateKey, data.ownerPublicKey, data.activePublicKey,
    fakeProfile,
    [
      Helper.getBobAccountName(),
    ],
  );

  const state = await BlockchainRegistry.getRawAccountData(data.accountName);

  const expectedPermissions = [
    {
      perm_name: PermissionsDictionary.active(),
      parent: PermissionsDictionary.owner(),
      required_auth: {
        threshold: 1,
        keys: [],
        accounts: [
          {
            permission: {
              actor: accountName,
              permission: PermissionsDictionary.active(),
            },
            weight: 1,
          },
        ],
        waits: [],
      },
    },
    {
      perm_name: PermissionsDictionary.owner(),
      parent: '',
      required_auth: {
        threshold: 1,
        keys: [],
        accounts: [
          {
            permission: {
              actor: accountName,
              permission: PermissionsDictionary.active(),
            },
            weight: 1,
          },
        ],
        waits: [],
      },
    },
    {
      perm_name: PermissionsDictionary.social(),
      parent: PermissionsDictionary.active(),
      required_auth: {
        threshold: 1,
        keys: [],
        accounts: [
          {
            permission: {
              actor: Helper.getBobAccountName(),
              permission: PermissionsDictionary.social(),
            },
            weight: 1,
          },
          {
            permission: {
              actor: accountName,
              permission: PermissionsDictionary.social(),
            },
            weight: 1,
          },
        ],
        waits: [],
      },
    },
  ];

  expect(state.permissions).toEqual(expectedPermissions);

  const smartContractData = await ContentApi.getOneAccountProfileFromSmartContractTable(data.accountName);

  const expectedData = {
    acc: data.accountName,
    profile_json: JSON.stringify(fakeProfile),
  };

  expect(smartContractData).toMatchObject(expectedData);
}, JEST_TIMEOUT_LONGER);

describe('Update an existing multi-signature account', () => {
  const multiSignatureAccount = Helper.getMultiSignatureAccount();

  const actorAccountName = Helper.getVladAccountName();
  const actorPrivateKey = Helper.getVladSocialPrivateKey();
  const proposePermission = PermissionsDictionary.social();

  const profile = {
    name: `helloworld: ${moment().utc().format()}`,
    about: `about the community: ${moment().utc().format()}`,
  };

  it('Profile only', async () => {
    await MultiSignatureApi.updateProfile(
      actorAccountName,
      actorPrivateKey,
      proposePermission,
      multiSignatureAccount,
      profile,
    );

    await delay(3000);

    await checkProfileInSmartContract(multiSignatureAccount, profile);
  }, JEST_TIMEOUT_LONGER);

  it('both profile and social members', async () => {
    const socialMembersToReset = [
      Helper.getVladAccountName(),
    ];

    await MultiSignatureApi.changeSocialMembers(
      actorAccountName, Helper.getVladActivePrivateKey(), multiSignatureAccount, socialMembersToReset,
    );

    const socialMembers = [
      Helper.getAliceAccountName(),
      Helper.getBobAccountName(),
      Helper.getVladAccountName(),
    ];

    const privateKey = Helper.getVladActivePrivateKey();

    await MultiSignatureApi.createAndExecuteProfileUpdateAndSocialMembers(
      actorAccountName, privateKey, multiSignatureAccount, profile, socialMembers,
    );

    await delay(3000);

    const state = await BlockchainRegistry.getRawAccountData(multiSignatureAccount);

    const actualSocialMembers = extractAccountsFromMultiSignaturePermission(state, PermissionsDictionary.social());
    expect(actualSocialMembers).toEqual(socialMembers);

    await checkProfileInSmartContract(multiSignatureAccount, profile);
  }, JEST_TIMEOUT_LONGER);
});

async function checkProfileInSmartContract(multiSignatureAccount: string, profile: IStringToAny): Promise<void> {
  const smartContractData = await ContentApi.getOneAccountProfileFromSmartContractTable(multiSignatureAccount);

  const expectedData = {
    acc: multiSignatureAccount,
    profile_json: JSON.stringify(profile),
  };

  expect(smartContractData).toMatchObject(expectedData);
}

export {};
