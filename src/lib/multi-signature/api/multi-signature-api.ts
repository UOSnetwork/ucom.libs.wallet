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
  public static async createTrustProposal(
    whoPropose: string,
    proposePrivateKey: string,
    proposePermission: string,
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
              actor: trustFrom,
              permission: PermissionsDictionary.social(),
            },
          ],
          trx,
        },
      },
    ];

    return EosClient.sendTransaction(proposePrivateKey, actions);
  }

  public static async createTransferProposal(
    whoPropose: string,
    proposePrivateKey: string,
    proposePermission: string,
    accountFrom: string,
    accountNameTo: string,
    expirationInDays: number = 5,
  ) {
    const proposalName = AccountNameService.createRandomAccountName();

    const stringAmount = TransactionSender.getUosAmountAsString(1, 'UOS');
    const action = TransactionSender.getSendTokensAction(accountFrom, accountNameTo, stringAmount, '');

    const seActions = await EosClient.serializeActionsByApi([action]);

    const trustActionSerialized = _.cloneDeep(action);
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
              actor: accountFrom,
              permission: PermissionsDictionary.active(),
            },
          ],
          trx,
        },
      },
    ];

    return EosClient.sendTransaction(proposePrivateKey, actions);
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
