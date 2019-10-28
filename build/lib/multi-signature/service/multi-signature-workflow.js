"use strict";
const SmartContractsDictionary = require("../../dictionary/smart-contracts-dictionary");
const SmartContractsActionsDictionary = require("../../dictionary/smart-contracts-actions-dictionary");
const TransactionsBuilder = require("../../service/transactions-builder");
const EosClient = require("../../common/client/eos-client");
const smartContract = SmartContractsDictionary.eosIoMultiSignature();
class MultiSignatureWorkflow {
    static async executeProposal(actorAccount, actorPrivateKey, actorPermission, proposerAccount, proposalName, executerName) {
        const action = {
            account: smartContract,
            name: SmartContractsActionsDictionary.executeMultiSignature(),
            authorization: TransactionsBuilder.getSingleUserAuthorization(actorAccount, actorPermission),
            data: {
                proposer: proposerAccount,
                proposal_name: proposalName,
                executer: executerName,
            },
        };
        return EosClient.sendTransaction(actorPrivateKey, [action]);
    }
    static async approveProposal(actor, authPrivateKey, authPermission, proposerAccount, proposalName, approvePermission) {
        const action = {
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
module.exports = MultiSignatureWorkflow;
