const EosClient = require('./eos-client');

const MAIN_SMART_CONTRACT = 'eosio';
const ACTION__BUY_RAM_BYTES = 'buyrambytes';
const ACTION__DELEGATE_BANDWIDTH = 'delegatebw';
const ACTION__UNDELEGATE_BANDWIDTH = 'undelegatebw';

const CORE_TOKEN_NAME = 'UOS';

const BASIC_RESOURCE__RAM = 8192;
const BASIC_RESOURCE__CPU_TOKENS = `1.0000 ${CORE_TOKEN_NAME}`;
const BASIC_RESOURCE__NET_TOKENS = `1.0000 ${CORE_TOKEN_NAME}`;

const PERMISSION__ACTIVE = 'active';

const BLOCKS_BEHIND = 3;
const EXPIRATION_IN_SECONDS = 30;

const BlockchainRegistry = require('./blockchain-registry');

class TransactionSender {

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
    // TODO check available tokens

    const { net:currentNet, cpu:currentCpu } = await BlockchainRegistry.getCurrentNetAndCpuStakedTokens(accountName);

    const netDelta = netAmount - currentNet;
    const cpuDelta = cpuAmount - currentCpu;

    console.log(netDelta, cpuDelta);

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

    console.dir(actions);

    if (actions.length === 0) {
      return;
    }

    return this._sendTransaction(privateKey, actions);
  }

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

    return this._sendTransaction(actorPrivateKey, [
      delegateBwAction
    ]);
  }

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

    return this._sendTransaction(actorPrivateKey, actions);
  }

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
    // TODO check is account to exists
    // TODO check amount is integer

    const netQuantityString = this._getUosAmountAsString(netQuantity);
    const cpuQuantityString = this._getUosAmountAsString(cpuQuantity);

    const delegateBwAction = this._getUnstakeTokensAction(
      accountNameFrom,
      netQuantityString,
      cpuQuantityString,
      accountNameFrom,
      false,
    );

    return this._sendTransaction(actorPrivateKey, [
      delegateBwAction
    ]);
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

  /**
   *
   * @param {string} actorPrivateKey
   * @param {Object[]} actions
   * @return {Promise<any>}
   * @private
   */
  static _sendTransaction(actorPrivateKey, actions) {
    const api = EosClient.getApiClient(actorPrivateKey);

    const params = {
      blocksBehind:   BLOCKS_BEHIND,
      expireSeconds:  EXPIRATION_IN_SECONDS,
    };

    return api.transact({
      actions
    }, params);
  }

  /**
   *
   * @param {string} accountNameFrom
   * @param {number} amount
   * @param {string|null} accountNameTo
   * @return {Object}
   * @private
   */
  static _getBuyRamAction(accountNameFrom, amount, accountNameTo = null) {
    // TODO check is account to exists
    // TODO check amount is integer

    accountNameTo = accountNameTo || accountNameFrom;

    const smartContract = MAIN_SMART_CONTRACT;
    const actionName    = ACTION__BUY_RAM_BYTES;

    const data = {
      payer: accountNameFrom,
      receiver: accountNameTo,
      bytes: amount,
    };

    return this._getSingleUserAction(accountNameFrom, smartContract, actionName, data);
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
    // TODO check is account to exists
    // TODO check amount is integer

    accountNameTo = accountNameTo || accountNameFrom;

    const smartContract = MAIN_SMART_CONTRACT;
    const actionName    = ACTION__DELEGATE_BANDWIDTH;

    const data = {
      from:               accountNameFrom,
      receiver:           accountNameTo,
      stake_net_quantity: stakeNetAmount,
      stake_cpu_quantity: stakeCpuAmount,
      transfer,
    };

    return this._getSingleUserAction(accountNameFrom, smartContract, actionName, data);
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
    const smartContract = MAIN_SMART_CONTRACT;
    const actionName    = ACTION__UNDELEGATE_BANDWIDTH;

    const data = {
      from:                 accountNameFrom,
      receiver:             accountNameTo,
      unstake_net_quantity: netAmount,
      unstake_cpu_quantity: cpuAmount,
      transfer,
    };

    return this._getSingleUserAction(accountNameFrom, smartContract, actionName, data);
  }

  /**
   *
   * @param {string} actorAccountName
   * @param {string} smartContractName
   * @param {string} actionName
   * @param {Object} data
   * @return {{account: *, name: *, authorization: *, data: *}}
   * @private
   */
  static _getSingleUserAction(actorAccountName, smartContractName, actionName, data) {
    const authorization = this._getSingleUserAuthorization(actorAccountName);

    return {
      account: smartContractName,
      name: actionName,
      authorization,
      data,
    };
  }

  /**
   *
   * @param {string} actorAccountName
   * @return {{actor: *, permission: string}[]}
   * @private
   */
  static _getSingleUserAuthorization(actorAccountName) {
    return [{
      actor: actorAccountName,
      permission: PERMISSION__ACTIVE,
    }];
  }

  /**
   *
   * @param {number} amount
   * @return {string}
   * @private
   */
  static _getUosAmountAsString(amount) {
    return `${Math.floor(amount)}.0000 ${CORE_TOKEN_NAME}`
  }
}

module.exports = TransactionSender;