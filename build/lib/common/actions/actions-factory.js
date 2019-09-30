"use strict";
const SmartContractsDictionary = require("../../dictionary/smart-contracts-dictionary");
const SmartContractsActionsDictionary = require("../../dictionary/smart-contracts-actions-dictionary");
const TransactionsBuilder = require("../../service/transactions-builder");
class ActionsFactory {
    static addOneUserAccountByUpdateAuthAction(actor, permissionToAct, assignToAccount, permissionToAssign, parentPermission, threshold = 1, weight = 1) {
        const authorization = TransactionsBuilder.getSingleUserAuthorization(actor, permissionToAct);
        const accounts = [this.getOneAccountPermission(assignToAccount, permissionToAssign, weight)];
        return {
            account: SmartContractsDictionary.eosIo(),
            name: SmartContractsActionsDictionary.updateAuth(),
            authorization,
            data: {
                account: actor,
                permission: permissionToAssign,
                parent: parentPermission,
                auth: {
                    threshold,
                    keys: [],
                    accounts,
                    waits: [],
                },
            },
        };
    }
    static getOneAccountPermission(actor, permission, weight) {
        return {
            permission: {
                actor,
                permission,
            },
            weight,
        };
    }
}
module.exports = ActionsFactory;
