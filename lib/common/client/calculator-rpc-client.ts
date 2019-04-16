/* eslint-disable global-require */
import ConfigService = require('../../../config/config-service');

const { JsonRpc } = require('eosjs');

class CalculatorRpcClient {
  public static getClient(): any {
    const url: string = ConfigService.getConfig().calculatorUrl;

    if (ConfigService.isNode()) {
      const fetch = require('node-fetch');

      return new JsonRpc(url, { fetch });
    }

    return new JsonRpc(url);
  }
}

export = CalculatorRpcClient;
