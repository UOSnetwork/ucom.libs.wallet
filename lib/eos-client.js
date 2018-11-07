const { Api, JsonRpc, JsSignatureProvider } = require('eosjs');

let isNode = false;

class EosClient {
  /**
   *
   * @return {void}
   */
  static setNodeJsEnv() {
    isNode = true;
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

      return new JsonRpc('https://staging-api-node-1.u.community:7888', { fetch });
    }

    return new JsonRpc('https://staging-api-node-1.u.community:7888');
  }
}

module.exports = EosClient;