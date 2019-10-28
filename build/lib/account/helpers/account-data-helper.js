"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const extractOnePermissionOrError = (accountData, name) => {
    const permission = accountData.permissions.find((item) => item.perm_name === name);
    if (!permission) {
        throw new TypeError(`Unable to find a permission: ${permission}`);
    }
    return permission;
};
exports.extractAccountsFromMultiSignaturePermission = (accountData, name) => {
    const permission = extractOnePermissionOrError(accountData, name);
    return permission.required_auth.accounts.map((item) => item.permission.actor);
};
