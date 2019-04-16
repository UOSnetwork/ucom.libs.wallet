"use strict";
const ConfigService = require("../../config/config-service");
const { JsonRpc } = require('eosjs');
class CalculatorRpcClient {
    static getClient() {
        const url = ConfigService.getConfig().calculatorUrl;
        if (ConfigService.isNode()) {
            const fetch = require('node-fetch');
            return new JsonRpc(url, { fetch });
        }
        return new JsonRpc(url);
    }
}
module.exports = CalculatorRpcClient;
