"use strict";
const SmartContractsDictionary = require("../../dictionary/smart-contracts-dictionary");
const TransactionsBuilder = require("../../service/transactions-builder");
const SmartContractsActionsDictionary = require("../../dictionary/smart-contracts-actions-dictionary");
const PermissionsDictionary = require("../../dictionary/permissions-dictionary");
class SocialKeyService {
    static addSocialKeyPermissionAction(accountFrom) {
        return {
            account: SmartContractsDictionary.eosIo(),
            name: SmartContractsActionsDictionary.linkAuth(),
            authorization: TransactionsBuilder.getSingleUserAuthorization(accountFrom, PermissionsDictionary.active()),
            data: {
                account: accountFrom,
                code: SmartContractsDictionary.uosActivity(),
                type: SmartContractsActionsDictionary.socialAction(),
                requirement: PermissionsDictionary.social(),
            },
        };
    }
    static bindSocialKeyAction(accountName, publicSocialKey) {
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
