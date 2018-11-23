const BlockchainRegistry = require('./blockchain-registry');
const TransactionSender = require('./transaction-sender');
const EosClient = require('./eos-client');

const { BadRequestError } = require('./errors/errors');
const { InputValidator }  = require('./validators');

class WalletApi {

  /**
   * @return {void}
   */
  static setNodeJsEnv() {
    EosClient.setNodeJsEnv();
  }

  // noinspection JSUnusedGlobalSymbols
  /**
   * @return void
   */
  static initForTestEnv() {
    EosClient.initForTestEnv();
  }

  // noinspection JSUnusedGlobalSymbols
  /**
   * @return void
   */
  static initForStagingEnv() {
    EosClient.initForStagingEnv();
  }

  // noinspection JSUnusedGlobalSymbols
  /**
   * @return void
   */
  static initForProductionEnv() {
    EosClient.initForProductionEnv();
  }

  /**
   *
   * @param {string} accountName
   * @param {string} privateKey
   * @param {string[]} producers
   * @return {Promise<Object>}
   */
  static async voteForBlockProducers(accountName, privateKey, producers) {
    if (producers.length > 30) {
      throw new BadRequestError('It is possible to vote up to 30 block producers');
    }

    await BlockchainRegistry.doBlockProducersExist(producers);
    await BlockchainRegistry.isSelfDelegatedStake(accountName);

    producers.sort();

    return TransactionSender.voteForBlockProducers(accountName, privateKey, producers);
  }

  static async getBlockchainNodes() {
    return BlockchainRegistry.getBlockchainNodes();
  }

  /**
   * @deprecated
   * @param {string} accountName
   * @return {Promise<Object>}
   */
  static async getRawVoteInfo(accountName) {
    return BlockchainRegistry.getRawVoteInfo(accountName);
  }

  /**
   *
   * @param {number} bytesToBuy
   * @return {Promise<number>}
   */
  static async getApproximateRamPriceByBytesAmount(bytesToBuy) {
    InputValidator.isPositiveInt(bytesToBuy);

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
    InputValidator.isPositiveInt(bytesAmount);
    await BlockchainRegistry.doesAccountExist(accountName);
    await BlockchainRegistry.isEnoughRamOrException(accountName, bytesAmount);

    await this._isMinUosAmountForRamOrException(bytesAmount);

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
    InputValidator.isPositiveInt(bytesAmount);
    await BlockchainRegistry.doesAccountExist(accountName);

    const price = await this._isMinUosAmountForRamOrException(bytesAmount);

    await BlockchainRegistry.isEnoughBalanceOrException(accountName, price);

    return TransactionSender.buyRamBytes(accountName, privateKey, bytesAmount)
  }

  /**
   *
   * @param {string} accountName
   * @param {string} privateKey
   * @return {Promise<any>}
   */
  static async claimEmission(accountName, privateKey) {
    await BlockchainRegistry.doesAccountExist(accountName);

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
  static async sendTokens(accountNameFrom, privateKey, accountNameTo, amount, memo = '') {
    InputValidator.isPositiveInt(amount);
    await BlockchainRegistry.doesAccountExist(accountNameFrom);
    await BlockchainRegistry.doesAccountExist(accountNameTo);

    await BlockchainRegistry.isEnoughBalanceOrException(accountNameFrom, amount);

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
    InputValidator.isNonNegativeInt(netAmount);
    InputValidator.isNonNegativeInt(cpuAmount);

    await BlockchainRegistry.doesAccountExist(accountName);

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
    await BlockchainRegistry.doesAccountExist(accountName);

    return BlockchainRegistry.getCurrentNetAndCpuStakedTokens(accountName);
  }

  /**
   *
   * @param {number} bytesAmount
   * @return {Promise<number>}
   * @private
   */
  static async _isMinUosAmountForRamOrException(bytesAmount) {
    const price = await this.getApproximateRamPriceByBytesAmount(bytesAmount);

    if (price < 1) {
      throw new BadRequestError('Please increase amounts of bytes - total UOS price must be more or equal 1');
    }

    return price;
  }
}

module.exports = WalletApi;