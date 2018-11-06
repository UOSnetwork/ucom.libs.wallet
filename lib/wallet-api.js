const BlockchainRegistry = require('./blockchain-registry');
const TransactionSender = require('./transaction-sender');

class WalletApi {
  /**
   *
   * @param {string} accountNameFrom
   * @param {string} privateKey
   * @param {string} accountNameTo
   * @param {number} amount
   * @param {string} memo
   * @return {Promise<Object>}
   */
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
   *
   * @param {string} accountName
   * @param {string} privateKey
   * @param {number} netAmount
   * @param {number} cpuAmount
   * @return {Promise<Object>}
   */
  static async stakeOrUnstakeTokens(
    accountName,
    privateKey,
    netAmount,
    cpuAmount
  ) {

    return TransactionSender.stakeOrUnstakeTokens(
      accountName,
      privateKey,
      netAmount,
      cpuAmount
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
   * @param {string} accountName
   * @return {Promise<Object>}
   */
  static async getCurrentNetAndCpuStakedTokens(accountName) {
    return BlockchainRegistry.getCurrentNetAndCpuStakedTokens(accountName);
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