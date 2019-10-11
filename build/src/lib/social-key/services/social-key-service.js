"use strict";
const SmartContractsDictionary = require("../../dictionary/smart-contracts-dictionary");
const TransactionsBuilder = require("../../service/transactions-builder");
const SmartContractsActionsDictionary = require("../../dictionary/smart-contracts-actions-dictionary");
const PermissionsDictionary = require("../../dictionary/permissions-dictionary");
class SocialKeyService {
    static getSocialPermissionForSocialActions(accountFrom, actorPermission = PermissionsDictionary.active()) {
        const smartContract = SmartContractsDictionary.uosActivity();
        const actionName = SmartContractsActionsDictionary.socialAction();
        return this.getSocialPermissionsForAction(accountFrom, smartContract, actionName, actorPermission);
    }
    static getSocialPermissionForProfileUpdating(accountFrom, actorPermission = PermissionsDictionary.active()) {
        const smartContract = SmartContractsDictionary.uosAccountInfo();
        const actionName = SmartContractsActionsDictionary.setProfile();
        return this.getSocialPermissionsForAction(accountFrom, smartContract, actionName, actorPermission);
    }
    static getSocialPermissionForEmissionClaim(accountFrom, actorPermission = PermissionsDictionary.active()) {
        const smartContract = SmartContractsDictionary.uosCalcs();
        const actionName = SmartContractsActionsDictionary.withdrawal();
        return SocialKeyService.getSocialPermissionsForAction(accountFrom, smartContract, actionName, actorPermission);
    }
    static getSocialPermissionForProposeApproveAndExecute(accountFrom, actorPermission) {
        const set = [
            SmartContractsActionsDictionary.proposeMultiSignature(),
            SmartContractsActionsDictionary.approveMultiSignature(),
            SmartContractsActionsDictionary.executeMultiSignature(),
        ];
        return set.map((action) => SocialKeyService.getSocialPermissionsForAction(accountFrom, SmartContractsDictionary.eosIoMultiSignature(), action, actorPermission));
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
    static getSocialPermissionsForAction(accountFrom, smartContract, actionName, actorPermission = PermissionsDictionary.active()) {
        const targetPermission = PermissionsDictionary.social();
        const authorization = TransactionsBuilder.getSingleUserAuthorization(accountFrom, actorPermission);
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
