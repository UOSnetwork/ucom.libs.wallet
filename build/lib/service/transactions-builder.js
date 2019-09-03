"use strict";
const PermissionsDictionary = require("../dictionary/permissions-dictionary");
class TransactionsBuilder {
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
        return [{
                permission,
                actor: actorAccountName,
            }];
    }
}
module.exports = TransactionsBuilder;
