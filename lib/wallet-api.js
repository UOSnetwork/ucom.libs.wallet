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

  /**
   * TODO - this is sample method-interface
   * @param {string} accountName
   * @param {string} privateKey
   * @param {string[]} nodeTitles
   * @return {Promise<Object>}
   */
  static async voteForCalculatorNodes(accountName, privateKey, nodeTitles) {
    if (nodeTitles.length > 30) {
      throw new BadRequestError('It is possible to vote up to 30 block producers');
    }

    nodeTitles.sort();

    return {
      "transaction_id": "847472ec081518683e22a8ffeea15ac8ebb0ba7827764a7457b2c7f4a540c69f",
      "processed": {
      "id": "847472ec081518683e22a8ffeea15ac8ebb0ba7827764a7457b2c7f4a540c69f",
        "block_num": 35944982,
        "block_time": "2019-03-14T12:16:49.000",
        "producer_block_id": null,
        "receipt": {
        "status": "executed",
          "cpu_usage_us": 680,
          "net_usage_words": 14
      },
      "elapsed": 680,
        "net_usage": 112,
        "scheduled": false,
        "action_traces": [
        {
          "receipt": {
            "receiver": "eosio",
            "act_digest": "d3c009a970643ed176dc31c3d2967701511daa39a6991700b096618908a7dae6",
            "global_sequence": 128540278,
            "recv_sequence": 35949612,
            "auth_sequence": [
              [
                "vladvladvlad",
                5367
              ]
            ],
            "code_sequence": 3,
            "abi_sequence": 3
          },
          "act": {
            "account": "eosio",
            "name": "voteproducer",
            "authorization": [
              {
                "actor": "vladvladvlad",
                "permission": "active"
              }
            ],
            "data": {
              "voter": "vladvladvlad",
              "proxy": "",
              "producers": []
            },
            "hex_data": "904cdcc9c49d4cdc000000000000000000"
          },
          "context_free": false,
          "elapsed": 368,
          "console": "",
          "trx_id": "847472ec081518683e22a8ffeea15ac8ebb0ba7827764a7457b2c7f4a540c69f",
          "block_num": 35944982,
          "block_time": "2019-03-14T12:16:49.000",
          "producer_block_id": null,
          "account_ram_deltas": [
            {
              "account": "vladvladvlad",
              "delta": -16
            }
          ],
          "except": null,
          "inline_traces": []
        }
      ],
        "except": null
    }
    }
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