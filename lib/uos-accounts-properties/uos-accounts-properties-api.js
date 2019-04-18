"use strict";
const CalculatorRpcClient = require("../common/client/calculator-rpc-client");
class UosAccountsPropertiesApi {
    static async getAccountsTableRows(lowerBound, limit) {
        const rpc = CalculatorRpcClient.getClient();
        const query = {
            limit,
            lower_bound: lowerBound,
        };
        return rpc.fetch('/v1/uos_rates/get_accounts', query);
    }
}
module.exports = UosAccountsPropertiesApi;
