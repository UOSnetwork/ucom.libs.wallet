const { Api, JsonRpc, JsSignatureProvider } = require('eosjs');

let isNode = false;

const configStorage = {
  test: {
    nodeUrl: 'https://staging-api-node-1.u.community:7888',
  },
  staging: {
    nodeUrl: 'https://staging-api-node-1.u.community:7888',
  },
  production: {
    nodeUrl: 'https://api-node-1.u.community:7888',
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
   * @param {string} privateKey
   * @return {Api}
   */
  static getApiClient(privateKey) {
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
   * @return {JsonRpc}
   */
  static getRpcClient() {
    if(isNode)  {
      const fetch = require('node-fetch');

      return new JsonRpc(config.nodeUrl, { fetch });
    }

    return new JsonRpc(config.nodeUrl);
  }
}

module.exports = EosClient;