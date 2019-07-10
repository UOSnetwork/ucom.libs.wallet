"use strict";
const PermissionsDictionary = require("../../dictionary/permissions-dictionary");
const ContentTransactionsCommonFactory = require("../service/content-transactions-common-factory");
const EosClient = require("../../common/client/eos-client");
const SmartContractsDictionary = require("../../dictionary/smart-contracts-dictionary");
const WalletApi = require("../../wallet/api/wallet-api");
class ContentApi {
    static async createProfileAfterRegistration(accountNameFrom, privateKey, isTrackingAllowed, userCreatedAt, permission = PermissionsDictionary.active()) {
        const profile = {
            account_name: accountNameFrom,
            is_tracking_allowed: isTrackingAllowed,
            profile_updated_at: userCreatedAt,
        };
        return ContentApi.updateProfile(accountNameFrom, privateKey, profile, permission);
    }
    static async updateProfile(accountNameFrom, privateKey, profileJsonObject, permission = PermissionsDictionary.active()) {
        await ContentApi.isEnoughRamOrException(accountNameFrom, profileJsonObject);
        return ContentTransactionsCommonFactory.getSendProfileTransaction(accountNameFrom, privateKey, profileJsonObject, permission);
    }
    static async getOneAccountProfileFromSmartContractTable(accountName) {
        const data = await EosClient.getJsonTableRows(SmartContractsDictionary.uosAccountInfo(), accountName, SmartContractsDictionary.accountProfileTableName(), 1);
        if (data.length === 0) {
            return null;
        }
        if (data.length !== 1) {
            throw new TypeError(`getOneAccountProfileFromSmartContractTable returns more than 1 profile data for ${accountName}`);
        }
        return data[0];
    }
    static async isEnoughRamOrException(accountNameFrom, profileJsonObject) {
        const newProfileLength = JSON.stringify(profileJsonObject).length;
        const currentProfile = await ContentApi.getOneAccountProfileFromSmartContractTable(accountNameFrom);
        let currentProfileLength = 0;
        if (currentProfile) {
            currentProfileLength = JSON.stringify(currentProfile.profile_json).length;
        }
        const requiredRamInBytes = newProfileLength - currentProfileLength;
        if (requiredRamInBytes <= 0) {
            // RAM will be decreased
            return;
        }
        const currentState = await WalletApi.getAccountState(accountNameFrom);
        const { ram } = currentState.resources;
        const freeRamInBytes = ram.free * 1024;
        if (requiredRamInBytes > freeRamInBytes) {
            throw new Error(`
        Account ${accountNameFrom} has insufficient RAM. 
        Free RAM: ${ram.free} bytes, required: ${requiredRamInBytes} bytes. Overhead: ${requiredRamInBytes - freeRamInBytes} bytes
      `);
        }
    }
}
module.exports = ContentApi;
