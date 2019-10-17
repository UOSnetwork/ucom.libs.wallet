"use strict";
const PermissionsDictionary = require("../dictionary/permissions-dictionary");
const SmartContractsDictionary = require("../dictionary/smart-contracts-dictionary");
const SmartContractsActionsDictionary = require("../dictionary/smart-contracts-actions-dictionary");
class TransactionsBuilder {
    static getSingleSocialUserAction(actorAccountName, data, permission = PermissionsDictionary.social()) {
        const smartContract = SmartContractsDictionary.uosActivity();
        const actionName = SmartContractsActionsDictionary.socialAction();
        return this.getSingleUserAction(actorAccountName, smartContract, actionName, data, permission);
    }
    static getSingleUserAction(actorAccountName, smartContractName, actionName, data, permission = PermissionsDictionary.active()) {
        const authorization = this.getSingleUserAuthorization(actorAccountName, permission);
        return {
            account: smartContractName,
            name: actionName,
            authorization,
            data,
        };
    }
    static getSingleUserAuthorization(actorAccountName, permission) {
        return [{ permission, actor: actorAccountName }];
    }
}
module.exports = TransactionsBuilder;
