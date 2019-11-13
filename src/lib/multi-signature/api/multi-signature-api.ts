import { Action } from 'eosjs/dist/eosjs-serialize';
import { MultiSignatureActions } from '../service/multi-signature-actions';
import { IStringToAny, ITransactionPushResponse } from '../../common/interfaces/common-interfaces';
import { MultiSignatureValidator } from '../validators/multi-signature-validator';
import { UOS } from '../../dictionary/currency-dictionary';
import {
  extractAccountsFromMultiSignaturePermission,
} from '../../account/helpers/account-data-helper';
import { symmetricDifference } from '../../helpers/array-helper';
import { MULTI_SIGNATURE_EXPIRATION_IN_DAYS } from '../../dictionary/transaction-dictionary';

import RegistrationApi = require('../../registration/api/registration-api');
import PermissionsDictionary = require('../../dictionary/permissions-dictionary');
import EosClient = require('../../common/client/eos-client');
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
import ContentTransactionsCommonFactory = require('../../content/service/content-transactions-common-factory');
import BlockchainRegistry = require('../../blockchain-registry');
import MultiSignatureWorkflow = require('../service/multi-signature-workflow');
import ContentApi = require('../../content/api/content-api');

class MultiSignatureApi {
  public static async createMultiSignatureAccount(
    authorAccountName: string,
    authorActivePrivateKey: string,
    multiSignatureAccountName: string,
    multiSignatureOwnerPrivateKey: string,
    multiSignatureOwnerPublicKey: string,
    multiSignatureActivePublicKey: string,
    profile: IStringToAny = {},
    addSocialMembers: string[] = [],
  ) {
    await MultiSignatureValidator.validateCreation(authorAccountName, multiSignatureAccountName);

    await RegistrationApi.createNewAccountInBlockchain(
      authorAccountName,
      authorActivePrivateKey,
      multiSignatureAccountName,
      multiSignatureOwnerPublicKey,
      multiSignatureActivePublicKey,
      true,
    );

    const authorPermissionActions = MultiSignatureActions.getAuthorPermissionActions(
      multiSignatureAccountName,
      authorAccountName,

    );

    const socialAccounts = [
      authorAccountName,
      ...addSocialMembers,
    ];

    const socialPermissionAction = MultiSignatureActions.getSocialPermissionAction(
      multiSignatureAccountName,
      socialAccounts,
      PermissionsDictionary.owner(),
    );

    const actions: Action[] = [
      ...SocialKeyApi.getAssignSocialPermissionsActions(multiSignatureAccountName, PermissionsDictionary.owner()),

      ...authorPermissionActions,
      socialPermissionAction,

      ContentTransactionsCommonFactory.getSetProfileAction(multiSignatureAccountName, profile, PermissionsDictionary.owner()),
    ];

    return EosClient.sendTransaction(multiSignatureOwnerPrivateKey, actions);
  }

