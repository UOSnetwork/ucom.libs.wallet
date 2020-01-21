"use strict";
const currency_dictionary_1 = require("./dictionary/currency-dictionary");
const ConverterHelper = require("./helpers/converter-helper");
const _ = require('lodash');
const dataSchema = {
    tokens: {
        active: 0,
        staked: 0,
        staked_delegated: 0,
        emission: 0,
        unstaking_request: {
            amount: 0,
            currency: currency_dictionary_1.UOS,
            request_datetime: null,
            unstaked_on_datetime: null,
        },
    },
    resources: {
        ram: {
            dimension: 'kB',
            used: 0,
            free: 0,
            total: 0,
        },
        cpu: {
            dimension: 'sec',
            free: 0,
            total: 0,
            used: 0,
            tokens: {
                self_delegated: 0,
                delegated: 0,
                currency: currency_dictionary_1.UOS,
            },
            unstaking_request: {
                amount: 0,
                currency: currency_dictionary_1.UOS,
                request_datetime: null,
                unstaked_on_datetime: null,
            },
        },
        net: {
            dimension: 'kB',
            used: 0,
            free: 0,
            total: 0,
            tokens: {
                self_delegated: 0,
                delegated: 0,
                currency: currency_dictionary_1.UOS,
            },
            unstaking_request: {
                amount: 0,
                currency: currency_dictionary_1.UOS,
                request_datetime: null,
                unstaked_on_datetime: null,
            },
        },
    },
};
class AccountInfo {
    constructor() {
        this.info = _.cloneDeep(dataSchema);
    }
    /**
     *
     * @param {number} value
     */
    setActiveTokens(value) {
        this.info.tokens.active = value;
    }
    /**
     *
     * @param {number} value
     */
    setEmission(value) {
        this.info.tokens.emission = value;
    }
    /**
     *
     * @param {object} value
     */
    setTimeLock(value) {
        this.info.tokens.timelock = {
            total: value.total,
            unlocked: value.unlocked,
        };
    }
    /**
     *
     * @param {object} value
     */
    setActivityLock(value) {
        this.info.tokens.activitylock = {
            total: value.total,
            unlocked: value.unlocked,
        };
    }
    /**
     *
     * @param {number} totalBytes
     * @param {number} usedBytes
     */
    setRamInKb(totalBytes, usedBytes) {
        this.info.resources.ram.total = totalBytes / 1024;
        this.info.resources.ram.used = usedBytes / 1024;
        this.info.resources.ram.free =
            this.info.resources.ram.total - this.info.resources.ram.used;
    }
    /**
     *
     * @param {number} totalBytes
     * @param {number} usedBytes
     */
    setNetLimitInKb(totalBytes, usedBytes) {
        this.info.resources.net.total = +(totalBytes / 1024).toFixed(6);
        this.info.resources.net.used = +(usedBytes / 1024).toFixed(6);
        this.info.resources.net.free =
            this.info.resources.net.total - this.info.resources.net.used;
    }
    /**
     *
     * @param {number} totalMicroseconds
     * @param {number} usedMicroseconds
     */
    setCpuLimitInSec(totalMicroseconds, usedMicroseconds) {
        this.info.resources.cpu.total = +(totalMicroseconds / 1000000).toFixed(6);
        this.info.resources.cpu.used = +(usedMicroseconds / 1000000).toFixed(6);
        this.info.resources.cpu.free =
            this.info.resources.cpu.total - this.info.resources.cpu.used;
    }
    /**
     *
     * @param {string} netSelfDelegatedString
     * @param {string} cpuSelfDelegatedString
     * @param {string} netTotalDelegatedString
     * @param {string} cpuTotalDelegatedString
     */
    setResourcesTokens(netSelfDelegatedString, cpuSelfDelegatedString, netTotalDelegatedString, cpuTotalDelegatedString) {
        const netSelfDelegated = ConverterHelper.getTokensAmountFromString(netSelfDelegatedString);
        const cpuSelfDelegated = ConverterHelper.getTokensAmountFromString(cpuSelfDelegatedString);
        const netTotalDelegated = ConverterHelper.getTokensAmountFromString(netTotalDelegatedString);
        const cpuTotalDelegated = ConverterHelper.getTokensAmountFromString(cpuTotalDelegatedString);
        this.info.resources.net.tokens.self_delegated = netSelfDelegated;
        this.info.resources.cpu.tokens.self_delegated = cpuSelfDelegated;
        this.info.tokens.staked = netSelfDelegated + cpuSelfDelegated;
        const netStakedDelegated = netTotalDelegated - netSelfDelegated;
        const cpuStakedDelegated = cpuTotalDelegated - cpuSelfDelegated;
        this.info.resources.net.tokens.delegated = netStakedDelegated;
        this.info.resources.cpu.tokens.delegated = cpuStakedDelegated;
        this.info.tokens.staked_delegated = netStakedDelegated + cpuStakedDelegated;
    }
    /**
     *
     * @param {string} netTotalDelegatedString
     * @param {string} cpuTotalDelegatedString
     */
    setNonSelfDelegatedResourcesOnly(netTotalDelegatedString, cpuTotalDelegatedString) {
        const netTotalDelegated = ConverterHelper.getTokensAmountFromString(netTotalDelegatedString);
        const cpuTotalDelegated = ConverterHelper.getTokensAmountFromString(cpuTotalDelegatedString);
        const netStakedDelegated = netTotalDelegated;
        const cpuStakedDelegated = cpuTotalDelegated;
        this.info.resources.net.tokens.delegated = netStakedDelegated;
        this.info.resources.cpu.tokens.delegated = cpuStakedDelegated;
        this.info.tokens.staked_delegated = netStakedDelegated + cpuStakedDelegated;
    }
    /**
     *
     * @param {string} requestTime
     * @param {string} netAmountString
     * @param {string} cpuAmountString
     */
    setUnstakedRequestData(requestTime, netAmountString, cpuAmountString) {
        const requestDatetime = ConverterHelper.getRequestDateTime(requestTime);
        const unstakedOnDatetime = ConverterHelper.getUnstakedOnDatetime(requestTime);
        const netAmount = ConverterHelper.getTokensAmountFromString(netAmountString);
        const cpuAmount = ConverterHelper.getTokensAmountFromString(cpuAmountString);
        this.info.resources.net.unstaking_request.request_datetime = requestDatetime;
        this.info.resources.net.unstaking_request.unstaked_on_datetime = unstakedOnDatetime;
        let totalAmount = 0;
        this.info.resources.net.unstaking_request.amount = netAmount;
        totalAmount += netAmount;
        this.info.resources.cpu.unstaking_request.amount = cpuAmount;
        this.info.resources.cpu.unstaking_request.request_datetime = requestDatetime;
        this.info.resources.cpu.unstaking_request.unstaked_on_datetime = unstakedOnDatetime;
        totalAmount += cpuAmount;
        this.info.tokens.unstaking_request.amount = totalAmount;
        this.info.tokens.unstaking_request.request_datetime = requestDatetime;
        this.info.tokens.unstaking_request.unstaked_on_datetime = unstakedOnDatetime;
    }
    /**
     *
     * @return {Object}
     */
    getInfo() {
        return this.info;
    }
}
module.exports = AccountInfo;
