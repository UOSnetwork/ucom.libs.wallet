const { Api, JsonRpc, JsSignatureProvider } = require('eosjs');

class EosClient {

  /**
   *
   * @param {string} privateKey
   * @return {Api | eosjs_api_1.default | *}
   */
  static getApiClient(privateKey) {
    const rpc = this.getRpcClient();
    const signatureProvider = new JsSignatureProvider([ privateKey ]);

    if (this._isNode()) {
      const { TextEncoder, TextDecoder } = require('util');

      return new Api({ rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });
    }

    return new Api({ rpc, signatureProvider });
  }

  /**
   *
   * @return {JsonRpc | eosjs_jsonrpc_1.default | *}
   */
  static getRpcClient() {
    if(this._isNode())  {
      const fetch = require('node-fetch');

      return new JsonRpc('https://staging-api-node-1.u.community:7888', { fetch });
    }

    return new JsonRpc('https://staging-api-node-1.u.community:7888');
  }

  /**
   *
   * @return {boolean}
   * @private
   */
  static _isNode() {
    const isBrowser = new Function("try {return this===window;}catch(e){ return false;}");

    return !isBrowser();
  }
}

module.exports = EosClient;