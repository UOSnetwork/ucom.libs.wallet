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
    static async getAllAccountsTableRows() {
        let lowerBound = 0;
        const limit = 500;
        let result = [];
        do {
            const response = await this.getAccountsTableRows(lowerBound, limit);
            if (response.accounts.length === 0) {
                break;
            }
            result = Array.prototype.concat(result, response.accounts);
            lowerBound += limit;
            if (lowerBound >= 100000) {
                throw new Error('Overflow trigger');
            }
            // eslint-disable-next-line no-constant-condition
        } while (true);
        return result;
    }
}
module.exports = UosAccountsPropertiesApi;
