const EosClient = require('./eos-client');
const TransactionBuilder = require('./service/transactions-builder');
const SmartContractsActionsDictionary = require('../lib/dictionary/smart-contracts-actions-dictionary');
const SmartContractsDictionary = require('../lib/dictionary/smart-contracts-dictionary');

const SMART_CONTRACT__EISIO         = 'eosio';
const SMART_CONTRACT__EMISSION      = 'uos.calcs';
const SMART_CONTRACT__EOSIO_TOKEN      = 'eosio.token';

const ACTION__BUY_RAM_BYTES         = 'buyrambytes';
const ACTION__SELL_RAM_BYTES        = 'sellram';
const ACTION__TRANSFER              = 'transfer';
const ACTION__VOTE_PRODUCER         = 'voteproducer';

const ACTION__WITHDRAWAL            = 'withdrawal';
const ACTION__DELEGATE_BANDWIDTH    = 'delegatebw';
const ACTION__UNDELEGATE_BANDWIDTH  = 'undelegatebw';

const CORE_TOKEN_NAME = 'UOS';

const BASIC_RESOURCE__RAM = 8192;
const BASIC_RESOURCE__CPU_TOKENS = `1.0000 ${CORE_TOKEN_NAME}`;
const BASIC_RESOURCE__NET_TOKENS = `1.0000 ${CORE_TOKEN_NAME}`;

const BlockchainRegistry = require('./blockchain-registry');

const _ = require('lodash');

class TransactionSender {
  /**
   *
   * @param {string} accountName
   * @param {string} privateKey
   * @param {string[]} producers
   * @return {Promise<Object>}
   */
  static async voteForBlockProducers(accountName, privateKey, producers) {
    const action = this._getVoteForBlockProducersAction(accountName, _.uniq(producers));

    return await EosClient.sendTransaction(privateKey, [ action ]);
  }
  /**
   *
   * @param {string} accountName
   * @param {string} privateKey
   * @param {string[]} nodeTitles
   * @return {Promise<Object>}
   */
  static async voteForCalculatorNodes(accountName, privateKey, nodeTitles) {
    const action = this._getVoteForCalculatorsAction(accountName, _.uniq(nodeTitles));

    return await EosClient.sendTransaction(privateKey, [ action ]);
  }

  /**
   *
   * @param {string} accountName
   * @param {string} privateKey
   * @param {number} bytesAmount
   * @return {Promise<Object>}
   */
  static async sellRamBytes(accountName, privateKey, bytesAmount) {
    const action = this._getSellRamAction(accountName, bytesAmount);

    return await EosClient.sendTransaction(privateKey, [ action ]);
  }

  /**
   *
   * @param {string} accountName
   * @param {string} privateKey
   * @param {number} bytesAmount
   * @return {Promise<any>}
   */
  static async buyRamBytes(accountName, privateKey, bytesAmount) {
    const action = this._getBuyRamAction(accountName, bytesAmount, accountName);

    return EosClient.sendTransaction(privateKey, [ action ]);
  }

  /**
   *
   * @param {string} accountName
   * @param {string} actorPrivateKey
   * @return {Promise<any>}
   */
  static async claimEmission(accountName, actorPrivateKey) {
    const action = this._getClaimEmissionAction(accountName);

    return EosClient.sendTransaction(actorPrivateKey, [ action ]);
  }

