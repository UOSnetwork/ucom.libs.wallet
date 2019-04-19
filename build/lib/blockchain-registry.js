"use strict";
const SMART_CONTRACT__EMISSION = 'uos.calcs';
const TABLE_NAME__EMISSION = 'account';
const TABLE_NAME__RAM_MARKET = 'rammarket';
const SMART_CONTRACT__EOSIO = 'eosio';
const EosClient = require('./eos-client');
const AccountInfo = require('./account-info');
const { BadRequestError } = require('./errors/errors');
const Converter = require('./helpers/converter');
const TABLE_ROWS_LIMIT_ALL = 999999;
const _ = require('lodash');
class BlockchainRegistry {
    /**
     *
     * @param {string} accountName
     * @param {number} amount
     * @return {Promise<void>}
     */
    static async isEnoughBalance(accountName, amount) {
        const balance = await this.getAccountBalance(accountName);
        return +balance.toFixed(4) >= +amount.toFixed(4);
    }
    /**
     *
     * @param {string} accountName
     * @return {Promise<Object>}
     */
    static async getRawVoteInfo(accountName) {
        const rpc = EosClient.getRpcClient();
        const response = await rpc.get_account(accountName);
        return response.voter_info;
    }
    /**
     *
     * @param {string} accountName
     * @return {Promise<boolean>}
     */
    static async doesAccountExist(accountName) {
        const rpc = EosClient.getRpcClient();
        try {
            await rpc.get_account(accountName);
            return true;
        }
        catch (err) {
            throw new BadRequestError('Probably account does not exist. Please check spelling.');
        }
    }
    /**
     *
     * @param {string} accountName
     * @return {Promise<void>}
     */
    static async isSelfDelegatedStake(accountName) {
        const info = await this.getAccountInfo(accountName);
        if (Object.keys(info).length === 0) {
            throw new BadRequestError('Probably account does not exist. Please check spelling.');
        }
        if (info.tokens.staked === 0) {
            throw new BadRequestError('It is possible to vote only if you have self-staked tokens.');
        }
    }
    /**
     *
     * @param {string[]} producers
     * @return {Promise<void>}
     */
    static async doBlockProducersExist(producers) {
        const rpc = EosClient.getRpcClient();
        const allProducers = await rpc.get_producers(true, "", TABLE_ROWS_LIMIT_ALL);
        const producersIndex = [];
        for (let i = 0; i < allProducers.rows.length; i++) {
            const producer = allProducers.rows[i];
            producersIndex.push(producer.owner);
        }
        const notExisted = _.difference(producers, producersIndex);
        if (notExisted.length > 0) {
            throw new BadRequestError(`There is no such block producers: ${notExisted.join(', ')}`);
        }
    }
    /**
     *
     * @param {string} accountName
     * @param {number} bytesAmount
     * @return {Promise<void>}
     */
    static async isEnoughRam(accountName, bytesAmount) {
        const balance = await this.getFreeRamAmountInBytes(accountName);
        return balance >= bytesAmount;
    }
    /**
     *
     * @param {string} accountName
     * @param {number} bytesAmount
     * @return {Promise<boolean>}
     */
    static async isEnoughRamOrException(accountName, bytesAmount) {
        const isEnough = await this.isEnoughRam(accountName, bytesAmount);
        if (isEnough) {
            return true;
        }
        throw new BadRequestError(`Not enough free RAM. Please correct input data`);
    }
    /**
     *
     * @param {string} accountName
     * @return {Promise<number>}
     */
    static async getFreeRamAmountInBytes(accountName) {
        const rpc = EosClient.getRpcClient();
        const response = await rpc.get_account(accountName);
        if (+response.ram_usage && +response.ram_quota) {
            return +response.ram_quota - +response.ram_usage;
        }
        return 0;
    }
    /**
     *
     * @param {string} accountName
     * @return {Promise<number>}
     */
    static async getTotalRamAmount(accountName) {
        const rpc = EosClient.getRpcClient();
        const response = await rpc.get_account(accountName);
        return +response.ram_quota;
    }
    /**
     *
     * @param {string} accountName
     * @param {number} amount
     * @return {Promise<boolean>}
     */
    static async isEnoughBalanceOrException(accountName, amount) {
        const isEnoughBalance = await this.isEnoughBalance(accountName, amount);
        if (isEnoughBalance) {
            return true;
        }
        throw new BadRequestError(`Not enough tokens. Please correct input data`);
    }
    /**
     * @return {Promise<number>} UOS/RAM_BYTE
     *
     * @link https://eosio.stackexchange.com/questions/847/how-to-get-current-last-ram-price
     */
    static async getCurrentTokenPerRamByte() {
        const rpc = EosClient.getRpcClient();
        const response = await rpc.get_table_rows({
            code: SMART_CONTRACT__EOSIO,
            scope: SMART_CONTRACT__EOSIO,
            table: TABLE_NAME__RAM_MARKET,
        });
        const data = response.rows[0];
        const connectorBalance = Converter.getTokensAmountFromString(data.quote.balance);
        const smartTokenOutstandingSupply = Converter.getRamAmountFromString(data.base.balance);
        const connectorWeight = 1; //+data.quote.weight; this weight leads to wrong price calculations
        return connectorBalance / (smartTokenOutstandingSupply * connectorWeight);
    }
    /**
     *
     * @param {string} accountName
     * @return {Promise<number>}
     */
    static async getUnclaimedEmissionAmount(accountName) {
        const rpc = EosClient.getRpcClient();
        const response = await rpc.get_table_rows({
            code: SMART_CONTRACT__EMISSION,
            scope: accountName,
            table: TABLE_NAME__EMISSION,
            json: true
        });
        if (response.rows.length === 0) {
            return 0;
        }
        const em = response.rows[0].account_sum;
        return Math.trunc(em * 100) / 100;
    }
    /**
     *
     * @param {string} accountName
     * @return {Promise<{net: number, cpu: number, currency: string}>}
     */
    static async getCurrentNetAndCpuStakedTokens(accountName) {
        const rpc = EosClient.getRpcClient();
        const data = {
            net: 0,
            cpu: 0,
            currency: 'UOS',
        };
        const response = await rpc.get_account(accountName);
        if (response.self_delegated_bandwidth) {
            data.net =
                Converter.getTokensAmountFromString(response.self_delegated_bandwidth.net_weight);
            data.cpu =
                Converter.getTokensAmountFromString(response.self_delegated_bandwidth.cpu_weight);
        }
        return data;
    }
    /**
     *
     * @param {string} accountName
     * @param {string} symbol
     * @return {Promise<number>}
     */
    static async getAccountBalance(accountName, symbol = 'UOS') {
        const rpc = EosClient.getRpcClient();
        const balanceResponse = await rpc.get_currency_balance('eosio.token', accountName, symbol);
        if (balanceResponse.length === 0) {
            return 0;
        }
        return Converter.getTokensAmountFromString(balanceResponse[0], symbol);
    }
    /**
     *
     * @param {string} accountName
     * @return {Promise<number>}
     */
    static async getEmission(accountName) {
        try {
            return await BlockchainRegistry.getUnclaimedEmissionAmount(accountName);
        }
        catch (err) {
            console.error('Get unclaimed emission amount error. Emission will be set to 0 for GET response. Error is: ', err);
            return 0;
        }
    }
    /**
     *
     * @param {string} accountName
     * @return {Promise<Object>}
     */
    static async getAccountInfo(accountName) {
        const rpc = EosClient.getRpcClient();
        const info = new AccountInfo();
        const balance = await this.getAccountBalance(accountName);
        info.setActiveTokens(balance);
        const emission = await this.getEmission(accountName);
        info.setEmission(emission);
        let response;
        try {
            response = await rpc.get_account(accountName);
        }
        catch (err) {
            console.warn(`Probably there is no account with name: ${accountName}`);
            return {};
        }
        if (response.ram_usage && response.ram_quota) {
            info.setRamInKb(+response.ram_quota, +response.ram_usage);
        }
        if (response.net_limit) {
            info.setNetLimitInKb(+response.net_limit.max, +response.net_limit.used);
        }
        if (response.cpu_limit) {
            info.setCpuLimitInSec(+response.cpu_limit.max, +response.cpu_limit.used);
        }
        if (response.self_delegated_bandwidth) {
            info.setResourcesTokens(response.self_delegated_bandwidth.net_weight, response.self_delegated_bandwidth.cpu_weight, response.total_resources.net_weight, response.total_resources.cpu_weight);
        }
        if (response.self_delegated_bandwidth === null && response.total_resources) {
            info.setNonSelfDelegatedResourcesOnly(response.total_resources.net_weight, response.total_resources.cpu_weight);
        }
        if (response.refund_request) {
            info.setUnstakedRequestData(response.refund_request.request_time, response.refund_request.net_amount, response.refund_request.cpu_amount);
        }
        return info.getInfo();
    }
}
module.exports = BlockchainRegistry;
