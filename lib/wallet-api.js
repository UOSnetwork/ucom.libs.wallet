const BlockchainRegistry = require('./blockchain-registry');
const TransactionSender = require('./transaction-sender');

const { BadRequestError } = require('./errors/errors');

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
   * @param {number} bytesAmount
   * @return {Promise<Object>}
   */
  static async sellRam(accountName, privateKey, bytesAmount) {
    await BlockchainRegistry.isEnoughRamOrException(accountName, bytesAmount);

    return TransactionSender.sellRamBytes(accountName, privateKey, bytesAmount);
  }

  /**
   *
   * @param {string} accountName
   * @param {string} privateKey
   * @param {number} bytesAmount
   * @return {Promise<Object>}
   */
  static async buyRam(accountName, privateKey, bytesAmount) {
    const price = await this.getApproximateRamPriceByBytesAmount(bytesAmount);

    if ((price * 0.5) < 1) {
      throw new BadRequestError({
        bytes_amount: 'Please increase amounts of bytes - total UOS price must be more or equal 1',
      })
    }

    await BlockchainRegistry.isEnoughBalanceOrException(accountName, price * 1.2);

    return TransactionSender.buyRamBytes(accountName, privateKey, bytesAmount)
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