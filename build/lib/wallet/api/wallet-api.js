"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const actions_service_1 = __importDefault(require("../../service/actions-service"));
const errors_1 = require("../../errors/errors");
const EosClient = require("../../common/client/eos-client");
const InputValidator = require("../../validators/input-validator");
const BlockchainRegistry = require("../../blockchain-registry");
const TransactionSender = require("../../transaction-sender");
const ConfigService = require("../../../config/config-service");
class WalletApi {
    /**
     * @deprecated
     * @see ConfigService.initNodeJsEnv()
     * @return {void}
     */
    static setNodeJsEnv() {
        ConfigService.initNodeJsEnv();
    }
    // noinspection JSUnusedGlobalSymbols
    /**
     * @deprecated
     * @see ConfigService.initForTestEnv()
     * @return void
     */
    static initForTestEnv() {
        ConfigService.initForTestEnv();
    }
    // noinspection JSUnusedGlobalSymbols
    /**
     * @deprecated
     * @see ConfigService.initForStagingEnv()
     * @return void
     */
    static initForStagingEnv() {
        ConfigService.initForStagingEnv();
    }
    // noinspection JSUnusedGlobalSymbols
    /**
     * @deprecated
     * @see ConfigService.initForProductionEnv()
     * @return void
     */
    static initForProductionEnv() {
        ConfigService.initForProductionEnv();
    }
    /**
     *
     * @param {string} accountName
     * @param {string} privateKey
     * @param {string[]} producers
     * @return {Promise<Object>}
     */
    static async voteForBlockProducers(accountName, privateKey, producers) {
        if (producers.length > 30) {
            throw new errors_1.BadRequestError('It is possible to vote up to 30 block producers');
        }
        await BlockchainRegistry.doBlockProducersExist(producers);
        await BlockchainRegistry.isSelfDelegatedStake(accountName);
        producers.sort();
        return TransactionSender.voteForBlockProducers(accountName, privateKey, producers);
    }
    /**
     * @param {string} accountName
     * @param {string} privateKey
     * @param {string[]} nodeTitles
     * @return {Promise<Object>}
     */
    static async voteForCalculatorNodes(accountName, privateKey, nodeTitles) {
        if (!Array.isArray(nodeTitles)) {
            throw new errors_1.BadRequestError('Please provide nodeTitles as a valid javascript array');
        }
        if (nodeTitles.length > 30) {
            throw new errors_1.BadRequestError('It is possible to vote up to 30 block producers');
        }
        nodeTitles.sort();
        const action = actions_service_1.default.getVoteForCalculators(accountName, nodeTitles);
        return EosClient.sendTransaction(privateKey, [action]);
    }
    /**
     * @deprecated
     * @param {string} accountName
     * @return {Promise<Object>}
     */
    static async getRawVoteInfo(accountName) {
        return BlockchainRegistry.getRawVoteInfo(accountName);
    }
    /**
     *
     * @param {number} bytesToBuy
     * @return {Promise<number>}
     */
    static async getApproximateRamPriceByBytesAmount(bytesToBuy) {
        InputValidator.isPositiveInt(bytesToBuy);
        const rate = await BlockchainRegistry.getCurrentTokenPerRamByte();
        return +(bytesToBuy * rate).toFixed(6);
    }
    /**
     *
     * @param {string} accountName
     * @param {string} privateKey
     * @param {number} bytesAmount
     * @return {Promise<Object>}
     */
    static async sellRam(accountName, privateKey, bytesAmount) {
        InputValidator.isPositiveInt(bytesAmount);
        await BlockchainRegistry.doesAccountExist(accountName);
        await BlockchainRegistry.isEnoughRamOrException(accountName, bytesAmount);
        await this.isMinUosAmountForRamOrException(bytesAmount);
        return TransactionSender.sellRamBytes(accountName, privateKey, bytesAmount);
    }
    /**
     *
     * @param {string} accountName
     * @param {string} privateKey
     * @param {number} bytesAmount
     * @return {Promise<Object>}
     */
    static async buyRam(accountName, privateKey, bytesAmount) {
        InputValidator.isPositiveInt(bytesAmount);
        await BlockchainRegistry.doesAccountExist(accountName);
        const price = await this.isMinUosAmountForRamOrException(bytesAmount);
        await BlockchainRegistry.isEnoughBalanceOrException(accountName, price);
        return TransactionSender.buyRamBytes(accountName, privateKey, bytesAmount);
    }
    /**
     *
     * @param {string} accountName
     * @param {string} privateKey
     * @return {Promise<any>}
     */
    static async claimEmission(accountName, privateKey) {
        await BlockchainRegistry.doesAccountExist(accountName);
        return TransactionSender.claimEmission(accountName, privateKey);
    }
    /**
     *
     * @param {string} accountNameFrom
     * @param {string} privateKey
     * @param {string} accountNameTo
     * @param {number} amount
     * @param {string} memo
     * @return {Promise<Object>}
     */
    static async sendTokens(accountNameFrom, privateKey, accountNameTo, amount, memo = '') {
        InputValidator.isPositiveInt(amount);
        await BlockchainRegistry.doesAccountExist(accountNameFrom);
        await BlockchainRegistry.doesAccountExist(accountNameTo);
        await BlockchainRegistry.isEnoughBalanceOrException(accountNameFrom, amount);
        return TransactionSender.sendTokens(accountNameFrom, privateKey, accountNameTo, amount, memo);
    }
    /**
     *
     * @param {string} accountName
     * @param {string} privateKey
     * @param {number} netAmount
     * @param {number} cpuAmount
     * @return {Promise<Object>}
     */
    static async stakeOrUnstakeTokens(accountName, privateKey, netAmount, cpuAmount) {
        InputValidator.isNonNegativeInt(netAmount);
        InputValidator.isNonNegativeInt(cpuAmount);
        await BlockchainRegistry.doesAccountExist(accountName);
        return TransactionSender.stakeOrUnstakeTokens(accountName, privateKey, netAmount, cpuAmount);
    }
    /**
     * @param {string} accountName
     * @return {{tokens: {active: number}}}
     */
    static async getAccountState(accountName) {
        return BlockchainRegistry.getAccountInfo(accountName);
    }
    // noinspection JSUnusedGlobalSymbols
    static async getAccountBalance(accountName, symbol) {
        return BlockchainRegistry.getAccountBalance(accountName, symbol);
    }
    /**
     *
     * @param {string} accountName
     * @return {Promise<Object>}
     */
    static async getCurrentNetAndCpuStakedTokens(accountName) {
        await BlockchainRegistry.doesAccountExist(accountName);
        return BlockchainRegistry.getCurrentNetAndCpuStakedTokens(accountName);
    }
    /**
     *
     * @param {number} bytesAmount
     * @return {Promise<number>}
     * @private
     */
    static async isMinUosAmountForRamOrException(bytesAmount) {
        const price = await this.getApproximateRamPriceByBytesAmount(bytesAmount);
        if (price < 1) {
            throw new errors_1.BadRequestError('Please increase amounts of bytes - total UOS price must be more or equal 1');
        }
        return price;
    }
}
module.exports = WalletApi;
