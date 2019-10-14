"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prepare_transaction_service_1 = require("../services/prepare-transaction-service");
class PrepareTransactionApi {
    static getTransactionParams(broadcast) {
        return prepare_transaction_service_1.PrepareTransactionService.getTransactionParams(broadcast);
    }
}
exports.PrepareTransactionApi = PrepareTransactionApi;
