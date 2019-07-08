"use strict";
const PermissionsDictionary = require("../../dictionary/permissions-dictionary");
const ContentTransactionsCommonFactory = require("../service/content-transactions-common-factory");
const EosClient = require("../../common/client/eos-client");
const SmartContractsDictionary = require("../../dictionary/smart-contracts-dictionary");
class ContentApi {
    static async updateProfile(accountNameFrom, privateKey, profileJsonObject, permission = PermissionsDictionary.active()) {
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
}
module.exports = ContentApi;
