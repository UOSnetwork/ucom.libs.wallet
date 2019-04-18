"use strict";
const { Api, JsonRpc, RpcError } = require('eosjs');
const { JsSignatureProvider } = require('eosjs/dist/eosjs-jssig');
const { BadRequestError } = require('./errors/errors');
const converterHelper = require('./helpers/converter');
let isNode = false;
// noinspection JSUnusedLocalSymbols
let env = 'test';
const BLOCKS_BEHIND = 3;
const EXPIRATION_IN_SECONDS = 30;
const configStorage = {
    test: {
        nodeUrl: 'https://staging-api-node-2.u.community:7888',
        env: 'test',
        tableRows: {
            airdropsReceipt: {
                smartContract: 'testairdrop1',
                scope: 'testairdrop1',
                table: 'receipt',
            }
        },
    },
    staging: {
        nodeUrl: 'https://staging-api-node-2.u.community:7888',
        env: 'staging',
        tableRows: {
            airdropsReceipt: {
                smartContract: 'testairdrop1',
                scope: 'testairdrop1',
                table: 'receipt',
            }
        },
    },
    production: {
        nodeUrl: 'https://mini-mongo-2.u.community:7889',
        calculatorUrl: 'http://159.69.43.17:8888/v1/uos_rates/get_accounts',
        env: 'production',
        tableRows: {
            airdropsReceipt: {
                smartContract: 'testairdrop1',
                scope: 'testairdrop1',
                table: 'receipt',
            }
        },
    }
};
let config = configStorage.test;
class EosClient {
    /**
     *
     * @return {void}
     */
    static setNodeJsEnv() {
        isNode = true;
    }
    /**
     * @return void
     */
    static initForTestEnv() {
        config = configStorage.test;
    }
    /**
     * @return void
     */
    static initForStagingEnv() {
        config = configStorage.staging;
    }
    /**
     * @return void
     */
    static initForProductionEnv() {
        config = configStorage.production;
    }
    // noinspection JSUnusedGlobalSymbols
    /**
     *
     * @return {boolean}
     */
    static isProduction() {
        return config.env === 'production';
    }
    // noinspection JSUnusedGlobalSymbols
    /**
     *
     * @return {boolean}
     */
    static isStaging() {
        return config.env === 'staging';
    }
    static getCurrentConfigTableRows() {
        const config = this.getCurrentConfig();
        return config.tableRows;
    }
    static getCurrentConfig() {
        return configStorage[config.env];
    }
    /**
     *
     * @return {JsonRpc}
     */
    static getRpcClient() {
        if (isNode) {
            const fetch = require('node-fetch');
            return new JsonRpc(config.nodeUrl, { fetch });
        }
        return new JsonRpc(config.nodeUrl);
    }
    /**
     *
     * @param {string}    actorPrivateKey
     * @param {Object[]}  actions
     *
     * @return {Promise<Object>}
     */
    static async getSignedTransaction(actorPrivateKey, actions) {
        return this.sendTransaction(actorPrivateKey, actions, false);
    }
    static async pushTransaction(signedTransaction) {
        try {
            const rpc = this.getRpcClient();
            return rpc.push_transaction(signedTransaction);
        }
        catch (err) {
            if (err instanceof RpcError && err.json.code === 401) {
                throw new BadRequestError('Private key is not valid');
            }
            if (err.message === 'Non-base58 character') {
                throw new BadRequestError('Malformed private key');
            }
            throw err;
        }
    }
    /**
     *
     * @param {string}    actorPrivateKey
     * @param {Object[]}  actions
     *
     * @param {boolean} broadcast
     * @return {Promise<Object>}
     */
    static async sendTransaction(actorPrivateKey, actions, broadcast = true) {
        try {
            const api = this._getApiClient(actorPrivateKey);
            const params = {
                broadcast,
                blocksBehind: BLOCKS_BEHIND,
                expireSeconds: EXPIRATION_IN_SECONDS,
            };
            return await api.transact({
                actions
            }, params);
        }
        catch (err) {
            if (err instanceof RpcError && err.json.code === 401) {
                throw new BadRequestError('Private key is not valid');
            }
            if (err.message === 'Non-base58 character') {
                throw new BadRequestError('Malformed private key');
            }
            throw err;
        }
    }
    /**
     *
     * @param {string} privateKey
     * @return {Api}
     * @private
     */
    static _getApiClient(privateKey) {
        const rpc = this.getRpcClient();
        const signatureProvider = new JsSignatureProvider([privateKey]);
        if (isNode) {
            const { TextEncoder, TextDecoder } = require('util');
            return new Api({ rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });
        }
        return new Api({ rpc, signatureProvider });
    }
    /**
     *
     * @param {string} smartContract
     * @param {string} scope
     * @param {string} table
     * @param {string} boundFieldName
     * @param {number} limit
     * @param {number | null} indexPosition
     * @param {string | null} keyType
     * @param {number | null }argLowerBound
     * @returns {Promise<*[]>}
     */
    static async getTableRowsWithBatching(smartContract, scope, table, boundFieldName, limit, indexPosition = null, keyType = null, argLowerBound = null) {
        let lowerBound = argLowerBound;
        let tableRows = await EosClient.getJsonTableRows(smartContract, scope, table, limit, lowerBound, indexPosition, keyType);
        let iterations = 0;
        let maxIterationsLimit = limit * 100;
        let result = [];
        while (tableRows.length !== 0) {
            if (lowerBound !== argLowerBound) {
                tableRows.shift(); // #task not very efficient
            }
            result = result.concat(tableRows);
            const lastBoundValue = tableRows[tableRows.length - 1][boundFieldName];
            if (boundFieldName === 'owner') {
                lowerBound = converterHelper.getAccountNameAsBoundString(lastBoundValue);
            }
            else {
                lowerBound = lastBoundValue;
            }
            tableRows = await EosClient.getJsonTableRows(smartContract, scope, table, limit, lowerBound, indexPosition, keyType);
            if (tableRows.length === 1 && result.length !== 0 && tableRows[0][boundFieldName] === lastBoundValue) {
                break;
            }
            iterations += 1;
            if (iterations >= maxIterationsLimit) {
                throw new Error('Max iterations number is exceeded');
            }
        }
        return result;
    }
    /**
     *
     * @param {string} smartContract
     * @param {string} scope
     * @param {string} table
     * @param {number} limit
     * @param {string | number | null} lowerBound
     * @param { number | null }indexPosition
     * @param {string | null} keyType
     * @returns {Promise<Object[]>}
     */
    static async getJsonTableRows(smartContract, scope, table, limit, lowerBound = null, indexPosition = null, keyType = null) {
        if (limit > 1000) {
            throw new Error('It is not recommended to have limit value more than 1000');
        }
        const rpc = EosClient.getRpcClient();
        const query = {
            limit,
            scope,
            table,
            code: smartContract,
            json: true,
        };
        if (lowerBound != null) {
            query.lower_bound = lowerBound;
        }
        if (indexPosition != null) {
            query.index_position = `${indexPosition}`;
        }
        if (keyType != null) {
            query.key_type = keyType;
        }
        const data = await rpc.fetch('/v1/chain/get_table_rows', query);
        // const data = await rpc.get_table_rows(query);
        return data.rows;
    }
}
module.exports = EosClient;
