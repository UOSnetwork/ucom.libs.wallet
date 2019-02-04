const { Api, JsonRpc, RpcError, JsSignatureProvider } = require('eosjs');
const { BadRequestError } = require('./errors/errors');
const converterHelper = require('./helpers/converter');

let isNode  = false;
// noinspection JSUnusedLocalSymbols
let env     = 'test';

const BLOCKS_BEHIND         = 3;
const EXPIRATION_IN_SECONDS = 30;

const configStorage = {
  test: {
    nodeUrl: 'https://staging-api-node-2.u.community:7888',
    env: 'test',
  },
  staging: {
    nodeUrl: 'https://staging-api-node-2.u.community:7888',
    env: 'staging',
  },
  production: {
    nodeUrl: 'https://api-node-1.u.community:7888',
    env: 'production',
  }
};

let config = configStorage.test;

class EosClient {
  /**
   *
   * @return {void}
   */
  static setNodeJsEnv() {
    isNode = true;
  }

  /**
   * @return void
   */
  static initForTestEnv() {
    config = configStorage.test;
  }

  /**
   * @return void
   */
  static initForStagingEnv() {
    config = configStorage.staging;
  }

  /**
   * @return void
   */
  static initForProductionEnv() {
    config = configStorage.production;
  }

  // noinspection JSUnusedGlobalSymbols
  /**
   *
   * @return {boolean}
   */
  static isProduction() {
    return config.env === 'production';
  }

  /**
   *
   * @return {JsonRpc}
   */
  static getRpcClient() {
    if(isNode)  {
      const fetch = require('node-fetch');

      return new JsonRpc(config.nodeUrl, { fetch });
    }

    return new JsonRpc(config.nodeUrl);
  }

  /**
   *
   * @param {string}    actorPrivateKey
   * @param {Object[]}  actions
   *
   * @return {Promise<Object>}
   */
  static async sendTransaction(actorPrivateKey, actions) {
    try {
      const api = this._getApiClient(actorPrivateKey);

      const params = {
        blocksBehind:   BLOCKS_BEHIND,
        expireSeconds:  EXPIRATION_IN_SECONDS,
      };

      return await api.transact({
        actions
      }, params);

    } catch (err) {

      if (err instanceof RpcError && err.json.code === 401) {
        throw new BadRequestError('Private key is not valid');
      }

      if (err.message === 'Non-base58 character') {
        throw new BadRequestError('Malformed private key');
      }
      throw err;
    }
  }

  /**
   *
   * @param {string} privateKey
   * @return {Api}
   * @private
   */
  static _getApiClient(privateKey) {
    const rpc = this.getRpcClient();
    const signatureProvider = new JsSignatureProvider([ privateKey ]);

    if (isNode) {
      const { TextEncoder, TextDecoder } = require('util');

      return new Api({ rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });
    }

    return new Api({ rpc, signatureProvider });
  }

  /**
   *
   * @return {Promise<Object>}
   */
  static async getTableRowsWithBatching(
    smartContract,
    scope,
    table,
    limit = 1000,
  ) {
    let lowerBound = null;

    let tableRows = await EosClient.getJsonTableRows(
      smartContract,
      scope,
      table,
      limit,
      lowerBound,
    );

    let iterations = 0;
    let maxIterationsLimit = limit * 10;

    let result = [];
    while (tableRows.length !== 0) {
      if (lowerBound !== null) {
        tableRows.shift(); // #task not very efficient
      }

      result = result.concat(tableRows);

      const lastAccountName = tableRows[tableRows.length - 1].owner;
      lowerBound = converterHelper.getAccountNameAsBoundString(lastAccountName);

      tableRows = await EosClient.getJsonTableRows(
        smartContract,
        scope,
        table,
        limit,
        lowerBound,
      );

      if (tableRows.length === 1 && result.length !== 0 && tableRows[0].owner === lastAccountName) {
        break;
      }

      iterations += 1;

      if (iterations >= maxIterationsLimit) {
        throw new Error('Max iterations number is exceeded');
      }
    }

    return result;
  }

  /**
   *
   * @param {string} smartContract
   * @param {string} scope
   * @param {string} table
   * @param {number} limit
   * @param {string | null} lowerBound
   * @returns {Promise<Object[]>}
   */
  static async getJsonTableRows(
    smartContract,
    scope,
    table,
    limit,
    lowerBound = null,
  ) {

    if (limit > 1000) {
      throw new Error('It is not recommended to have limit value more than 1000');
    }

    const rpc = EosClient.getRpcClient();

    const query = {
      limit,
      scope,
      table,

      code:         smartContract,
      lower_bound:  lowerBound,
      json:         true,
    };

    if (lowerBound !== null) {
      query.lower_bound = lowerBound;
    }

    const data = await rpc.get_table_rows(query);

    return data.rows;
  }
}

module.exports = EosClient;