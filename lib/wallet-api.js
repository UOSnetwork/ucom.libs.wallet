const BlockchainRegistry = require('./blockchain-registry');
const TransactionSender = require('./transaction-sender');

class WalletApi {
  static async sendTokens(accountNameFrom, privateKey, accountNameTo, amount, memo) {
    return await TransactionSender.sendTokens(
      accountNameFrom,
      privateKey,
      accountNameTo,
      amount,
      memo
    );
  }

  /**
   * @param {string} accountName
   * @return {{tokens: {active: number}}}
   */
  static async getAccountState(accountName) {
    const balance = await BlockchainRegistry.getAccountInfo(accountName);

    return {
      tokens: {
        active:           balance,
        staked:           1203.05,
        staked_delegated: 0,    // TODO
        emission:         0.001 // TODO
      },
      resources: {
        ram: {
          dimension: 'kB',
          free: 0.035,
          total: 5.25,
        },
        cpu: {
          dimension: 'sec',
          free: 0.0002,
          total: 0.0052,
        },
        net: {
          dimension: 'kB',
          free: 0.03,
          total: 6.07,
        },
      }
    }
  }

  /**
   *
   * @param {number} amountInBytes
   * @return {{dimension: string, price: number}}
   */
  static getRamPriceByBytes(amountInBytes) {
    return {
      amount:     amountInBytes,
      dimension:  'bytes',

      currency:   'UOS',
      price:      amountInBytes * 0.05,
    };
  }
}

module.exports = WalletApi;