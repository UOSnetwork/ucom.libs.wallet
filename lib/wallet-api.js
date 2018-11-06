const BlockchainRegistry = require('./blockchain-registry');
const TransactionSender = require('./transaction-sender');

class WalletApi {

  /**
   *
   * @param {number} bytesToBuy
   * @return {Promise<number>}
   */
  static async getApproximateRamPriceByBytesAmount(bytesToBuy) {
    const rate = await BlockchainRegistry.getCurrentTokenPerRamByte();

    return +(bytesToBuy * rate).toFixed(6);
  }

  /**
   *
   * @param {string} accountName
   * @param {string} privateKey
   * @param {number} amount
   * @return {Promise<Object>}
   */
  static async sellRam(accountName, privateKey, amount) {
    return TransactionSender.sellRamBytes(accountName, privateKey, amount);
  }

  /**
   *
   * @param {string} accountName
   * @param {string} privateKey
   * @param {number} amount
   * @return {Promise<Object>}
   */
  static async buyRam(accountName, privateKey, amount) {
    return TransactionSender.buyRamBytes(accountName, privateKey, amount)
  }

  /**
   *
   * @param {string} accountName
   * @param {string} privateKey
   * @return {Promise<any>}
   */
  static async claimEmission(accountName, privateKey) {
    return await TransactionSender.claimEmission(accountName, privateKey);
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
}

module.exports = WalletApi;