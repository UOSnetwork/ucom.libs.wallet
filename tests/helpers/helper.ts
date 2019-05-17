/* eslint-disable unicorn/prevent-abbreviations,max-len,no-shadow,jest/valid-expect,no-unused-vars,security/detect-object-injection,no-console */
import WalletApi = require('../../src/lib/wallet/api/wallet-api');
import EosClient = require('../../src/lib/common/client/eos-client');
import BlockchainRegistry = require('../../src/lib/blockchain-registry');
import TransactionSender = require('../../src/lib/transaction-sender');
import ConfigService = require('../../src/config/config-service');

const resources = [
  'cpu', 'net', 'ram',
];

const accountsData = require('../../accounts-data');

require('jest-expect-message');


const airdropAccountName = 'testairdrop1';
const airdropHolderAccountName = 'testholder11';

let accountName = 'vladvladvlad';
let accountNameTo = 'janejanejane';

let firstBlockProducer = 'calc1';
const secondBlockProducer = 'calc2';

class Helper {
  /**
   *
   * @returns {string}
   */
  static getAirdropAccountName() {
    return airdropAccountName;
  }

  // noinspection JSUnusedGlobalSymbols
  /**
   *
   * @returns {string}
   */
  static getAirdropHolderAccountName() {
    return airdropHolderAccountName;
  }

  /**
   *
   * @returns {string}
   */
  static getAirdropAccountPrivateKey() {
    return accountsData[airdropAccountName].activePk;
  }

  // noinspection JSUnusedGlobalSymbols
  /**
   *
   * @returns {string}
   */
  static getAirdropHolderPrivateKey() {
    return accountsData[airdropHolderAccountName].activePk;
  }

  static initForTestEnv() {
    accountName = 'vladvladvlad';
    accountNameTo = 'janejanejane';

    firstBlockProducer = 'calc1';

    ConfigService.initNodeJsEnv();
    ConfigService.initForTestEnv();
  }

  static initForStagingEnv() {
    accountName = 'vladvladvlad';
    accountNameTo = 'janejanejane';

    firstBlockProducer = 'calc1';

    ConfigService.initNodeJsEnv();
    ConfigService.initForStagingEnv();
  }

  // noinspection JSUnusedGlobalSymbols
  /**
   * @return void
   */
  static initForProductionEnv() {
    accountName = 'summerknight';
    accountNameTo = 'autumnknight';

    ConfigService.initNodeJsEnv();
    ConfigService.initForProductionEnv();
  }

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

  // noinspection JSUnusedGlobalSymbols
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
   * @param {string} accountNameFrom
   * @param {string} privateKey
   * @return {Promise<void>}
   */
  static async unstakeEverything(accountNameFrom, privateKey) {
    const state = await BlockchainRegistry.getAccountInfo(accountNameFrom);

    if (state.resources.net.tokens.self_delegated === 0 && state.resources.cpu.tokens.self_delegated === 0) {
      console.warn('nothing to unstake');

      return;
    }

    await TransactionSender.stakeOrUnstakeTokens(accountNameFrom, privateKey, 0, 0);

    const stateAfter = await BlockchainRegistry.getAccountInfo(accountNameFrom);

    expect(stateAfter.resources.net.tokens.self_delegated).toBe(0);
    expect(stateAfter.resources.net.tokens.self_delegated).toBe(0);
  }

  /**
   *
   * @param {string} accountNameFrom
   * @param {string} privateKey
   * @return {Promise<void>}
   */
  static async rollbackAllUnstakingRequests(accountNameFrom, privateKey) {
    const state = await BlockchainRegistry.getAccountInfo(accountNameFrom);

    if (state.resources.net.unstaking_request.amount === 0 && state.resources.cpu.unstaking_request.amount === 0) {
      console.log('nothing to rollback');

      return;
    }

    const net = state.resources.net.tokens.self_delegated + state.resources.net.unstaking_request.amount;
    const cpu = state.resources.cpu.tokens.self_delegated + state.resources.cpu.unstaking_request.amount;

    await TransactionSender.stakeOrUnstakeTokens(accountNameFrom, privateKey, net, cpu);

    const stateAfter = await BlockchainRegistry.getAccountInfo(accountNameFrom);

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

    const { data } = actionTraces[0].act;

    expect(actionTraces[0].act.name).toBe('transfer');

    expect(data.from).toBe(accountNameFrom);
    expect(data.to).toBe(accountNameTo);
    expect(data.quantity).toBe(`${tokensAmount}.0000 UOS`);
    expect(data.memo).toBe('');
  }

