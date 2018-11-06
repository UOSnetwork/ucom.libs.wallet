const { Api, JsonRpc, RpcError, JsSignatureProvider } = require('eosjs');

const { TextEncoder, TextDecoder } = require('util');

class EosClient {

  /**
   *
   * @param {string} privateKey
   * @return {Api | eosjs_api_1.default | *}
   */
  static getApiClient(privateKey) {
    const rpc = this.getRpcClient();
    const signatureProvider = new JsSignatureProvider([ privateKey ]);

    return new Api({ rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });
  }

  /**
   *
   * @return {JsonRpc | eosjs_jsonrpc_1.default | *}
   */
  static getRpcClient() {
    const isNode = new Function("try {return this===global;}catch(e){return false;}");

    if(isNode())  {
      const fetch = require('node-fetch');

      return new JsonRpc('https://staging-api-node-1.u.community:7888', { fetch });
      // console.log("running under node.js");
    } else {
      return new JsonRpc('https://staging-api-node-1.u.community:7888');
      // console.log("running under browser");
    }
  }
}

module.exports = EosClient;