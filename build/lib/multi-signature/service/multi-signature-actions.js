"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AuthActionsFactory = require("../../permissions/service/auth-actions-factory");
const PermissionsDictionary = require("../../dictionary/permissions-dictionary");
class MultiSignatureActions {
    static getAuthorPermissionActions(multiSigAccountName, authorAccountName) {
        const ownerPermissionAction = AuthActionsFactory.addUserAccountsByUpdateAuthAction(multiSigAccountName, [authorAccountName], PermissionsDictionary.owner(), PermissionsDictionary.owner());
        const activePermissionAction = AuthActionsFactory.addUserAccountsByUpdateAuthAction(multiSigAccountName, [authorAccountName], PermissionsDictionary.active(), PermissionsDictionary.owner());
        return [
            ownerPermissionAction,
            activePermissionAction,
        ];
    }
    static getSocialPermissionAction(actorAccountName, accounts, actorPermission = null) {
        return AuthActionsFactory.addUserAccountsByUpdateAuthAction(actorAccountName, accounts, PermissionsDictionary.social(), actorPermission);
    }
}
exports.MultiSignatureActions = MultiSignatureActions;