  /**
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
    const { net:currentNet, cpu:currentCpu } = await BlockchainRegistry.getCurrentNetAndCpuStakedTokens(accountName);

    const netDelta = netAmount - currentNet;
    const cpuDelta = cpuAmount - currentCpu;

    if (netDelta > 0) {
      await BlockchainRegistry.isEnoughBalanceOrException(accountName, netDelta);
    }

    if (cpuDelta > 0) {
      await BlockchainRegistry.isEnoughBalanceOrException(accountName, cpuDelta);
    }

    let actions = [];
    if (netDelta !== 0) {
      const netString = this._getUosAmountAsString(Math.abs(netDelta));
      const cpuString = this._getUosAmountAsString(0);

      const action = netDelta > 0 ?
        this._getDelegateBandwidthAction(accountName, netString, cpuString, accountName, false) :
        this._getUnstakeTokensAction(accountName, netString, cpuString, accountName, false)
      ;

      actions.push(action);
    }

    if (cpuDelta !== 0) {
      const netString = this._getUosAmountAsString(0);
      const cpuString = this._getUosAmountAsString(Math.abs(cpuDelta));

      const action = cpuDelta > 0 ?
        this._getDelegateBandwidthAction(accountName, netString, cpuString, accountName, false) :
        this._getUnstakeTokensAction(accountName, netString, cpuString, accountName, false)
      ;

      actions.push(action);
    }

    if (actions.length === 0) {
      return;
    }

    return await EosClient.sendTransaction(privateKey, actions);
  }

  // noinspection JSUnusedGlobalSymbols
  /**
   *
   * @param {string} accountNameFrom
   * @param {string} actorPrivateKey
   * @param {number} stakeNetQuantity
   * @param {number} stakeCpuQuantity
   * @return {Promise<any>}
   */
  static async stakeForYourself(
    accountNameFrom,
    actorPrivateKey,
    stakeNetQuantity,
    stakeCpuQuantity
  ) {

    const stakeNetQuantityString = this._getUosAmountAsString(stakeNetQuantity);
    const stakeCpuQuantityString = this._getUosAmountAsString(stakeCpuQuantity);

    const delegateBwAction = this._getDelegateBandwidthAction(
      accountNameFrom,
      stakeNetQuantityString,
      stakeCpuQuantityString,
      accountNameFrom,
      false,
    );

    return EosClient.sendTransaction(actorPrivateKey, [ delegateBwAction ]);
  }

  // noinspection JSUnusedGlobalSymbols
  /**
   *
   * @param {string} accountNameFrom
   * @param {string} actorPrivateKey
   * @param {string} accountNameTo
   * @return {Promise<Object>}
   */
  static async delegateBasicResourcesToUser(accountNameFrom, actorPrivateKey, accountNameTo) {

    const actions = [];
    actions.push(this._getBuyRamAction(accountNameFrom, BASIC_RESOURCE__RAM, accountNameTo));
    actions.push(this._getDelegateBandwidthAction(
      accountNameFrom,
      BASIC_RESOURCE__NET_TOKENS,
      BASIC_RESOURCE__CPU_TOKENS,
      accountNameTo,
      false)
    );

    return EosClient.sendTransaction(actorPrivateKey, actions);
  }

  // noinspection JSUnusedGlobalSymbols
  /**
   *
   * @param {string} accountNameFrom
   * @param {string} actorPrivateKey
   * @param {number} netQuantity
   * @param {number} cpuQuantity
   * @return {Promise<any>}
   */
  static async unstakeYourselfTokens(
    accountNameFrom,
    actorPrivateKey,
    netQuantity,
    cpuQuantity
  ) {
    const netQuantityString = this._getUosAmountAsString(netQuantity);
    const cpuQuantityString = this._getUosAmountAsString(cpuQuantity);

    const delegateBwAction = this._getUnstakeTokensAction(
      accountNameFrom,
      netQuantityString,
      cpuQuantityString,
      accountNameFrom,
      false,
    );

    return EosClient.sendTransaction(actorPrivateKey, [ delegateBwAction ]);
  }

  /**
   *
   * @param {string} accountNameFrom
   * @param {string} privateKey
   * @param {string} accountNameTo
   * @param {number} amount
   * @param {string} memo
   * @param {string} symbol
   * @return {Promise<Object>}
   */
  static async sendTokens(accountNameFrom, privateKey, accountNameTo, amount, memo = '', symbol = CORE_TOKEN_NAME) {
    const stringAmount  = this._getUosAmountAsString(amount, symbol);
    const action        = this._getSendTokensAction(accountNameFrom, accountNameTo, stringAmount, memo);

    return EosClient.sendTransaction(privateKey, [action]);
  }

  /**
   *
   * @param {string} accountNameFrom
   * @param {string[]} producers
   * @return {{account: *, name: *, authorization: *, data: *}}
   * @private
   */
  static _getVoteForBlockProducersAction(accountNameFrom, producers) {
    const smartContract = SMART_CONTRACT__EISIO;
    const actionName    = ACTION__VOTE_PRODUCER;

    const data = {
      voter: accountNameFrom,
      proxy: '',
      producers
    };

    return TransactionBuilder.getSingleUserAction(accountNameFrom, smartContract, actionName, data);
  }

  /**
   *
   * @param {string} accountNameFrom
   * @param {string[]} nodeTitles
   * @return {{account: *, name: *, authorization: *, data: *}}
   * @private
   */
  static _getVoteForCalculatorsAction(accountNameFrom, nodeTitles) {
    const smartContract = SmartContractsDictionary.eosIo();
    const actionName    = SmartContractsActionsDictionary.voteForCalculators();

    const data = {
      voter: accountNameFrom,
      proxy: '',
      calculators: nodeTitles,
    };

    return TransactionBuilder.getSingleUserAction(accountNameFrom, smartContract, actionName, data);
  }

