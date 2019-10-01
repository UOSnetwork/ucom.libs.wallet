import Helper = require('../../helpers/helper');
import RegistrationApi = require('../../../src/lib/registration/api/registration-api');
import BlockchainRegistry = require('../../../src/lib/blockchain-registry');
import MultiSignatureApi = require('../../../src/lib/multi-signature/api/multi-signature-api');
import PermissionsDictionary = require('../../../src/lib/dictionary/permissions-dictionary');
import CommonChecker = require('../../helpers/common/common-checker');

Helper.initForEnvByProcessVariable();

const activePrivateKey  = Helper.getTesterAccountPrivateKey();

const accountName = Helper.getTesterAccountName();

const JEST_TIMEOUT = 30000;

it('should create new multi-signature account - prototype', async () => {
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

  console.log(data.accountName);
}, JEST_TIMEOUT);

it('should create a proposal and approve - prototype', async () => {
  // @ts-ignore
  const multiSignatureAccountData = {
    accountName: 'pguhmvv1mzwc', // with propose and approve as social
    // accountName: 'ozovptq53aqa', // with approve as social
    // accountName: 'vmqjstiipgv5',
  };

  // await WalletApi.sendTokens(Helper.getCreatorAccountName(), Helper.getCreatorPrivateKey(), multiSignatureAccountData.accountName, 9);

  // @ts-ignore
  const state = await BlockchainRegistry.getAccountInfo(multiSignatureAccountData.accountName);

  // @ts-ignore
  const expirationInDays = 1;

  // @ts-ignore
  const { proposalName } = await MultiSignatureApi.createTransferProposal(
    accountName,
    Helper.getTesterAccountPrivateKey(),
    PermissionsDictionary.active(),
    accountName,
    multiSignatureAccountData.accountName,
    accountName,
    expirationInDays,
  );

  // before - 18 tokens of multisig
  // vlad - 1659.979 tokens

  // send 1 token


  // await SocialKeyApi.assignSocialPermissionForExecute(Helper.getTesterAccountName(), Helper.getTesterAccountPrivateKey(), PermissionsDictionary.active());

  // no success in adding a proposal from the jane when jane is not in the members team
  // const { proposalName } = await MultiSignatureApi.createTrustProposal(
  //   accountName,
  //   Helper.getTesterAccountSocialPrivateKey(),
  //   PermissionsDictionary.social(),
  //   accountName,
  //   PermissionsDictionary.social(),
  //   multiSignatureAccountData.accountName,
  //   accountName,
  //   expirationInDays,
  // );

  // const proposalName = 'jqamfkzeieje';

  console.log(`Proposal name is: ${proposalName}`);

  await MultiSignatureApi.approveProposal(
    accountName,
    Helper.getTesterAccountPrivateKey(),
    PermissionsDictionary.active(),
    accountName,
    proposalName,
    PermissionsDictionary.active(),
  );

  // @ts-ignore
  const response = await MultiSignatureApi.executeProposal(
    multiSignatureAccountData.accountName,
    Helper.getTesterAccountPrivateKey(),
    PermissionsDictionary.active(),
    accountName,
    proposalName,
    accountName,
  );

  CommonChecker.expectNotEmpty(response);
}, JEST_TIMEOUT * 1000);

export {};
