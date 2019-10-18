import { Action } from 'eosjs/dist/eosjs-serialize';
import { ITransactionPushResponse } from '../../common/interfaces/common-interfaces';

import SmartContractsDictionary = require('../../dictionary/smart-contracts-dictionary');
import SmartContractsActionsDictionary = require('../../dictionary/smart-contracts-actions-dictionary');
import TransactionsBuilder = require('../../service/transactions-builder');
import EosClient = require('../../common/client/eos-client');

const smartContract = SmartContractsDictionary.eosIoMultiSignature();

class MultiSignatureWorkflow {
  public static async executeProposal(
    actorAccount: string,
    actorPrivateKey: string,
    actorPermission: string,
    proposerAccount: string,
    proposalName: string,
    executerName: string,
  ): Promise<ITransactionPushResponse> {
    const action: Action = {
      account: smartContract,
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
  ): Promise<ITransactionPushResponse> {
    const action: Action = {
      account: smartContract,
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
}

export = MultiSignatureWorkflow;
