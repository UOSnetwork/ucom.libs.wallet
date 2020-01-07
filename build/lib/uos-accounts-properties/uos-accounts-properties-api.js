"use strict";
const CalculatorRpcClient = require("../common/client/calculator-rpc-client");
class UosAccountsPropertiesApi {
    static async getAccountsTableRows(lowerBound, limit) {
        const rpc = CalculatorRpcClient.getClient();
        const query = {
            limit,
            lower_bound: lowerBound,
        };
        const response = await rpc.fetch('/v1/uos_rates/get_accounts', query);
        return (typeof response === 'string') ? JSON.parse(response) : response;
    }
    static async getAllAccountsTableRows(indexBy = null, flatten = true) {
        let lowerBound = 0;
        const limit = 1000;
        let result = [];
        do {
            const response = await this.getAccountsTableRows(lowerBound, limit);
            if (response.accounts.length === 0) {
                break;
            }
            result = Array.prototype.concat(result, response.accounts);
            lowerBound += limit;
            if (lowerBound >= 500000) {
                throw new Error('Increase limit for getAllAccountsTableRows method');
            }
            // eslint-disable-next-line no-constant-condition
        } while (true);
        if (indexBy === null) {
            return result;
        }
        const processedResult = {};
        for (const item of result) {
            let processed;
            if (flatten) {
                processed = Object.assign(Object.assign({}, item.values), { account_name: item.name });
            }
            else {
                processed = item;
            }
            if (!item[indexBy]) {
                throw new Error(`There is no field ${indexBy} inside: ${JSON.stringify(item)}`);
            }
            processedResult[item[indexBy]] = processed;
        }
        return processedResult;
    }
}
module.exports = UosAccountsPropertiesApi;