  static mockTransactionSending() {
    // noinspection JSUnusedLocalSymbols
    EosClient.sendTransaction = (
      // @ts-ignore
      actorPrivateKey,
      // @ts-ignore
      actions,
    ): Promise<any> => ({
      // @ts-ignore
      success: true,
    });
  }

  /**
   *
   * @return {string}
   */
  static getTesterAccountPrivateKey() {
    return accountsData[accountName].activePk;
  }

  /**
   *
   * @return {string}
   */
  static getAccountNameTo() {
    return accountNameTo;
  }

  /**
   *
   * @return {string}
   */
  static getAccountNameToPrivateKey() {
    return accountsData[accountNameTo].activePk;
  }


  /**
   *
   * @return {string}
   */
  static getTesterAccountName() {
    return accountName;
  }

  /**
   *
   * @return {string}
   */
  static getFirstBlockProducer() {
    return firstBlockProducer;
  }

  /**
   *
   * @return {string}
   */
  static getSecondBlockProducer() {
    return secondBlockProducer;
  }

  /**
   *
   * @param {string} accountName
   * @param {string} privateKey
   * @return {Promise<void>}
   */
  static async stakeSomethingIfNecessary(accountName, privateKey) {
    await this.rollbackAllUnstakingRequests(accountName, privateKey);
    const accountState = await WalletApi.getAccountState(accountName);

    if (accountState.tokens.staked === 0) {
      await WalletApi.stakeOrUnstakeTokens(accountName, privateKey, 10, 10);
    }
  }

