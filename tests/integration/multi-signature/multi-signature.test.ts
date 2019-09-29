import Helper = require('../../helpers/helper');
import RegistrationApi = require('../../../src/lib/registration/api/registration-api');
import BlockchainRegistry = require('../../../src/lib/blockchain-registry');
import MultiSignatureApi = require('../../../src/lib/multi-signature/api/multi-signature-api');
import PermissionsDictionary = require('../../../src/lib/dictionary/permissions-dictionary');
import CommonChecker = require('../../helpers/common/common-checker');

Helper.initForEnvByProcessVariable();

const activePrivateKey  = Helper.getTesterAccountPrivateKey();

const accountName = Helper.getTesterAccountName();
const socialPrivateKey = Helper.getTesterAccountSocialPrivateKey();
const socialPermission = PermissionsDictionary.social();

const accountTo = Helper.getAccountNameTo();


const JEST_TIMEOUT = 30000;

it('should create new multi-signature account', async () => {
  const data = RegistrationApi.generateRandomDataForRegistration();

  await MultiSignatureApi.createMultiSignatureAccount(
    accountName, activePrivateKey,
    data.accountName, data.ownerPrivateKey, data.ownerPublicKey, data.activePublicKey,
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
              permission: PermissionsDictionary.owner(),
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
}, JEST_TIMEOUT);

it('should create a proposal', async () => {

  // TODO - internal server error
  const response = await MultiSignatureApi.createTrustProposal(accountName, accountTo, socialPrivateKey, socialPermission);

  CommonChecker.expectNotEmpty(response);
}, JEST_TIMEOUT);

export {};
