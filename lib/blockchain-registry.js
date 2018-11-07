const SMART_CONTRACT__EMISSION  = 'uos.calcs';
const TABLE_NAME__EMISSION      = 'account';
const TABLE_NAME__RAM_MARKET    = 'rammarket';

const SMART_CONTRACT__EOSIO = 'eosio';

const EosClient = require('./eos-client');
const { BadRequestError } = require('./errors/errors');

class BlockchainRegistry {

  /**
   *
   * @param {string} accountName
   * @param {number} amount
   * @return {Promise<void>}
   */
  static async isEnoughBalance(accountName, amount) {
    const balance = await this.getAccountBalance(accountName);

    return +balance.toFixed(4) >= +amount.toFixed(4);
  }

  /**
   *
   * @param {string} accountName
   * @param {number} bytesAmount
   * @return {Promise<void>}
   */
  static async isEnoughRam(accountName, bytesAmount) {
    const balance = await this.getFreeRamAmountInBytes(accountName);

    return balance >= bytesAmount;
  }

  /**
   *
   * @param {string} accountName
   * @param {number} bytesAmount
   * @return {Promise<boolean>}
   */
  static async isEnoughRamOrException(accountName, bytesAmount) {
    const isEnough = await this.isEnoughRam(accountName, bytesAmount);

    if (isEnough) {
      return true;
    }

    throw new BadRequestError(`Not enough free RAM. Please correct input data`);
  }

  /**
   *
   * @param {string} accountName
   * @return {Promise<data.resources.ram|{dimension, used, free, total}>}
   */
  static async getFreeRamAmountInBytes(accountName) {
    const data = await this.getAccountInfo(accountName);

    return data.resources.ram.free * 1024;
  }

  /**
   *
   * @param {string} accountName
   * @param {number} amount
   * @return {Promise<boolean>}
   */
  static async isEnoughBalanceOrException(accountName, amount) {
    const isEnoughBalance = await this.isEnoughBalance(accountName, amount);

    if (isEnoughBalance) {
      return true;
    }

    throw new BadRequestError(`Not enough tokens. Please correct input data`);
  }

  /**
   * @return {Promise<number>} UOS/RAM_BYTE
   *
   * @link https://eosio.stackexchange.com/questions/847/how-to-get-current-last-ram-price
   */
  static async getCurrentTokenPerRamByte() {
    const rpc = EosClient.getRpcClient();

    const response = await rpc.get_table_rows({
      code:   SMART_CONTRACT__EOSIO,
      scope:  SMART_CONTRACT__EOSIO,
      table:  TABLE_NAME__RAM_MARKET,
    });

    const data = response.rows[0];

    const connectorBalance            = this._getTokensAmountFromString(data.quote.balance);
    const smartTokenOutstandingSupply = this._getRamAmountFromString(data.base.balance);
    const connectorWeight             = +data.quote.weight;

    return connectorBalance / (smartTokenOutstandingSupply * connectorWeight);
  }

  /**
   *
   * @param {string} accountName
   * @return {Promise<number>}
   */
  static async getUnclaimedEmissionAmount(accountName) {
    const rpc = EosClient.getRpcClient();

    const response = await rpc.get_table_rows({
      code:   SMART_CONTRACT__EMISSION,
      scope:  accountName,
      table:  TABLE_NAME__EMISSION,
    });

    const em = response.rows[0].account_sum;

    return Math.trunc(em * 100) / 100;
  }

  /**
   *
   * @param {string} accountName
   * @return {Promise<{net: number, cpu: number, currency: string}>}
   */
  static async getCurrentNetAndCpuStakedTokens(accountName) {
    const rpc = EosClient.getRpcClient();

    const data = {
      net: 0,
      cpu: 0,

      currency: 'UOS',
    };

    const response = await rpc.get_account(accountName);

    if (response.self_delegated_bandwidth) {
      data.net =
        this._getTokensAmountFromString(response.self_delegated_bandwidth.net_weight);
      data.cpu =
        this._getTokensAmountFromString(response.self_delegated_bandwidth.cpu_weight);
    }

    return data;
  }

  /**
   *
   * @param {string} accountName
   * @return {Promise<number>}
   */
  static async getAccountBalance(accountName) {
    const rpc = EosClient.getRpcClient();

    const balanceResponse = await rpc.get_currency_balance('eosio.token', accountName, 'UOS');
    if (balanceResponse.length === 0) {
      return 0;
    }

    return this._getTokensAmountFromString(balanceResponse[0]);
  }