  public static async areSocialMembersChanged(
    multiSignatureAccountName: string,
    addSocialMembers: string[],
  ): Promise<boolean> {
    const accountData = await BlockchainRegistry.getRawAccountData(multiSignatureAccountName);

    const socialMembers = extractAccountsFromMultiSignaturePermission(accountData, PermissionsDictionary.social());

    const difference = symmetricDifference<string>(socialMembers, addSocialMembers);

    return difference.length > 0;
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

  public static async updateProfile(
    actorAccountName: string,
    actorPrivateKey: string,
    proposePermission: string,
    multiSignatureAccount: string,
    profile: IStringToAny,
  ) {
    await ContentApi.isEnoughRamOrException(multiSignatureAccount, profile);
    const actions: Action[] = [
      ContentTransactionsCommonFactory.getSetProfileAction(multiSignatureAccount, profile, proposePermission),
    ];

    return this.proposeApproveAndExecuteByProposer(actorAccountName, actorPrivateKey, proposePermission, actions);
  }

  public static async createAndExecuteProfileUpdateAndSocialMembers(
    accountName: string,
    activePrivateKey: string,
    multiSignatureAccount: string,
    profile: IStringToAny,
    socialMembers: string[],
  ) {
    const permission = PermissionsDictionary.active();

    await ContentApi.isEnoughRamOrException(multiSignatureAccount, profile);

    const actions: Action[] = [
      ContentTransactionsCommonFactory.getSetProfileAction(multiSignatureAccount, profile, permission),

      MultiSignatureActions.getSocialPermissionAction(multiSignatureAccount, socialMembers, permission),
      SocialTransactionsCommonFactory.getNonceAction(multiSignatureAccount, permission),
    ];

    return this.proposeApproveAndExecuteByProposer(accountName, activePrivateKey, permission, actions);
  }

  public static async changeSocialMembers(
    accountName: string, activePrivateKey: string, multiSignatureAccount: string, socialMembers: string[],
  ) {
    const permission = PermissionsDictionary.active();

    const actions: Action[] = [
      MultiSignatureActions.getSocialPermissionAction(multiSignatureAccount, socialMembers, permission),
      SocialTransactionsCommonFactory.getNonceAction(multiSignatureAccount, permission),
    ];

    return this.proposeApproveAndExecuteByProposer(accountName, activePrivateKey, permission, actions);
  }

  public static async createTransferProposal(
    whoPropose: string,
    proposePrivateKey: string,
    proposePermission: string,
    proposeRequestedFrom: string,
    accountFrom: string,
    accountNameTo: string,
  ) {
    const stringAmount = TransactionSender.getUosAmountAsString(1, UOS);
    const action = TransactionSender.getSendTokensAction(accountFrom, accountNameTo, stringAmount, '');

    return this.pushProposal(
      whoPropose,
      proposePrivateKey,
      proposePermission,
      [proposeRequestedFrom],
      [action],
      PermissionsDictionary.active(),
    );
  }

  public static async proposeApproveAndExecuteByProposer(
    account: string,
    privateKey: string,
    permission: string,
    actionsOfMultiSignature: Action[],
  ): Promise<{
    proposalName: string,
    proposeResponse: ITransactionPushResponse,
    approveResponse: ITransactionPushResponse,
    executeResponse: ITransactionPushResponse,
  }> {
    if (!Array.isArray(actionsOfMultiSignature)) {
      throw new TypeError('actionsOfMultiSignature parameter type must be an array');
    }

    const { proposalName, transaction: proposeResponse } = await this.pushProposal(
      account,
      privateKey,
      permission,
      [account],
      actionsOfMultiSignature,
      permission,
    );

    const approveResponse =
      await MultiSignatureWorkflow.approveProposal(account, privateKey, permission, account, proposalName, permission);
    const executeResponse =
      await MultiSignatureWorkflow.executeProposal(account, privateKey, permission, account, proposalName, account);

    return {
      proposalName,
      proposeResponse,
      approveResponse,
      executeResponse,
    };
  }

  private static async pushProposal(
    whoPropose: string,
    proposePrivateKey: string,
    proposePermission: string,
    accountsToApprove: string[],
    givenActions: Action[],
    actionPermission: string,
  ) {
    const proposalName = AccountNameService.createRandomAccountName();

    const trxActions = _.cloneDeep(givenActions);

    const seActions = await EosClient.serializeActionsByApi(givenActions);

    for (const [i, element] of trxActions.entries()) {
      element.data = seActions[i].data;
    }

    const trx = {
      // eslint-disable-next-line newline-per-chained-call
      expiration: moment().add(MULTI_SIGNATURE_EXPIRATION_IN_DAYS, 'days').utc().format().replace('Z', ''),
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

    const requested = this.getRequestedFromAccountNames(accountsToApprove, actionPermission);

    const actions = [
      {
        account: SmartContractsDictionary.eosIoMultiSignature(),
        name: SmartContractsActionsDictionary.proposeMultiSignature(),
        authorization,
        data: {
          proposer: whoPropose,
          proposal_name: proposalName,
          requested,
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

  private static getRequestedFromAccountNames(
    accountNames: string[], permission: string,
  ): { actor: string; permission: string }[] {
    return accountNames.map((actor: string) => ({ actor, permission }));
  }
}

export = MultiSignatureApi;
