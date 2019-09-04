"use strict";
const SmartContractsDictionary = require("../../dictionary/smart-contracts-dictionary");
const TransactionsBuilder = require("../../service/transactions-builder");
const SmartContractsActionsDictionary = require("../../dictionary/smart-contracts-actions-dictionary");
const PermissionsDictionary = require("../../dictionary/permissions-dictionary");
class SocialKeyService {
    static getSocialPermissionForSocialActions(accountFrom) {
        const smartContract = SmartContractsDictionary.uosActivity();
        const actionName = SmartContractsActionsDictionary.socialAction();
        return this.getSocialPermissionsForAction(accountFrom, smartContract, actionName);
    }
    static getSocialPermissionForProfileUpdating(accountFrom) {
        const smartContract = SmartContractsDictionary.uosAccountInfo();
        const actionName = SmartContractsActionsDictionary.setProfile();
        return this.getSocialPermissionsForAction(accountFrom, smartContract, actionName);
    }
    static getSocialPermissionForEmissionClaim(accountFrom) {
        const smartContract = SmartContractsDictionary.uosCalcs();
        const actionName = SmartContractsActionsDictionary.withdrawal();
        return SocialKeyService.getSocialPermissionsForAction(accountFrom, smartContract, actionName);
    }
    static getBindSocialKeyAction(accountName, publicSocialKey) {
        return {
            account: SmartContractsDictionary.eosIo(),
            name: SmartContractsActionsDictionary.updateAuth(),
            authorization: TransactionsBuilder.getSingleUserAuthorization(accountName, PermissionsDictionary.active()),
            data: {
                account: accountName,
                permission: PermissionsDictionary.social(),
                parent: PermissionsDictionary.active(),
                auth: {
                    threshold: 1,
                    keys: [
                        {
                            key: publicSocialKey,
                            weight: 1,
                        },
                    ],
                    accounts: [],
                    waits: [],
                },
            },
        };
    }
    static getSocialPermissionsForAction(accountFrom, smartContract, actionName) {
        const parentPermission = PermissionsDictionary.active();
        const targetPermission = PermissionsDictionary.social();
        const authorization = TransactionsBuilder.getSingleUserAuthorization(accountFrom, parentPermission);
        return {
            account: SmartContractsDictionary.eosIo(),
            name: SmartContractsActionsDictionary.linkAuth(),
            authorization,
            data: {
                account: accountFrom,
                code: smartContract,
                type: actionName,
                requirement: targetPermission,
            },
        };
    }
}
module.exports = SocialKeyService;