  /**
   *
   * @param {string} accountNameFrom
   * @param {number} amount
   * @param {string} accountNameTo
   * @return {Object}
   * @private
   */
  static _getBuyRamAction(accountNameFrom, amount, accountNameTo) {
    const smartContract = SMART_CONTRACT__EISIO;
    const actionName    = ACTION__BUY_RAM_BYTES;

    const data = {
      payer:    accountNameFrom,
      receiver: accountNameTo,
      bytes:    amount,
    };

    return TransactionBuilder.getSingleUserAction(accountNameFrom, smartContract, actionName, data);
  }

  /**
   *
   * @param {string} accountName
   * @param {number} amount
   * @return {Object}
   * @private
   */
  static _getSellRamAction(accountName, amount) {
    const smartContract = SMART_CONTRACT__EISIO;
    const actionName    = ACTION__SELL_RAM_BYTES;

    const data = {
      account:  accountName,
      bytes:    amount,
    };

    return TransactionBuilder.getSingleUserAction(accountName, smartContract, actionName, data);
  }

  /**
   *
   * @param {string} accountNameFrom
   * @param {string} accountNameTo
   * @param {string} amount
   * @param {string} memo
   * @return {Object}
   * @private
   */
  static _getSendTokensAction(accountNameFrom, accountNameTo, amount, memo) {
    const smartContract = SMART_CONTRACT__EOSIO_TOKEN;
    const actionName    = ACTION__TRANSFER;

    const data = {
      from:     accountNameFrom,
      to:       accountNameTo,
      quantity: amount,
      memo:     memo,
    };

    return TransactionBuilder.getSingleUserAction(accountNameFrom, smartContract, actionName, data);
  }

  /**
   *
   * @param {string} accountNameFrom
   * @return {{account: *, name: *, authorization: *, data: *}}
   * @private
   */
  static _getClaimEmissionAction(accountNameFrom) {
    const smartContract = SMART_CONTRACT__EMISSION;
    const actionName    = ACTION__WITHDRAWAL;

    const data = {
      owner: accountNameFrom
    };

    return TransactionBuilder.getSingleUserAction(accountNameFrom, smartContract, actionName, data);
  }

  /**
   *
   * @param {string} accountNameFrom
   * @param {string} stakeNetAmount
   * @param {string} stakeCpuAmount
   * @param {string} accountNameTo
   * @param {boolean} transfer
   * @return {{account: *, name: *, authorization: *, data: *}}
   * @private
   */
  static _getDelegateBandwidthAction(
    accountNameFrom,
    stakeNetAmount,
    stakeCpuAmount,
    accountNameTo,
    transfer
  ) {
    accountNameTo = accountNameTo || accountNameFrom;

    const smartContract = SMART_CONTRACT__EISIO;
    const actionName    = ACTION__DELEGATE_BANDWIDTH;

    const data = {
      from:               accountNameFrom,
      receiver:           accountNameTo,
      stake_net_quantity: stakeNetAmount,
      stake_cpu_quantity: stakeCpuAmount,
      transfer,
    };

    return TransactionBuilder.getSingleUserAction(accountNameFrom, smartContract, actionName, data);
  }

  /**
   *
   * @param {string} accountNameFrom
   * @param {string} netAmount
   * @param {string} cpuAmount
   * @param {string} accountNameTo
   * @param {boolean} transfer
   * @return {{account: *, name: *, authorization: *, data: *}}
   * @private
   */
  static _getUnstakeTokensAction(
    accountNameFrom,
    netAmount,
    cpuAmount,
    accountNameTo,
    transfer
  ) {
    const smartContract = SMART_CONTRACT__EISIO;
    const actionName    = ACTION__UNDELEGATE_BANDWIDTH;

    const data = {
      from:                 accountNameFrom,
      receiver:             accountNameTo,
      unstake_net_quantity: netAmount,
      unstake_cpu_quantity: cpuAmount,
      transfer,
    };

    return TransactionBuilder.getSingleUserAction(accountNameFrom, smartContract, actionName, data);
  }

  /**
   *
   * @param {number} amount
   * @param {string} symbol
   * @return {string}
   * @private
   */
  static _getUosAmountAsString(amount, symbol = CORE_TOKEN_NAME) {
    return `${Math.floor(amount)}.0000 ${symbol}`
  }
}

module.exports = TransactionSender;