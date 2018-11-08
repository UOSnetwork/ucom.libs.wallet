const resources = [
  'cpu', 'net', 'ram',
];

const TransactionSender = require('../lib/transaction-sender');
const BlockchainRegistry = require('../lib/blockchain-registry');
const accountsData = require('../accounts-data');

require('jest-expect-message');

class Helper {

  /**
   *
   * @param {object} response
   * @param {number} actionsAmount
   */
  static checkBasicTransactionStructure(response, actionsAmount = 1) {
    expect(response.transaction_id.length).toBeGreaterThan(0);
    expect(response.processed).toBeDefined();
    expect(response.processed.action_traces.length).toBe(actionsAmount);
    expect(response.processed.receipt.status).toBe('executed');
  }

  /**
   *
   * @param {Object} data
   */
  static checkUnstakingRequestIsEmpty(data) {
    expect(data.amount).toBe(0);
    expect(data.request_datetime).toBeNull();
    expect(data.currency).toBe('UOS');
  }

  /**
   *
   * @param {Object} data
   * @param {number} amount
   */
  static checkUnstakingRequestValues(data, amount) {
    expect(data.amount).toBe(amount);
    expect(data.request_datetime).not.toBeNull();
    expect(data.currency).toBe('UOS');
  }

  /**
   *
   * @param {string} accountName
   * @param {string} privateKey
   * @return {Promise<void>}
   */
  static async rollbackAllUnstakingRequests(accountName, privateKey) {
    const state = await BlockchainRegistry.getAccountInfo(accountName);

    if (state.resources.net.unstaking_request.amount === 0 && state.resources.cpu.unstaking_request.amount === 0) {
      console.warn('nothing to rollback');

      return;
    }

    const net = state.resources.net.tokens.self_delegated + state.resources.net.unstaking_request.amount;
    const cpu = state.resources.cpu.tokens.self_delegated + state.resources.cpu.unstaking_request.amount;

    await TransactionSender.stakeOrUnstakeTokens(accountName, privateKey, net, cpu);

    const stateAfter = await BlockchainRegistry.getAccountInfo(accountName);

    expect(stateAfter.resources.net.unstaking_request.amount).toBe(0);
    expect(stateAfter.resources.cpu.unstaking_request.amount).toBe(0);
  }

  /**
   *
   * @param {object} response
   * @param {string} accountNameFrom
   * @param {string} accountNameTo
   * @param {number} tokensAmount
   */
  static checkSendTokensTransactionResponse(response, accountNameFrom, accountNameTo, tokensAmount) {
    this.checkBasicTransactionStructure(response);

    const actionTraces = response.processed.action_traces;
    expect(actionTraces.length).toBe(1);

    const data = actionTraces[0].act.data;

    expect(actionTraces[0].act.name).toBe('transfer');

    expect(data.from).toBe(accountNameFrom);
    expect(data.to).toBe(accountNameTo);
    expect(data.quantity).toBe(`${tokensAmount}.0000 UOS`);
    expect(data.memo).toBe('');
  }

  static mockTransactionSending() {
    // noinspection JSUnresolvedVariable
    TransactionSender._sendTransaction = function (actorPrivateKey, actions) {
      return {
        success: true
      }
    }
  }

  /**
   *
   * @return {string}
   */
  static getTesterAccountPrivateKey() {
    const accountName = this.getTesterAccountName();

    return accountsData[accountName].activePk;
  }

  /**
   *
   * @return {string}
   */
  static getAccountNameTo() {
    return 'ilya'
  }

  /**
   *
   * @return {string}
   */
  static getAccountNameToPrivateKey() {
    const name = this.getAccountNameTo();

    return accountsData[name].activePk;
  }


  /**
   *
   * @return {string}
   */
  static getTesterAccountName() {
    return 'autotester';
  }

  /**
   *
   * @return {string}
   */
  static getNonExistedAccountName() {
    return '1utoteste1';
  }

  /**
   *
   * @param {Object} data
   */
  static checkStateStructure(data) {
    const tokensFields = [
      'active', 'emission', 'staked', 'staked_delegated', 'unstaking_request',
    ];

    expect(data.tokens).toBeDefined();
    tokensFields.forEach(field => {
      expect(data.tokens[field]).toBeDefined();
    });

    this._checkUnstakingRequest(data.tokens.unstaking_request, 'tokens');

    for(let i = 0; i < resources.length; i++) {
      const expected = resources[i];

      const resource = data.resources[expected];

      expect(resource, `There is no resource ${expected}`).toBeDefined();
      expect(resource.dimension, `There is no dimension field for ${expected}`).toBeDefined();

      expect(resource.used, `Wrong value for resource ${expected}`).toBeGreaterThan(0);
      expect(resource.free, `Wrong value for resource ${expected}`).toBeGreaterThan(0);
      expect(resource.total, `Wrong value for resource ${expected}`).toBeGreaterThan(0);

      if (expected !== 'ram') {
        this._checkUnstakingRequest(resource.unstaking_request, expected);

        expect(resource.tokens, `There is no correct tokens object for ${expected}`).toBeDefined();
        expect(resource.tokens.currency, `There is no correct tokens object for ${expected}`).toBeDefined();
        expect(resource.tokens.delegated, `There is unstaking_request object for ${expected}`).toBeDefined();
        expect(resource.tokens.self_delegated, `There is unstaking_request object for ${expected}`).toBeDefined();
      }
    }
  }

  /**
   *
   * @param {Object} data
   * @param {string} errorLabel
   * @private
   */
  static _checkUnstakingRequest(data, errorLabel) {
    expect(data, `There is no correct unstaking_request object for ${errorLabel}`).toBeDefined();

    const required = [
      'amount', 'currency', 'request_datetime', 'unstaked_on_datetime'
    ];

    required.forEach(field => {
      expect(data[field], `There is no correct unstaking_request object for ${errorLabel}`).toBeDefined();
    });
  }
}

module.exports = Helper;