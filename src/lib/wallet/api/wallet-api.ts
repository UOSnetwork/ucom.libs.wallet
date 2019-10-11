import ActionsService from '../../service/actions-service';
import { BadRequestError } from '../../errors/errors';
import { IStringToAny } from '../../common/interfaces/common-interfaces';
import { UOS } from '../../dictionary/currency-dictionary';

import EosClient = require('../../common/client/eos-client');
import InputValidator = require('../../validators/input-validator');
import BlockchainRegistry = require('../../blockchain-registry');
import TransactionSender = require('../../transaction-sender');
import ConfigService = require('../../../config/config-service');
import PermissionsDictionary = require('../../dictionary/permissions-dictionary');
import ConverterHelper = require('../../helpers/converter-helper');

class WalletApi {
  /**
   * @deprecated
   * @see ConfigService.initNodeJsEnv()
   * @return {void}
   */
  public static setNodeJsEnv(): void {
    ConfigService.initNodeJsEnv();
  }

  // noinspection JSUnusedGlobalSymbols
  /**
   * @deprecated
   * @see ConfigService.initForTestEnv()
   * @return void
   */
  public static initForTestEnv(): void {
    ConfigService.initForTestEnv();
  }

  // noinspection JSUnusedGlobalSymbols
  /**
   * @deprecated
   * @see ConfigService.initForStagingEnv()
   * @return void
   */
  public static initForStagingEnv(): void {
    ConfigService.initForStagingEnv();
  }

  // noinspection JSUnusedGlobalSymbols
  /**
   * @deprecated
   * @see ConfigService.initForProductionEnv()
   * @return void
   */
  public static initForProductionEnv(): void {
    ConfigService.initForProductionEnv();
  }


  public static async voteForBlockProducers(
    accountName: string,
    privateKey: string,
    producers: string[],
    permission: string = PermissionsDictionary.active(),
  ) {
    await BlockchainRegistry.doBlockProducersExist(producers);
    await BlockchainRegistry.isSelfDelegatedStake(accountName);

    const uniqueProducers = ConverterHelper.getUniqueAccountNamesSortedByUInt64(producers);

    if (uniqueProducers.length > 30) {
      throw new BadRequestError('It is possible to vote up to 30 block producers');
    }

    const action = TransactionSender.getVoteForBlockProducersAction(accountName, uniqueProducers, permission);

    return EosClient.sendTransaction(privateKey, [action]);
  }

  public static async voteForCalculatorNodes(
    accountName: string,
    privateKey: string,
    nodeTitles: string[],
    permission: string = PermissionsDictionary.active(),
  ) {
    if (!Array.isArray(nodeTitles)) {
      throw new BadRequestError('Please provide nodeTitles as a valid javascript array');
    }

    const uniqueNodes = ConverterHelper.getUniqueAccountNamesSortedByUInt64(nodeTitles);

    if (uniqueNodes.length > 30) {
      throw new BadRequestError('It is possible to vote up to 30 calculating nodes');
    }

    const action = ActionsService.getVoteForCalculators(accountName, uniqueNodes, '', permission);

    return EosClient.sendTransaction(privateKey, [action]);
  }

  public static async getRawVoteInfo(accountName: string): Promise<IStringToAny> {
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

    await this.isMinUosAmountForRamOrException(bytesAmount);

    return TransactionSender.sellRamBytes(accountName, privateKey, bytesAmount);
  }

  public static async buyRam(
    accountName: string, privateKey: string, bytesAmount: number, receiver: string = accountName,
  ) {
    InputValidator.isPositiveInt(bytesAmount);
    await BlockchainRegistry.doesAccountExist(accountName);

    const price = await this.isMinUosAmountForRamOrException(bytesAmount);

    await BlockchainRegistry.isEnoughBalanceOrException(accountName, price);

    return TransactionSender.buyRamBytes(accountName, privateKey, bytesAmount, receiver);
  }

  public static async claimEmission(
    accountName: string,
    privateKey: string,
    permission: string = PermissionsDictionary.active(),
  ) {
    await BlockchainRegistry.doesAccountExist(accountName);

    return TransactionSender.claimEmission(accountName, privateKey, permission);
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

    return TransactionSender.sendTokens(
      accountNameFrom,
      privateKey,
      accountNameTo,
      amount,
      memo,
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
    cpuAmount,
  ) {
    InputValidator.isNonNegativeInt(netAmount);
    InputValidator.isNonNegativeInt(cpuAmount);

    await BlockchainRegistry.doesAccountExist(accountName);

    return TransactionSender.stakeOrUnstakeTokens(
      accountName,
      privateKey,
      netAmount,
      cpuAmount,
    );
  }

  public static async getRawAccountData(accountName: string): Promise<IStringToAny | null> {
    try {
      return await BlockchainRegistry.getRawAccountData(accountName);
    } catch (error) {
      return null;
    }
  }

  /**
   * @param {string} accountName
   * @return {{tokens: {active: number}}}
   */
  static async getAccountState(accountName) {
    return BlockchainRegistry.getAccountInfo(accountName);
  }

  public static async getAccountBalance(accountName: string, symbol: string): Promise<number> {
    return BlockchainRegistry.getAccountBalance(accountName, symbol);
  }

  public static async getAccountUosBalance(accountName): Promise<number> {
    return BlockchainRegistry.getAccountBalance(accountName, UOS);
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
  private static async isMinUosAmountForRamOrException(bytesAmount) {
    const price = await this.getApproximateRamPriceByBytesAmount(bytesAmount);

    if (price < 1) {
      throw new BadRequestError('Please increase amounts of bytes - total UOS price must be more or equal 1');
    }

    return price;
  }
}

export = WalletApi;
