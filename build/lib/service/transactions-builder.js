"use strict";
const PermissionsDictionary = require('../dictionary/permissions-dictionary');
const PERMISSION_ACTIVE = PermissionsDictionary.active();
class TransactionsBuilder {
    /**
     *
     * @param {string} actorAccountName
     * @param {string} smartContractName
     * @param {string} actionName
     * @param {Object} data
     * @param {string} permission
     * @return Object
     */
    static getSingleUserAction(actorAccountName, smartContractName, actionName, data, permission = PERMISSION_ACTIVE) {
        const authorization = this._getSingleUserAuthorization(actorAccountName, permission);
        return {
            account: smartContractName,
            name: actionName,
            authorization,
            data,
        };
    }
    /**
     *
     * @param {string} actorAccountName
     * @param {string} permission
     * @return {{actor: *, permission: string}[]}
     * @private
     */
    static _getSingleUserAuthorization(actorAccountName, permission) {
        return [{
                permission,
                actor: actorAccountName,
            }];
    }
}
module.exports = TransactionsBuilder;
