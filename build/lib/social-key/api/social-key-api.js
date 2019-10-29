"use strict";
const EosClient = require("../../common/client/eos-client");
const EosCryptoService = require("../../common/services/eos-crypto-service");
const BlockchainRegistry = require("../../blockchain-registry");
const PermissionsDictionary = require("../../dictionary/permissions-dictionary");
const SocialKeyService = require("../services/social-key-service");
class SocialKeyApi {
    static generateSocialKeyFromActivePrivateKey(activePrivateKey) {
        return EosCryptoService.getKeyPartsFromParentPrivateKey(activePrivateKey);
    }
    static async getAccountCurrentSocialKey(accountName) {
        const state = await BlockchainRegistry.getRawAccountData(accountName);
        for (const permission of state.permissions) {
            if (!permission.perm_name) {
                throw new TypeError(`Malformed permission: ${permission}`);
            }
            if (permission.perm_name !== PermissionsDictionary.social()) {
                continue;
            }
            if (!permission.required_auth
                || !permission.required_auth.keys
                || permission.required_auth.keys.length !== 1
                || !permission.required_auth.keys[0]
                || !permission.required_auth.keys[0].key) {
                throw new TypeError(`Malformed permission: ${permission}`);
            }
            return permission.required_auth.keys[0].key;
        }
        return null;
    }
    static async bindSocialKeyWithSocialPermissions(accountName, activePrivateKey, socialPublicKey) {
        const permission = PermissionsDictionary.active();
        // #task - simplified check - check only first action of transaction - social key binding
        await this.socialKeyNotExistOrError(accountName);
        const actions = [
            SocialKeyService.getBindSocialKeyAction(accountName, socialPublicKey),
            SocialKeyService.getSocialPermissionForSocialActions(accountName, permission),
            SocialKeyService.getSocialPermissionForProfileUpdating(accountName, permission),
            SocialKeyService.getSocialPermissionForEmissionClaim(accountName, permission),
            ...SocialKeyService.getSocialPermissionForProposeApproveAndExecute(accountName, permission),
        ];
        return EosClient.sendTransaction(activePrivateKey, actions);
    }
    static getAssignSocialPermissionsActions(accountName, actorPermission = PermissionsDictionary.active()) {
        return [
            SocialKeyService.getSocialPermissionForSocialActions(accountName, actorPermission),
            SocialKeyService.getSocialPermissionForProfileUpdating(accountName, actorPermission),
            SocialKeyService.getSocialPermissionForEmissionClaim(accountName, actorPermission),
            ...SocialKeyService.getSocialPermissionForProposeApproveAndExecute(accountName, actorPermission),
        ];
    }
    /**
     * @deprecated
     * @see bindSocialKeyWithSocialPermissions
     */
    static async bindSocialKeyWithoutEmissionAndProfile(accountName, activePrivateKey, socialPublicKey) {
        // #task - simplified check - check only first action of transaction - social key binding
        await this.socialKeyNotExistOrError(accountName);
        const actions = [
            SocialKeyService.getBindSocialKeyAction(accountName, socialPublicKey),
            SocialKeyService.getSocialPermissionForSocialActions(accountName, PermissionsDictionary.active()),
        ];
        return EosClient.sendTransaction(activePrivateKey, actions);
    }
    static async addSocialPermissionsToEmissionAndProfile(accountName, activePrivateKey) {
        // #task - simplified check - check only first action of transaction - social key binding
        await this.socialKeyExistOrError(accountName);
        const actions = [
            SocialKeyService.getSocialPermissionForProfileUpdating(accountName),
            SocialKeyService.getSocialPermissionForEmissionClaim(accountName),
        ];
        let result;
        try {
            result = await EosClient.sendTransaction(activePrivateKey, actions);
        }
        catch (error) {
            if (error.json && error.json.error && error.json.error.name === 'action_validate_exception') {
                // suppress this type of error = permissions already exist
                return null;
            }
            throw error;
        }
        return result;
    }
    static async addSocialPermissionsToProposeApproveAndExecute(accountName, activePrivateKey) {
        // #task - simplified check - check only first action of transaction - social key binding
        await this.socialKeyExistOrError(accountName);
        const actions = SocialKeyService.getSocialPermissionForProposeApproveAndExecute(accountName, PermissionsDictionary.active());
        let result;
        try {
            result = await EosClient.sendTransaction(activePrivateKey, actions);
        }
        catch (error) {
            if (error.json && error.json.error && error.json.error.name === 'action_validate_exception') {
                // suppress this type of error = permissions already exist
                return null;
            }
            throw error;
        }
        return result;
    }
    static async socialKeyNotExistOrError(accountName) {
        const currentSocialKey = await this.getAccountCurrentSocialKey(accountName);
        if (currentSocialKey) {
            throw new TypeError(`A social key already exist: ${currentSocialKey}`);
        }
    }
    static async socialKeyExistOrError(accountName) {
        const currentSocialKey = await this.getAccountCurrentSocialKey(accountName);
        if (!currentSocialKey) {
            throw new TypeError('A social key must exist before social permission binding');
        }
    }
}
module.exports = SocialKeyApi;
