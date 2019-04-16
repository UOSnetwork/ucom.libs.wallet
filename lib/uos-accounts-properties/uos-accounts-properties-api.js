"use strict";
const CalculatorRpcClient = require("../client/calculator-rpc-client");
class UosAccountsPropertiesApi {
    static async getImportanceTableRows(lowerBound, limit) {
        const rpc = CalculatorRpcClient.getClient();
        const query = {
            lower_bound: lowerBound,
            limit: limit,
        };
        return rpc.fetch('/v1/uos_rates/get_accounts', query);
    }
}
module.exports = UosAccountsPropertiesApi;
