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
import SocialTransactionsCommonFactory = require('../../social-transactions/services/social-transactions-common-factory');
import Helper = require('../../../../tests/helpers/helper');

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

  public static async createChangeMembersProposal(
    whoPropose: string, proposePrivateKey: string, proposePermission: string, proposeRequestedFrom: string, expirationInDays: number = 1,
    multiSignatureAccount: string, permissionToAssign: string,
  ) {
    const threshold = 1;
    const actionPermission = PermissionsDictionary.active();
    const action = {
      account: SmartContractsDictionary.eosIo(),
      name: SmartContractsActionsDictionary.updateAuth(),
      authorization: [
        {
          actor: multiSignatureAccount,
          permission: PermissionsDictionary.active(),
        },
      ],
      data: {
        account: multiSignatureAccount,
        permission: permissionToAssign,
        parent: proposePermission,
        auth: {
          threshold,
          keys: [],
          accounts: [
            {
              permission: {
                actor: Helper.getBobAccountName(),
                permission: permissionToAssign,
              },
              weight: 1,
            },
            {
              permission: {
                actor: Helper.getTesterAccountName(),
                permission: permissionToAssign,
              },
              weight: 1,
            },
          ],
          waits: [],
        },
      },
    };

    return this.createProposalWithOneRequestedAndOneAction(
      whoPropose,
      proposePrivateKey,
      proposePermission,
      proposeRequestedFrom,
      expirationInDays,
      action,
      actionPermission,
      SocialTransactionsCommonFactory.getNonceAction(whoPropose, actionPermission),
    );
  }

  public static async createTransferProposal(
    whoPropose: string,
    proposePrivateKey: string,
    proposePermission: string,
    proposeRequestedFrom: string,
    accountFrom: string,
    accountNameTo: string,
    expirationInDays: number = 1,
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
    nonceAction: Action | null = null,
  ) {
    const proposalName = AccountNameService.createRandomAccountName();

    const seActions = await EosClient.serializeActionsByApi([action]);

    const serializedAction = _.cloneDeep(action);
    serializedAction.data = seActions[0].data;

    const trxActions: Action[] = [
      serializedAction,
    ];

    // #task - dedicated method
    if (nonceAction) {
      const seActionsNonce = await EosClient.serializeActionsByApi([nonceAction]);

      const serializedActionNonce = _.cloneDeep(nonceAction);
      serializedActionNonce.data = seActionsNonce[0].data;
      trxActions.push(serializedActionNonce);
    }

    const trx = {
      // eslint-disable-next-line newline-per-chained-call
      expiration: moment().add(expirationInDays, 'days').utc().format().replace('Z', ''),
      ref_block_num: 0,
      ref_block_prefix: 0,
      max_net_usage_words: 0,
      max_cpu_usage_ms: 0,
      delay_sec: 0,
      context_free_actions: [],
      actions: trxActions,
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
