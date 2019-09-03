"use strict";
const EosClient = require("./common/client/eos-client");
const BlockchainRegistry = require("./blockchain-registry");
const TransactionsBuilder = require("./service/transactions-builder");
const SmartContractsDictionary = require("./dictionary/smart-contracts-dictionary");
const SmartContractsActionsDictionary = require("./dictionary/smart-contracts-actions-dictionary");
const ActionResourcesDictionary = require("./dictionary/action-resources-dictionary");
class TransactionSender {
    /**
     *
     * @param {string} accountName
     * @param {string} privateKey
     * @param {number} bytesAmount
     * @return {Promise<Object>}
     */
    static async sellRamBytes(accountName, privateKey, bytesAmount) {
        const action = this.getSellRamAction(accountName, bytesAmount);
        return EosClient.sendTransaction(privateKey, [action]);
    }
    static async buyRamBytes(accountName, privateKey, bytesAmount) {
        const action = this.getBuyRamAction(accountName, bytesAmount, accountName);
        return EosClient.sendSingleActionTransaction(privateKey, action);
    }
    static async claimEmission(accountName, privateKey, permission) {
        const action = this.getClaimEmissionAction(accountName, permission);
        return EosClient.sendTransaction(privateKey, [action]);
    }
    /**
     * @param {string} accountName
     * @param {string} privateKey
     * @param {number} netAmount
     * @param {number} cpuAmount
     * @return {Promise<Object>}
     */
    static async stakeOrUnstakeTokens(accountName, privateKey, netAmount, cpuAmount) {
        const { net: currentNet, cpu: currentCpu } = await BlockchainRegistry.getCurrentNetAndCpuStakedTokens(accountName);
        const netDelta = netAmount - currentNet;
        const cpuDelta = cpuAmount - currentCpu;
        if (netDelta > 0) {
            await BlockchainRegistry.isEnoughBalanceOrException(accountName, netDelta);
        }
        if (cpuDelta > 0) {
            await BlockchainRegistry.isEnoughBalanceOrException(accountName, cpuDelta);
        }
        const actions = [];
        if (netDelta !== 0) {
            const netString = this.getUosAmountAsString(Math.abs(netDelta));
            const cpuString = this.getUosAmountAsString(0);
            const action = netDelta > 0 ?
                this.getDelegateBandwidthAction(accountName, netString, cpuString, accountName, false) :
                this.getUnstakeTokensAction(accountName, netString, cpuString, accountName, false);
            actions.push(action);
        }
        if (cpuDelta !== 0) {
            const netString = this.getUosAmountAsString(0);
            const cpuString = this.getUosAmountAsString(Math.abs(cpuDelta));
            const action = cpuDelta > 0 ?
                this.getDelegateBandwidthAction(accountName, netString, cpuString, accountName, false) :
                this.getUnstakeTokensAction(accountName, netString, cpuString, accountName, false);
            actions.push(action);
        }
        if (actions.length === 0) {
            return null;
        }
        return EosClient.sendTransaction(privateKey, actions);
    }
    // noinspection JSUnusedGlobalSymbols
    /**
     *
     * @param {string} accountNameFrom
     * @param {string} actorPrivateKey
     * @param {number} stakeNetQuantity
     * @param {number} stakeCpuQuantity
     * @return {Promise<any>}
     */
    static async stakeForYourself(accountNameFrom, actorPrivateKey, stakeNetQuantity, stakeCpuQuantity) {
        const stakeNetQuantityString = this.getUosAmountAsString(stakeNetQuantity);
        const stakeCpuQuantityString = this.getUosAmountAsString(stakeCpuQuantity);
        const delegateBwAction = this.getDelegateBandwidthAction(accountNameFrom, stakeNetQuantityString, stakeCpuQuantityString, accountNameFrom, false);
        return EosClient.sendTransaction(actorPrivateKey, [delegateBwAction]);
    }
    // noinspection JSUnusedGlobalSymbols
    /**
     *
     * @param {string} accountNameFrom
     * @param {string} actorPrivateKey
     * @param {string} accountNameTo
     * @return {Promise<Object>}
     */
    static async delegateBasicResourcesToUser(accountNameFrom, actorPrivateKey, accountNameTo) {
        const actions = [];
        actions.push(this.getBuyRamAction(accountNameFrom, ActionResourcesDictionary.basicResourceRam(), accountNameTo));
        actions.push(this.getDelegateBandwidthAction(accountNameFrom, ActionResourcesDictionary.basicResourceNetTokens(), ActionResourcesDictionary.basicResourceCpuTokens(), accountNameTo, false));
        return EosClient.sendTransaction(actorPrivateKey, actions);
    }
    // noinspection JSUnusedGlobalSymbols
    /**
     *
     * @param {string} accountNameFrom
     * @param {string} actorPrivateKey
     * @param {number} netQuantity
     * @param {number} cpuQuantity
     * @return {Promise<any>}
     */
    static async unstakeYourselfTokens(accountNameFrom, actorPrivateKey, netQuantity, cpuQuantity) {
        const netQuantityString = this.getUosAmountAsString(netQuantity);
        const cpuQuantityString = this.getUosAmountAsString(cpuQuantity);
        const delegateBwAction = this.getUnstakeTokensAction(accountNameFrom, netQuantityString, cpuQuantityString, accountNameFrom, false);
        return EosClient.sendTransaction(actorPrivateKey, [delegateBwAction]);
    }
    /**
     *
     * @param {string} accountNameFrom
     * @param {string} privateKey
     * @param {string} accountNameTo
     * @param {number} amount
     * @param {string} memo
     * @param {string} symbol
     * @return {Promise<Object>}
     */
    static async sendTokens(accountNameFrom, privateKey, accountNameTo, amount, memo = '', symbol = ActionResourcesDictionary.UOS()) {
        const stringAmount = this.getUosAmountAsString(amount, symbol);
        const action = this.getSendTokensAction(accountNameFrom, accountNameTo, stringAmount, memo);
        return EosClient.sendTransaction(privateKey, [action]);
    }
    static getVoteForBlockProducersAction(accountNameFrom, producers, permission) {
        const smartContract = SmartContractsDictionary.eosIo();
        const actionName = SmartContractsActionsDictionary.voteProducer();
        const data = {
            voter: accountNameFrom,
            proxy: '',
            producers,
        };
        return TransactionsBuilder.getSingleUserAction(accountNameFrom, smartContract, actionName, data, permission);
    }
    /**
     *
     * @param {string} accountNameFrom
     * @param {number} amount
     * @param {string} accountNameTo
     * @return {Object}
     * @private
     */
    static getBuyRamAction(accountNameFrom, amount, accountNameTo) {
        const smartContract = SmartContractsDictionary.eosIo();
        const actionName = SmartContractsActionsDictionary.buyRamBytes();
        const data = {
            payer: accountNameFrom,
            receiver: accountNameTo,
            bytes: amount,
        };
        return TransactionsBuilder.getSingleUserAction(accountNameFrom, smartContract, actionName, data);
    }
    /**
     *
     * @param {string} accountName
     * @param {number} amount
     * @return {Object}
     * @private
     */
    static getSellRamAction(accountName, amount) {
        const smartContract = SmartContractsDictionary.eosIo();
        const actionName = SmartContractsActionsDictionary.sellRam();
        const data = {
            account: accountName,
            bytes: amount,
        };
        return TransactionsBuilder.getSingleUserAction(accountName, smartContract, actionName, data);
    }
    /**
     *
     * @param {string} accountNameFrom
     * @param {string} accountNameTo
     * @param {string} amount
     * @param {string} memo
     * @return {Object}
     * @private
     */
    static getSendTokensAction(accountNameFrom, accountNameTo, amount, memo) {
        const smartContract = SmartContractsDictionary.eosIoToken();
        const actionName = SmartContractsActionsDictionary.transfer();
        const data = {
            from: accountNameFrom,
            to: accountNameTo,
            quantity: amount,
            memo,
        };
        return TransactionsBuilder.getSingleUserAction(accountNameFrom, smartContract, actionName, data);
    }
    /**
     *
     * @param {string} accountNameFrom
     * @param {string} stakeNetAmount
     * @param {string} stakeCpuAmount
     * @param {string} accountNameTo
     * @param {boolean} transfer
     * @return {{account: *, name: *, authorization: *, data: *}}
     * @private
     */
    static getDelegateBandwidthAction(accountNameFrom, stakeNetAmount, stakeCpuAmount, accountNameTo, transfer) {
        accountNameTo = accountNameTo || accountNameFrom;
        const smartContract = SmartContractsDictionary.eosIo();
        const actionName = SmartContractsActionsDictionary.delegateBw();
        const data = {
            from: accountNameFrom,
            receiver: accountNameTo,
            stake_net_quantity: stakeNetAmount,
            stake_cpu_quantity: stakeCpuAmount,
            transfer,
        };
        return TransactionsBuilder.getSingleUserAction(accountNameFrom, smartContract, actionName, data);
    }
    /**
     *
     * @param {string} accountNameFrom
     * @param {string} netAmount
     * @param {string} cpuAmount
     * @param {string} accountNameTo
     * @param {boolean} transfer
     * @return {{account: *, name: *, authorization: *, data: *}}
     * @private
     */
    static getUnstakeTokensAction(accountNameFrom, netAmount, cpuAmount, accountNameTo, transfer) {
        const smartContract = SmartContractsDictionary.eosIo();
        const actionName = SmartContractsActionsDictionary.unDelegateBw();
        const data = {
            from: accountNameFrom,
            receiver: accountNameTo,
            unstake_net_quantity: netAmount,
            unstake_cpu_quantity: cpuAmount,
            transfer,
        };
        return TransactionsBuilder.getSingleUserAction(accountNameFrom, smartContract, actionName, data);
    }
    /**
     *
     * @param {number} amount
     * @param {string} symbol
     * @return {string}
     * @private
     */
    static getUosAmountAsString(amount, symbol = ActionResourcesDictionary.UOS()) {
        return `${Math.floor(amount)}.0000 ${symbol}`;
    }
    static getClaimEmissionAction(accountNameFrom, permission) {
        const smartContract = SmartContractsDictionary.uosCalcs();
        const actionName = SmartContractsActionsDictionary.withdrawal();
        const data = {
            owner: accountNameFrom,
        };
        return TransactionsBuilder.getSingleUserAction(accountNameFrom, smartContract, actionName, data, permission);
    }
}
module.exports = TransactionSender;
