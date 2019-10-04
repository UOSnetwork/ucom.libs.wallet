import { Action } from 'eosjs/dist/eosjs-serialize';

import RegistrationApi = require('../../registration/api/registration-api');
import PermissionsDictionary = require('../../dictionary/permissions-dictionary');
import EosClient = require('../../common/client/eos-client');
import ActionsFactory = require('../../common/actions/actions-factory');
import SmartContractsDictionary = require('../../dictionary/smart-contracts-dictionary');
import SmartContractsActionsDictionary = require('../../dictionary/smart-contracts-actions-dictionary');
import TransactionsBuilder = require('../../service/transactions-builder');
import AccountNameService = require('../../common/services/account-name-service');
import SocialKeyApi = require('../../social-key/api/social-key-api');
import SocialTransactionsUserToUserFactory = require('../../social-transactions/services/social-transactions-user-to-user-factory');
import InteractionsDictionary = require('../../dictionary/interactions-dictionary');

import _ = require('lodash');
import moment = require('moment');
import TransactionSender = require('../../transaction-sender');

class MultiSignatureApi {
  public static async executeProposal(
    actorAccount: string,
    actorPrivateKey: string,
    actorPermission: string,
    proposerAccount: string,
    proposalName: string,
    executerName: string,
  ) {
    const action: Action = {
      account: SmartContractsDictionary.eosIoMultiSignature(),
      name:    SmartContractsActionsDictionary.executeMultiSignature(),
      authorization: TransactionsBuilder.getSingleUserAuthorization(actorAccount, actorPermission),
      data: {
        proposer:       proposerAccount,
        proposal_name:  proposalName,
        executer:       executerName,
      },
    };

    return EosClient.sendTransaction(actorPrivateKey, [action]);
  }

  public static async approveProposal(
    actor: string,
    authPrivateKey: string,
    authPermission: string,
    proposerAccount: string,
    proposalName: string,
    approvePermission: string,
  ) {
    const action: Action = {
      account: SmartContractsDictionary.eosIoMultiSignature(),
      name: SmartContractsActionsDictionary.approveMultiSignature(),
      authorization: [
        {
          actor,
          permission: authPermission,
        },
      ],
      data: {
        proposer: proposerAccount,
        proposal_name: proposalName,
        level: {
          actor,
          permission: approvePermission,
        },
      },
    };

    return EosClient.sendTransaction(authPrivateKey, [action]);
  }

  public static async createTrustProposal(
    whoPropose: string,
    proposePrivateKey: string,
    proposePermission: string,
    requestedActor: string,
    requestedPermission: string,
    trustFrom: string,
    trustTo: string,
    expirationInDays: number,
  ) {
    const proposalName = AccountNameService.createRandomAccountName();

    const trustAction = SocialTransactionsUserToUserFactory.getSingleSocialAction(
      trustFrom,
      trustTo,
      InteractionsDictionary.trust(),
      PermissionsDictionary.social(),
    );

    // @ts-ignore
    const seActions = await EosClient.serializeActionsByApi([trustAction]);

    const trustActionSerialized = _.cloneDeep(trustAction);
    trustActionSerialized.data = seActions[0].data;

    const trx = {
      // eslint-disable-next-line newline-per-chained-call
      expiration: moment().add(expirationInDays, 'days').utc().format().replace('Z', ''),
      ref_block_num: 0,
      ref_block_prefix: 0,
      max_net_usage_words: 0,
      max_cpu_usage_ms: 0,
      delay_sec: 0,
      context_free_actions: [],
      actions: [trustActionSerialized],
      transaction_extensions: [],
    };

    const authorization = TransactionsBuilder.getSingleUserAuthorization(whoPropose, proposePermission);

    const actions = [
      {
        account: SmartContractsDictionary.eosIoMultiSignature(),
        name: SmartContractsActionsDictionary.proposeMultiSignature(),
        authorization,
        data: {
          proposer: whoPropose,
          proposal_name: proposalName,
          requested: [
            {
              actor: requestedActor,
              permission: requestedPermission,
            },
            {
              actor: 'janejanejane',
              permission: requestedPermission,
            },
          ],
          trx,
        },
      },
    ];

    const transaction = await EosClient.sendTransaction(proposePrivateKey, actions);

    return {
      transaction,
      proposalName,
    };
  }

