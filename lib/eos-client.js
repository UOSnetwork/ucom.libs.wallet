const { Api, JsonRpc, RpcError, JsSignatureProvider } = require('eosjs');
const { BadRequestError } = require('./errors/errors');

let isNode  = false;
let env     = 'test';

const BLOCKS_BEHIND         = 3;
const EXPIRATION_IN_SECONDS = 30;

const configStorage = {
  test: {
    nodeUrl: 'https://staging-api-node-1.u.community:7888',
    env: 'test',
  },
  staging: {
    nodeUrl: 'https://staging-api-node-1.u.community:7888',
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
}

module.exports = EosClient;