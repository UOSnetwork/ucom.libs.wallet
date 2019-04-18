"use strict";
const TransactionsBuilder = require('../lib/service/transactions-builder.js');
const EosClient = require('../lib/eos-client');
const EXTERNAL_ID_INDEX_POSITION = 2;
const EXTERNAL_ID_KEY_TYPE = 'i64';
class BackendApi {
    static async getAirdropsReceiptTableRows() {
        const tableRowsConfig = EosClient.getCurrentConfigTableRows();
        return EosClient.getTableRowsWithBatching(tableRowsConfig.airdropsReceipt.smartContract, tableRowsConfig.airdropsReceipt.scope, tableRowsConfig.airdropsReceipt.table, 'id', 500);
    }
    static async getAirdropsReceiptTableRowsAfterExternalId(externalId, limit = 500) {
        const tableRowsConfig = EosClient.getCurrentConfigTableRows();
        return EosClient.getTableRowsWithBatching(tableRowsConfig.airdropsReceipt.smartContract, tableRowsConfig.airdropsReceipt.scope, tableRowsConfig.airdropsReceipt.table, 'external_id', limit, EXTERNAL_ID_INDEX_POSITION, EXTERNAL_ID_KEY_TYPE, externalId);
    }
    /**
     *
     * @param {number} externalId
     * @returns {Promise<Object[]>}
     */
    static async getOneAirdropReceiptRowByExternalId(externalId) {
        const tableRowsConfig = EosClient.getCurrentConfigTableRows();
        const data = await EosClient.getJsonTableRows(tableRowsConfig.airdropsReceipt.smartContract, tableRowsConfig.airdropsReceipt.scope, tableRowsConfig.airdropsReceipt.table, 1, externalId, EXTERNAL_ID_INDEX_POSITION, EXTERNAL_ID_KEY_TYPE);
        return data.length === 1 ? data[0] : null;
    }
    /**
     *
     * @param {string} accountNameFrom
     * @param {string} privateKey
     * @param {string} permission
     * @param {number} externalId
     * @param {number} airdropId
     * @param {string} accountNameTo
     * @param {number} amountInMinor
     * @param {string} symbol
     * @returns {Promise<Object>}
     */
    static async getSignedAirdropTransaction(accountNameFrom, privateKey, permission, externalId, airdropId, accountNameTo, amountInMinor, symbol) {
        const smartContract = 'testairdrop1';
        const actionName = 'send';
        const data = {
            symbol,
            external_id: externalId,
            airdrop_id: airdropId,
            amount: amountInMinor,
            acc_name: accountNameTo,
        };
        const actions = TransactionsBuilder.getSingleUserAction(accountNameFrom, smartContract, actionName, data, permission);
        return EosClient.getSignedTransaction(privateKey, [actions]);
    }
}
module.exports = BackendApi;