  public static async createChangeActiveMembersProposal(
    // @ts-ignore
    whoPropose: string, proposePrivateKey: string, proposePermission: string, proposeRequestedFrom: string, expirationInDays: number = 5,
    multiSignatureAccount: string,
  ) {
    const threshold = 2;

    // @ts-ignore
    const actionPermission = PermissionsDictionary.owner();
    // @ts-ignore
    const action = {
      account: SmartContractsDictionary.eosIo(),
      name: SmartContractsActionsDictionary.updateAuth(),
      authorization: [
        {
          actor: multiSignatureAccount,
          permission: PermissionsDictionary.owner(),
        },
      ],
      data: {
        account: multiSignatureAccount,
        permission: PermissionsDictionary.active(),
        parent: PermissionsDictionary.owner(),
        auth: {
          threshold,
          keys: [],
          accounts: [
            {
              permission: {
                actor: 'vladvladvlad',
                permission: PermissionsDictionary.active(),
              },
              weight: 1,
            },
            {
              permission: {
                actor: 'janejanejane',
                permission: PermissionsDictionary.active(),
              },
              weight: 1,
            },
          ],
          waits: [],
        },
      },
    };


    const actions = [
      {
        account: 'eosio',
        name: 'updateauth',
        authorization: [
          {
            actor: 'p4htopmkqua3',
            permission: 'owner',
          },
        ],
        data: {
          account: 'p4htopmkqua3',
          permission: 'active',
          parent: 'owner',
          auth: {
            threshold: 1,
            keys: [],
            accounts: [{
              permission: {
                actor: 'vladvladvlad',
                permission: 'active',
              },
              weight: 1,
            },
            {
              permission: {
                actor: 'rokkyrokkyro',
                permission: 'active',
              },
              weight: 1,
            },
            ],
            waits: [],
          },
        },
      },
    ];

    return EosClient.sendTransaction(proposePrivateKey, actions);

    // return this.createProposalWithOneRequestedAndOneAction(
    //   whoPropose,
    //   proposePrivateKey,
    //   proposePermission,
    //   proposeRequestedFrom,
    //   expirationInDays,
    //   action,
    //   actionPermission,
    // );
  }

  public static async createTransferProposal(
    whoPropose: string,
    proposePrivateKey: string,
    proposePermission: string,
    proposeRequestedFrom: string,
    accountFrom: string,
    accountNameTo: string,
    expirationInDays: number = 5,
  ) {
    const stringAmount = TransactionSender.getUosAmountAsString(1, 'UOS');
    const action = TransactionSender.getSendTokensAction(accountFrom, accountNameTo, stringAmount, '');

    return this.createProposalWithOneRequestedAndOneAction(
      whoPropose,
      proposePrivateKey,
      proposePermission,
      proposeRequestedFrom,
      expirationInDays,
      action,
      PermissionsDictionary.active(),
    );
  }

  private static async createProposalWithOneRequestedAndOneAction(
    whoPropose: string,
    proposePrivateKey: string,
    proposePermission: string,
    proposeRequestedFrom: string,
    expirationInDays: number = 5,
    action: Action,
    actionPermission: string,
  ) {
    const proposalName = AccountNameService.createRandomAccountName();

    const seActions = await EosClient.serializeActionsByApi([action]);

    const serializedAction = _.cloneDeep(action);
    serializedAction.data = seActions[0].data;

    const trx = {
      // eslint-disable-next-line newline-per-chained-call
      expiration: moment().add(expirationInDays, 'days').utc().format().replace('Z', ''),
      ref_block_num: 0,
      ref_block_prefix: 0,
      max_net_usage_words: 0,
      max_cpu_usage_ms: 0,
      delay_sec: 0,
      context_free_actions: [],
      actions: [
        serializedAction,
      ],
      transaction_extensions: [],
    };

    const authorization = TransactionsBuilder.getSingleUserAuthorization(whoPropose, proposePermission);

    const actions = [
      {
        account: SmartContractsDictionary.eosIoMultiSignature(),
        name: SmartContractsActionsDictionary.proposeMultiSignature(),
        authorization,
        data: {
          proposer: whoPropose,
          proposal_name: proposalName,
          requested: [
            {
              actor: proposeRequestedFrom,
              permission: actionPermission,
            },
          ],
          trx,
        },
      },
    ];

    const transaction = await EosClient.sendTransaction(proposePrivateKey, actions);

    return {
      transaction,
      proposalName,
    };
  }

  public static async createMultiSignatureAccount(
    communityAuthorAccountName: string,
    communityAuthorActivePrivateKey: string,

    multiSignatureAccountName: string,
    multiSignatureOwnerPrivateKey: string,
    multiSignatureOwnerPublicKey: string,
    multiSignatureActivePublicKey: string,
  ) {
    await RegistrationApi.createNewAccountInBlockchain(
      communityAuthorAccountName,
      communityAuthorActivePrivateKey,
      multiSignatureAccountName,
      multiSignatureOwnerPublicKey,
      multiSignatureActivePublicKey,
    );

    const socialPermissionAction = ActionsFactory.addOneUserAccountByUpdateAuthAction(
      multiSignatureAccountName,
      PermissionsDictionary.owner(),
      communityAuthorAccountName,
      PermissionsDictionary.social(),
      PermissionsDictionary.active(),
    );

    const activePermissionAction = ActionsFactory.addOneUserAccountByUpdateAuthAction(
      multiSignatureAccountName,
      PermissionsDictionary.owner(),
      communityAuthorAccountName,
      PermissionsDictionary.active(),
      PermissionsDictionary.owner(),
    );

    // @ts-ignore
    const ownerPermissionAction = ActionsFactory.addOneUserAccountByUpdateAuthAction(
      multiSignatureAccountName,
      PermissionsDictionary.owner(),
      communityAuthorAccountName,
      PermissionsDictionary.owner(),
      '',
    );

    const actions: Action[] = [
      socialPermissionAction,
      ...SocialKeyApi.getAssignSocialPermissionsActions(multiSignatureAccountName, PermissionsDictionary.owner()),

      activePermissionAction,
      ownerPermissionAction,
    ];

    return EosClient.sendTransaction(multiSignatureOwnerPrivateKey, actions);
  }
}

export = MultiSignatureApi;
