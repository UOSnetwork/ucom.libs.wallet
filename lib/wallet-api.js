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
    return await BlockchainRegistry.getAccountInfo(accountName);
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