  /**
   *
   * @param {string} accountName
   * @return {Promise<Object>}
   */
  static async getAccountInfo(accountName) {
    const rpc = EosClient.getRpcClient();

    const data = {
      tokens: {
        active:           0,
        staked:           0,
        staked_delegated: 0,
        emission:         0,
        unstaking_request: {
          amount: 0,
          currency: 'UOS',
          request_datetime: null,
        }
      },
      resources: {
        ram: {
          dimension: 'kB',
          used:   0,
          free:   0,
          total:  0,
        },
        cpu: {
          dimension: 'sec',
          free:   0,
          total:  0,
          used:   0,
          tokens: {
            self_delegated: 0,
            delegated: 0,
            currency: 'UOS',
          },
          unstaking_request: {
            amount: 0,
            request_datetime: null,
            currency: 'UOS',
          },
        },
        net: {
          dimension: 'kB',
          used: 0,
          free: 0,
          total: 0,
          tokens: {
            self_delegated: 0,
            delegated: 0,
            currency: 'UOS',
          },
          unstaking_request: {
            amount: 0,
            request_datetime: null,
            currency: 'UOS',
          },
        },
      }
    };

    data.tokens.active = await this.getAccountBalance(accountName);

    try {
      data.tokens.emission = await BlockchainRegistry.getUnclaimedEmissionAmount(accountName);
    } catch (err) {
      console.error('Get unclaimed emission amount error. Emission will be set to 0 for GET response. Error is: ', err);
    }

    const response = await rpc.get_account(accountName);

    if (response.ram_usage && response.ram_quota) {
      data.resources.ram.total  = (+response.ram_quota) / 1024;
      data.resources.ram.used   = (+response.ram_usage) / 1024;
      data.resources.ram.free   = data.resources.ram.total - data.resources.ram.used;
    }

    if (response.net_limit) {
      data.resources.net.free   = (response.net_limit.available / 1024).toFixed(2);
      data.resources.net.total  = (response.net_limit.max / 1024).toFixed(2);
      data.resources.net.used   = (response.net_limit.used / 1024).toFixed(2);
    }

    if (response.cpu_limit) {
      data.resources.cpu.free   = (response.cpu_limit.available / 1000000).toFixed(2);
      data.resources.cpu.total  = (response.cpu_limit.max / 1000000).toFixed(2);
      data.resources.cpu.used   = (response.cpu_limit.used / 1000000).toFixed(2);
    }

    if (response.self_delegated_bandwidth) {
      data.resources.net.tokens.self_delegated =
        this._getTokensAmountFromString(response.self_delegated_bandwidth.net_weight);
      data.resources.cpu.tokens.self_delegated =
        this._getTokensAmountFromString(response.self_delegated_bandwidth.cpu_weight);

      data.tokens.staked = data.resources.net.tokens.self_delegated + data.resources.cpu.tokens.self_delegated;
    }

    if (response.refund_request) {
      let totalAmount = 0;

      if (response.refund_request.net_amount) {
        data.resources.net.unstaking_request.amount = this._getTokensAmountFromString(response.refund_request.net_amount);
        data.resources.net.unstaking_request.request_datetime = response.refund_request.request_time;

        totalAmount += data.resources.net.unstaking_request.amount;
      }

      if (response.refund_request.cpu_amount) {
        data.resources.cpu.unstaking_request.amount = this._getTokensAmountFromString(response.refund_request.cpu_amount);
        data.resources.cpu.unstaking_request.request_datetime = response.refund_request.request_time;

        totalAmount += data.resources.cpu.unstaking_request.amount;
      }

      data.tokens.unstaking_request.amount = totalAmount;
      data.tokens.unstaking_request.request_datetime = response.refund_request.request_time;
    }

    return data;
  }

  /**
   *
   * @param {string} stringValue
   * @return {number}
   * @private
   */
  static _getTokensAmountFromString(stringValue) {
    let value = stringValue.replace(` UOS`, '');

    return +value;
  }

  /**
   *
   * @param {string} stringValue
   * @return {number}
   * @private
   */
  static _getRamAmountFromString(stringValue) {
    let value = stringValue.replace(` RAM`, '');

    return +value;
  }
}

module.exports = BlockchainRegistry;