  /**
   *
   * @param {string} accountName
   * @param {string} privateKey
   * @return {Promise<Object>}
   */
  static resetVotingState(accountName, privateKey) {
    return WalletApi.voteForBlockProducers(accountName, privateKey, []);
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
    tokensFields.forEach((field) => {
      expect(data.tokens[field]).toBeDefined();
    });

    expect(data.tokens.active).toBeGreaterThan(0);
    expect(data.tokens.staked_delegated).toBeGreaterThan(0);
    expect(data.tokens.emission).toBeGreaterThanOrEqual(0);

    this.checkUnstakingRequest(data.tokens.unstaking_request, 'tokens');

    // eslint-disable-next-line no-restricted-syntax
    for (const expected of resources) {
      const resource = data.resources[expected];

      // @ts-ignore
      expect(resource, `There is no resource ${expected}`).toBeDefined();
      // @ts-ignore
      expect(resource.dimension, `There is no dimension field for ${expected}`).toBeDefined();

      // @ts-ignore
      expect(resource.used, `Wrong value for resource ${expected}`).toBeGreaterThan(0);
      // @ts-ignore
      expect(resource.free, `Wrong value for resource ${expected}`).toBeGreaterThan(0);
      // @ts-ignore
      expect(resource.total, `Wrong value for resource ${expected}`).toBeGreaterThan(0);

      if (expected !== 'ram') {
        this.checkUnstakingRequest(resource.unstaking_request, expected);

        // @ts-ignore
        expect(resource.tokens, `There is no correct tokens object for ${expected}`).toBeDefined();
        // @ts-ignore
        expect(resource.tokens.currency, `There is no correct tokens object for ${expected}`).toBeDefined();
        // @ts-ignore
        expect(resource.tokens.delegated, `There is unstaking_request object for ${expected}`).toBeDefined();
        // @ts-ignore
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
  private static checkUnstakingRequest(data, errorLabel) {
    // @ts-ignore
    expect(data, `There is no correct unstaking_request object for ${errorLabel}`).toBeDefined();

    const required = [
      'amount', 'currency', 'request_datetime', 'unstaked_on_datetime',
    ];

    required.forEach((field) => {
      // @ts-ignore
      expect(data[field], `There is no correct unstaking_request object for ${errorLabel}`).toBeDefined();
    });
  }

  static getSamplePushResponse(data) {
    return {
      producer_block_id: null,
      scheduled: false,
      action_traces: [
        {
          receipt: {
            receiver: 'testairdrop1',
          },
          act: {
            account: 'testairdrop1',
            name: 'send',
            authorization: [
              {
                actor: 'testairdrop1',
                permission: 'active',
              },
            ],
            data,
          },
          context_free: false,
          producer_block_id: null,
        },
      ],
      except: null,
    };
  }

  static getSampleAirdropsReceiptAfterExternalId() {
    return [
      {
        id: 6,
        external_id: 275349,
        airdrop_id: 29947,
        amount: 20001,
        acc_name: 'petr',
        symbol: 'UOSTEST',
      },
      {
        id: 7,
        external_id: 312965,
        airdrop_id: 29947,
        amount: 20001,
        acc_name: 'vlad',
        symbol: 'UOSTEST',
      },
      {
        id: 5,
        external_id: 470255,
        airdrop_id: 618018,
        amount: 20001,
        acc_name: 'jane',
        symbol: 'UOSTEST',
      },
      {
        id: 9,
        external_id: 958064,
        airdrop_id: 587162,
        amount: 20001,
        acc_name: 'jane',
        symbol: 'UOSTEST',
      },
      {
        id: 8,
        external_id: 988861,
        airdrop_id: 587162,
        amount: 20001,
        acc_name: 'vlad',
        symbol: 'UOSTEST',
      },
      {
        id: 20,
        external_id: 1119045,
        airdrop_id: 1583784,
        amount: 20001,
        acc_name: 'vlad',
        symbol: 'UOSTEST',
      },
      {
        id: 17,
        external_id: 1169432,
        airdrop_id: 3714441,
        amount: 20001,
        acc_name: 'jane',
        symbol: 'UOSTEST',
      },
      {
        id: 25,
        external_id: 1364080,
        airdrop_id: 7464427,
        amount: 20001,
        acc_name: 'jane',
        symbol: 'UOSTEST',
      },
      {
        id: 27,
        external_id: 2259812,
        airdrop_id: 14781593,
        amount: 30001,
        acc_name: 'jane',
        symbol: 'GHTEST',
      },
      {
        id: 30,
        external_id: 2807738,
        airdrop_id: 3044321,
        amount: 20001,
        acc_name: 'summerknight',
        symbol: 'UOSTEST',
      },
      {
        id: 11,
        external_id: 3008790,
        airdrop_id: 1951188,
        amount: 20001,
        acc_name: 'summerknight',
        symbol: 'GHTEST',
      },
      {
        id: 29,
        external_id: 3197937,
        airdrop_id: 12807513,
        amount: 30001,
        acc_name: 'jane',
        symbol: 'GHTEST',
      },
      {
        id: 13,
        external_id: 3882236,
        airdrop_id: 5104204,
        amount: 20001,
        acc_name: 'jane',
        symbol: 'UOSTEST',
      },
      {
        id: 31,
        external_id: 3991488,
        airdrop_id: 9373946,
        amount: 20001,
        acc_name: 'summerknight',
        symbol: 'GHTEST',
      },
      {
        id: 16,
        external_id: 4000336,
        airdrop_id: 3714441,
        amount: 20001,
        acc_name: 'vlad',
        symbol: 'UOSTEST',
      },
      {
        id: 10,
        external_id: 4324265,
        airdrop_id: 4821544,
        amount: 20001,
        acc_name: 'summerknight',
        symbol: 'UOSTEST',
      },
      {
        id: 32,
        external_id: 4464744,
        airdrop_id: 2603820,
        amount: 20001,
        acc_name: 'vlad',
        symbol: 'UOSTEST',
      },
      {
        id: 12,
        external_id: 4800357,
        airdrop_id: 5104204,
        amount: 20001,
        acc_name: 'vlad',
        symbol: 'UOSTEST',
      },
      {
        id: 19,
        external_id: 4936361,
        airdrop_id: 7826972,
        amount: 20001,
        acc_name: 'summerknight',
        symbol: 'GHTEST',
      },
      {
        id: 28,
        external_id: 5210779,
        airdrop_id: 87218862,
        amount: 30001,
        acc_name: 'jane',
        symbol: 'UOSTEST',
      },
      {
        id: 33,
        external_id: 5546471,
        airdrop_id: 2603820,
        amount: 20001,
        acc_name: 'jane',
        symbol: 'UOSTEST',
      },
      {
        id: 18,
        external_id: 5615020,
        airdrop_id: 8085431,
        amount: 20001,
        acc_name: 'summerknight',
        symbol: 'UOSTEST',
      },
      {
        id: 24,
        external_id: 5646349,
        airdrop_id: 7464427,
        amount: 20001,
        acc_name: 'vlad',
        symbol: 'UOSTEST',
      },
      {
        id: 26,
        external_id: 5676835,
        airdrop_id: 41,
        amount: 30001,
        acc_name: 'jane',
        symbol: 'GHTEST',
      },
      {
        id: 21,
        external_id: 6225753,
        airdrop_id: 1583784,
        amount: 20001,
        acc_name: 'jane',
        symbol: 'UOSTEST',
      },
      {
        id: 14,
        external_id: 6309138,
        airdrop_id: 3345720,
        amount: 20001,
        acc_name: 'summerknight',
        symbol: 'UOSTEST',
      },
      {
        id: 23,
        external_id: 9299101,
        airdrop_id: 8072423,
        amount: 20001,
        acc_name: 'summerknight',
        symbol: 'GHTEST',
      },
      {
        id: 15,
        external_id: 9392554,
        airdrop_id: 2260179,
        amount: 20001,
        acc_name: 'summerknight',
        symbol: 'GHTEST',
      },
      {
        id: 22,
        external_id: 9937582,
        airdrop_id: 1882053,
        amount: 20001,
        acc_name: 'summerknight',
        symbol: 'UOSTEST',
      },
    ];
  }

  static getSampleAirdropsReceiptTableRows() {
    return [
      {
        id: 0,
        external_id: 100,
        airdrop_id: 12,
        amount: 1,
        acc_name: 'vlad',
        symbol: 'UOSTEST',
      },
      {
        id: 1,
        external_id: 101,
        airdrop_id: 13,
        amount: 1,
        acc_name: 'vlad',
        symbol: 'UOSTEST',
      },
      {
        id: 2,
        external_id: 102,
        airdrop_id: 12,
        amount: 10001,
        acc_name: 'jane',
        symbol: 'UOSTEST',
      },
      {
        id: 3,
        external_id: 111,
        airdrop_id: 14,
        amount: 1,
        acc_name: 'vlad',
        symbol: 'UOSTEST',
      },
      {
        id: 4,
        external_id: 112,
        airdrop_id: 14,
        amount: 2001,
        acc_name: 'jane',
        symbol: 'UOSTEST',
      },
      {
        id: 5,
        external_id: 470255,
        airdrop_id: 618018,
        amount: 20001,
        acc_name: 'jane',
        symbol: 'UOSTEST',
      },
      {
        id: 6,
        external_id: 275349,
        airdrop_id: 29947,
        amount: 20001,
        acc_name: 'petr',
        symbol: 'UOSTEST',
      },
      {
        id: 7,
        external_id: 312965,
        airdrop_id: 29947,
        amount: 20001,
        acc_name: 'vlad',
        symbol: 'UOSTEST',
      },
      {
        id: 8,
        external_id: 988861,
        airdrop_id: 587162,
        amount: 20001,
        acc_name: 'vlad',
        symbol: 'UOSTEST',
      },
      {
        id: 9,
        external_id: 958064,
        airdrop_id: 587162,
        amount: 20001,
        acc_name: 'jane',
        symbol: 'UOSTEST',
      },
      {
        id: 10,
        external_id: 4324265,
        airdrop_id: 4821544,
        amount: 20001,
        acc_name: 'summerknight',
        symbol: 'UOSTEST',
      },
      {
        id: 11,
        external_id: 3008790,
        airdrop_id: 1951188,
        amount: 20001,
        acc_name: 'summerknight',
        symbol: 'GHTEST',
      },
      {
        id: 12,
        external_id: 4800357,
        airdrop_id: 5104204,
        amount: 20001,
        acc_name: 'vlad',
        symbol: 'UOSTEST',
      },
      {
        id: 13,
        external_id: 3882236,
        airdrop_id: 5104204,
        amount: 20001,
        acc_name: 'jane',
        symbol: 'UOSTEST',
      },
      {
        id: 14,
        external_id: 6309138,
        airdrop_id: 3345720,
        amount: 20001,
        acc_name: 'summerknight',
        symbol: 'UOSTEST',
      },
      {
        id: 15,
        external_id: 9392554,
        airdrop_id: 2260179,
        amount: 20001,
        acc_name: 'summerknight',
        symbol: 'GHTEST',
      },
      {
        id: 16,
        external_id: 4000336,
        airdrop_id: 3714441,
        amount: 20001,
        acc_name: 'vlad',
        symbol: 'UOSTEST',
      },
      {
        id: 17,
        external_id: 1169432,
        airdrop_id: 3714441,
        amount: 20001,
        acc_name: 'jane',
        symbol: 'UOSTEST',
      },
    ];
  }
}

export = Helper;
