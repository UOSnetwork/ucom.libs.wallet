import Helper = require('../../helpers/helper');
import RegistrationApi = require('../../../src/lib/registration/api/registration-api');
import BlockchainRegistry = require('../../../src/lib/blockchain-registry');
import MultiSignatureApi = require('../../../src/lib/multi-signature/api/multi-signature-api');
import PermissionsDictionary = require('../../../src/lib/dictionary/permissions-dictionary');
import CommonChecker = require('../../helpers/common/common-checker');
import ContentApi = require('../../../src/lib/content/api/content-api');

Helper.initForEnvByProcessVariable();

const activePrivateKey  = Helper.getTesterAccountPrivateKey();

const accountName = Helper.getTesterAccountName();

const janeAccoutName = Helper.getAccountNameTo();

const JEST_TIMEOUT = 30000;

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
}, JEST_TIMEOUT);

// @ts-ignore
async function changeMembers(multiSignatureAccount: string) {
  const expirationInDays = 1;

  const executorAccountName = accountName;


  const executorPrivateKey  = Helper.getTesterAccountPrivateKey();
  const permission = PermissionsDictionary.active();
  const permissionToAssign = PermissionsDictionary.social();

  const { proposalName: changeSocialMembersProposalName } = await MultiSignatureApi.createChangeMembersProposal(
    executorAccountName,
    executorPrivateKey,
    permission,
    executorAccountName,
    expirationInDays,
    multiSignatureAccount,
    permissionToAssign,
  );

  console.log(`ChangeSocialMembersProposalName name is: ${changeSocialMembersProposalName}`);

  await MultiSignatureApi.approveProposal(
    executorAccountName,
    executorPrivateKey,
    permission,
    executorAccountName,
    changeSocialMembersProposalName,
    permission,
  );

  const executeResponse = await MultiSignatureApi.executeProposal(
    executorAccountName,
    executorPrivateKey,
    permission,
    executorAccountName,
    changeSocialMembersProposalName,
    executorAccountName,
  );

  CommonChecker.expectNotEmpty(executeResponse);
}

it('should add new member with social permission and execute a trust', async () => {
  // const expirationInDays = 1;
  // @ts-ignore
  const multiSignatureAccountData = {
    // accountName: 'ih2jwtakzjft', // with active threshold 2
    accountName: 'tyvknaqf3het', // with propose and approve as social
  };

  // await changeMembers(multiSignatureAccountData.accountName);

  // await WalletApi.sendTokens(janeAccoutName, janeActivePrivateKey, multiSignatureAccountData.accountName, 100);

  // @ts-ignore
  const state =
    await BlockchainRegistry.getRawAccountData(multiSignatureAccountData.accountName);

  // await WalletApi.sendTokens(Helper.getCreatorAccountName(), Helper.getCreatorPrivateKey(), multiSignatureAccountData.accountName, 9);

  // @ts-ignore
  const multiSigStateBefore = await BlockchainRegistry.getAccountInfo(multiSignatureAccountData.accountName);
  // @ts-ignore
  const janeStateBefore     = await BlockchainRegistry.getAccountInfo(janeAccoutName);

  // no success in adding a proposal from the jane when jane is not in the members team
  const { proposalName } = await MultiSignatureApi.createTrustProposal(
    Helper.getAliceAccountName(),
    Helper.getAlicePrivateKey(),
    PermissionsDictionary.social(),
    Helper.getBobAccountName(),
    PermissionsDictionary.social(),
    multiSignatureAccountData.accountName,
    janeAccoutName,
    1,
  );

  // const proposalName = 'uff3q2gvw3q2';

  console.log(`Proposal name is: ${proposalName}`);

  await MultiSignatureApi.approveProposal(
    Helper.getBobAccountName(),
    Helper.getBobPrivateKey(),
    PermissionsDictionary.social(),
    Helper.getAliceAccountName(),
    proposalName,
    PermissionsDictionary.social(),
  );

  // @ts-ignore
  const response = await MultiSignatureApi.executeProposal(
    Helper.getAliceAccountName(),
    Helper.getAlicePrivateKey(),
    PermissionsDictionary.social(),
    Helper.getAliceAccountName(),
    proposalName,
    Helper.getAliceAccountName(),
  );

  // @ts-ignore
  const multiSigStateAfter = await BlockchainRegistry.getAccountInfo(multiSignatureAccountData.accountName);
  // @ts-ignore
  const janeStateAfter     = await BlockchainRegistry.getAccountInfo(janeAccoutName);

  CommonChecker.expectNotEmpty(response);
}, JEST_TIMEOUT * 1000);

export {};
