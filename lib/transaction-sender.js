const EosClient = require('./eos-client');

class TransactionSender {

  static async unstakeSomething() {
    const api = EosClient.getApiClient();

    const accountName = 'vlad';
    const stakeQuantity = '1.0000 UOS';

    const result = await api.transact({
      actions: [{
        account: 'eosio',
        name: 'undelegatebw',
        authorization: [{
          actor: accountName,
          permission: 'active',
        }],
        data: {
          from: accountName,
          receiver: accountName,
          unstake_net_quantity: stakeQuantity,
          unstake_cpu_quantity: '0.0000 UOS',
          transfer: false,
        }
      }]
    }, {
      blocksBehind: 3,
      expireSeconds: 30,
    });

    return result;
  }

  static async stakeSomething() {
    const api = EosClient.getApiClient();

    const accountName = 'vlad';
    const stakeQuantity = '1.0000 UOS';

    const result = await api.transact({
      actions: [{
        account: 'eosio',
        name: 'delegatebw',
        authorization: [{
          actor: accountName,
          permission: 'active',
        }],
        data: {
          from: accountName,
          receiver: accountName,
          stake_net_quantity: stakeQuantity,
          stake_cpu_quantity: '0.0000 UOS',
          transfer: false,
        }
      }]
    }, {
      blocksBehind: 3,
      expireSeconds: 30,
    });

    return result;
  }

  /**
   *
   * @param {string} accountNameFrom
   * @param {string} privateKey
   * @param {string} accountNameTo
   * @param {number} amount
   * @param {string} memo
   * @return {Promise<Object>}
   */
  static async sendTokens(accountNameFrom, privateKey, accountNameTo, amount, memo = '') {
    const api = EosClient.getApiClient(privateKey);

    // TODO - float is required
    const quantity = `${Math.floor(amount)}.0000 UOS`;

    // TODO - validate memo

    // TODO - validate accountNameTo exists
    // TODO - validate tokens amount is enough



    const data = {
      from:     accountNameFrom,
      to:       accountNameTo,
      quantity: quantity,
      memo:     memo,
    };

    console.dir(data);

    const actionName        = 'transfer';
    const smartContractName = 'eosio.token';

    const authorization = [{
      actor:      accountNameFrom,
      permission: 'active',
    }];

    const expirationInSeconds = 30;
    const blocksBehind = 3;

    const params = {
      blocksBehind,
      expireSeconds: expirationInSeconds,
    };

    const actions = [{
      account:  smartContractName,
      name:     actionName,
      authorization,
      data,
    }];

    return await api.transact({
      actions
    }, params);
  }
}

module.exports = TransactionSender;