"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const transaction_dictionary_1 = require("../../dictionary/transaction-dictionary");
class PrepareTransactionService {
    static getTransactionParams(broadcast) {
        return {
            broadcast,
            blocksBehind: transaction_dictionary_1.BLOCKS_BEHIND,
            expireSeconds: transaction_dictionary_1.EXPIRATION_IN_SECONDS,
        };
    }
}
exports.PrepareTransactionService = PrepareTransactionService;
