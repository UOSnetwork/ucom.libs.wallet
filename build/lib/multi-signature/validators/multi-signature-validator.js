"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ActionResourcesDictionary = require("../../dictionary/action-resources-dictionary");
const WalletApi = require("../../wallet/api/wallet-api");
const BlockchainRegistry = require("../../blockchain-registry");
class MultiSignatureValidator {
    static async validateCreation(authorAccountName, multiSignatureAccountName) {
        const ram = ActionResourcesDictionary.basicResourceRamForMultiSignature();
        const net = ActionResourcesDictionary.basicResourceNetTokensNumber();
        const cpu = ActionResourcesDictionary.basicResourceCpuTokensNumber();
        const existing = await WalletApi.getRawAccountData(multiSignatureAccountName);
        if (existing !== null) {
            throw new TypeError(`Provided account name = ${multiSignatureAccountName} is occupied.`);
        }
        const balance = await WalletApi.getAccountUosBalance(authorAccountName);
        if ((cpu + net) > balance) {
            throw new TypeError(`To register account you need ${cpu} tokens for CPU and ${net} tokens for NET. But you have only ${balance}`);
        }
        await BlockchainRegistry.isEnoughRamOrException(authorAccountName, ram);
    }
}
exports.MultiSignatureValidator = MultiSignatureValidator;
