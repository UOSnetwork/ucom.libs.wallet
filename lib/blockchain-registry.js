const { Api, JsonRpc, RpcError, JsSignatureProvider } = require('eosjs');
const fetch = require('node-fetch');
const { TextEncoder, TextDecoder } = require('util');


const rpc = new JsonRpc('https://staging-api-node-1.u.community:7888', { fetch });
const api = new Api({ rpc, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });

/*

{ account_name: 'vlad',
  head_block_num: 13351904,
  head_block_time: '2018-11-02T15:15:31.000',
  privileged: false,
  last_code_update: '1970-01-01T00:00:00.000',
  created: '2018-08-17T11:04:16.500',
  ram_quota: 136202,
  net_weight: 30000,
  cpu_weight: 30000,
  net_limit: { used: 8346, available: 5427196, max: 5435542 },
  cpu_limit: { used: 42991, available: 993756, max: 1036747 },
  ram_usage: 3446,
    permissions:
  [ { perm_name: 'active', parent: 'owner', required_auth: [Object] },
    { perm_name: 'owner', parent: '', required_auth: [Object] } ],
    total_resources:
  { owner: 'vlad',
    net_weight: '3.0000 UOS',
    cpu_weight: '3.0000 UOS',
    ram_bytes: 136202 },
  self_delegated_bandwidth:
  { from: 'vlad',
    to: 'vlad',
    net_weight: '2.0000 UOS',
    cpu_weight: '2.0000 UOS' },
  refund_request: null,
    voter_info:
  { owner: 'vlad',
    proxy: '',
    producers: [],
    staked: 40000,
    last_vote_weight: '0.00000000000000000',
    proxied_vote_weight: '0.00000000000000000',
    is_proxy: 0 } }





{
  account_name: 'accregistrar',
  ram_quota: 76249 - total
  net_weight: 10000001,
  cpu_weight: 10000001,
  net_limit: { used: 4663, available: 1811843184, max: 1811847847 },
  cpu_limit: { used: 71405, available: 345511146, max: 345582551 },
  ram_usage: 11271,
  total_resources:
  {
    owner: 'accregistrar',
    net_weight: '1000.0001 UOS',
    cpu_weight: '1000.0001 UOS',
    ram_bytes: 76249
  },
  self_delegated_bandwidth:
  {
    from: 'accregistrar',
    to: 'accregistrar',
    net_weight: '1000.0001 UOS',
    cpu_weight: '1000.0001 UOS'
  },
  refund_request: null,
    voter_info:
  {
  owner: 'accregistrar',
    proxy: '',
    producers: [],
    staked: 20900002,
    last_vote_weight: '0.00000000000000000',
    proxied_vote_weight: '0.00000000000000000',
    is_proxy: 0
    }
}

*/

class BlockchainRegistry {
  static async getAccountInfo(accountName) {
    let balance = 0;

    const balanceResponse = await rpc.get_currency_balance('eosio.token', accountName, 'UOS');

    if (balanceResponse.length > 0) {
      balance = balanceResponse[0];
    }

    const accountResponse = await rpc.get_account(accountName);

    // console.dir(accountResponse);

    return balance;
  }
}

module.exports = BlockchainRegistry;