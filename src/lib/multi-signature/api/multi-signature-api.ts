import { Action } from 'eosjs/dist/eosjs-serialize';

import RegistrationApi = require('../../registration/api/registration-api');
import PermissionsDictionary = require('../../dictionary/permissions-dictionary');
import EosClient = require('../../common/client/eos-client');
import SocialKeyApi = require('../../social-key/api/social-key-api');
import ActionsFactory = require('../../common/actions/actions-factory');
import SmartContractsDictionary = require('../../dictionary/smart-contracts-dictionary');
import SmartContractsActionsDictionary = require('../../dictionary/smart-contracts-actions-dictionary');
import TransactionsBuilder = require('../../service/transactions-builder');
import AccountNameService = require('../../common/services/account-name-service');
import SocialApi = require('../../social-transactions/api/social-api');

class MultiSignatureApi {
  public static async createTrustProposal(
    accountFrom: string,
    accountTo: string,
    privateKey: string,
    permission: string,
  ) {
    const authorization = TransactionsBuilder.getSingleUserAuthorization(accountFrom, PermissionsDictionary.social());

    const proposalName = AccountNameService.createRandomAccountName();
    const transactionParts = await SocialApi.getTrustUserSignedTransaction(accountFrom, privateKey, accountTo, permission);
    // @ts-ignore
    const trx = await EosClient.deserializeActionsByApi(privateKey, transactionParts);

    const actions = [
      {
        account: SmartContractsDictionary.eosIoMultiSignature(),
        name: SmartContractsActionsDictionary.proposeMultiSignature(),
        authorization,
        data: {
          proposer: accountFrom,
          proposal_name: proposalName,
          requested: [
            {
              actor: accountFrom,
              permission: PermissionsDictionary.social(),
            },
          ],
          trx,
        },
      },
    ];

    return EosClient.sendTransaction(privateKey, actions);
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
