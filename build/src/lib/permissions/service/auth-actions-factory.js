"use strict";
const SmartContractsDictionary = require("../../dictionary/smart-contracts-dictionary");
const SmartContractsActionsDictionary = require("../../dictionary/smart-contracts-actions-dictionary");
const TransactionsBuilder = require("../../service/transactions-builder");
const PermissionsDictionary = require("../../dictionary/permissions-dictionary");
const ConverterHelper = require("../../helpers/converter-helper");
class AuthActionsFactory {
    static addUserAccountsByUpdateAuthAction(actor, givenAccounts, assignPermission, actorPermission = null) {
        const parentPermission = PermissionsDictionary.getParent(assignPermission);
        const weight = 1;
        const threshold = 1;
        const accounts = ConverterHelper.getUniqueAccountNamesSortedByUInt64(givenAccounts);
        const accountsWithPermissions = [];
        for (const account of accounts) {
            accountsWithPermissions.push(this.getOneAccountPermission(account, assignPermission, weight));
        }
        const smartContract = SmartContractsDictionary.eosIo();
        const action = SmartContractsActionsDictionary.updateAuth();
        const data = {
            account: actor,
            permission: assignPermission,
            parent: parentPermission,
            auth: {
                threshold,
                accounts: accountsWithPermissions,
                keys: [],
                waits: [],
            },
        };
        return TransactionsBuilder.getSingleUserAction(actor, smartContract, action, data, actorPermission || parentPermission);
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
module.exports = AuthActionsFactory;
