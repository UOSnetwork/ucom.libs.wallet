import { Action, SerializedAction } from 'eosjs/dist/eosjs-serialize';
import { BadRequestError } from '../../errors/errors';
import { IStringToAny } from '../interfaces/common-interfaces';
import { BLOCKS_BEHIND, EXPIRATION_IN_SECONDS } from '../../dictionary/transaction-dictionary';

import ConverterHelper = require('../../helpers/converter-helper');
import ConfigService = require('../../../config/config-service');

const { Api, JsonRpc, RpcError } = require('eosjs');
const { JsSignatureProvider } = require('eosjs/dist/eosjs-jssig');

class EosClient {
  /**
   * @deprecated
   * @see ConfigService.initNodeJsEnv
   * @return {void}
   */
  static setNodeJsEnv() {
    ConfigService.initNodeJsEnv();
  }

  /**
   * @deprecated
   * @see ConfigService.initForTestEnv
   * @return void
   */
  public static initForTestEnv(): void {
    ConfigService.initForTestEnv();
  }

  /**
   * @deprecated
   * @see ConfigService.initForStagingEnv()
   * @return void
   */
  public static initForStagingEnv() {
    ConfigService.initForStagingEnv();
  }

  /**
   * @deprecated
   * @see ConfigService.initForProductionEnv()
   * @return void
   */
  public static initForProductionEnv() {
    ConfigService.initForProductionEnv();
  }

  // noinspection JSUnusedGlobalSymbols
  /**
   *
   * @return {boolean}
   */
  public static isProduction() {
    const config = ConfigService.getConfig();

    return config.env === 'production';
  }

  // noinspection JSUnusedGlobalSymbols
  /**
   *
   * @return {boolean}
   */
  public static isStaging() {
    const config = ConfigService.getConfig();

    return config.env === 'staging';
  }

  public static getCurrentConfigTableRows() {
    const config = ConfigService.getConfig();

    return config.tableRows;
  }

  /**
   *
   * @return {JsonRpc}
   */
  static getRpcClient() {
    const config = ConfigService.getConfig();

    if (ConfigService.isNode())  {
      // eslint-disable-next-line global-require
      const fetch = require('node-fetch');

      return new JsonRpc(config.nodeUrl, { fetch });
    }

    return new JsonRpc(config.nodeUrl);
  }

  /**
   *
   * @param {string}    actorPrivateKey
   * @param {Object[]}  actions
   *
   * @return {Promise<Object>}
   */
  public static async getSignedTransaction(actorPrivateKey, actions) {
    const broadcast = false;
    return this.sendTransaction(actorPrivateKey, actions, broadcast);
  }

  static async pushTransaction(signedTransaction) {
    try {
      const rpc = this.getRpcClient();

      return rpc.push_transaction(signedTransaction);
    } catch (error) {
      if (error instanceof RpcError && error.json.code === 401) {
        throw new BadRequestError('Private key is not valid');
      }

      if (error.message === 'Non-base58 character') {
        throw new BadRequestError('Malformed private key');
      }
      throw error;
    }
  }

  public static async sendSingleActionTransaction(
    privateKey: string,
    action: IStringToAny,
    broadcast = true,
  ) {
    return this.sendTransaction(privateKey, [action], broadcast);
  }

  public static async sendTransaction(
    actorPrivateKey: string,
    actions: IStringToAny,
    broadcast: boolean = true,
  ) {
    try {
      const api = this.getApiClient(actorPrivateKey);

      const params = {
        broadcast,
        blocksBehind:   BLOCKS_BEHIND,
        expireSeconds:  EXPIRATION_IN_SECONDS,
      };

      return await api.transact({
        actions,
      }, params);
    } catch (error) {
      if (error.json) {
        // eslint-disable-next-line no-console
        console.dir(error.json.error);
      }

      if (error instanceof RpcError && error.json.code === 401) {
        throw new BadRequestError('Private key is not valid');
      }

      if (error.message === 'Non-base58 character') {
        throw new BadRequestError('Malformed private key');
      }
      throw error;
    }
  }

  public static async serializeActionsByApi(actions: Action[]): Promise<SerializedAction[]> {
    const api = EosClient.getApiClientWithoutSignatures();

    return api.serializeActions(actions);
  }

  public static async deserializeActionsByApi(privateKey: string, transactionParts: any): Promise<any> {
    // #opt - private key is not required here
    const api = EosClient.getApiClient(privateKey);

    return api.deserializeTransaction(transactionParts.serializedTransaction);
  }

  private static getApiClient(privateKey: string) {
    const rpc = this.getRpcClient();
    const signatureProvider = new JsSignatureProvider([privateKey]);

    if (ConfigService.isNode()) {
      // eslint-disable-next-line global-require
      const { TextEncoder, TextDecoder } = require('util');

      return new Api({
        rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder(),
      });
    }

    return new Api({ rpc, signatureProvider });
  }

  private static getApiClientWithoutSignatures() {
    const rpc = this.getRpcClient();

    if (ConfigService.isNode()) {
      // eslint-disable-next-line global-require
      const { TextEncoder, TextDecoder } = require('util');

      return new Api({
        rpc, textDecoder: new TextDecoder(), textEncoder: new TextEncoder(),
      });
    }

    return new Api({ rpc });
  }

  /**
   *
   * @param {string} smartContract
   * @param {string} scope
   * @param {string} table
   * @param {string} boundFieldName
   * @param {number} limit
   * @param {number | null} indexPosition
   * @param {string | null} keyType
   * @param {number | null }argLowerBound
   * @returns {Promise<*[]>}
   */
  static async getTableRowsWithBatching(
    smartContract: string,
    scope: string,
    table: string,
    boundFieldName: string,
    limit: number,
    indexPosition: any = null,
    keyType: string | null = null,
    argLowerBound: any = null,
  ) {
    let lowerBound = argLowerBound;

    let tableRows = await EosClient.getJsonTableRows(
      smartContract,
      scope,
      table,
      limit,
      lowerBound,
      indexPosition,
      keyType,
    );

    let iterations = 0;
    const maxIterationsLimit = limit * 100;

    let result = [];
    while (tableRows.length !== 0) {
      if (lowerBound !== argLowerBound) {
        tableRows.shift(); // #task not very efficient
      }

      result = result.concat(tableRows);

      const lastBoundValue = tableRows[tableRows.length - 1][boundFieldName];

      if (boundFieldName === 'owner') {
        lowerBound = ConverterHelper.getAccountNameAsBoundString(lastBoundValue);
      } else {
        lowerBound = lastBoundValue;
      }

      tableRows = await EosClient.getJsonTableRows(
        smartContract,
        scope,
        table,
        limit,
        lowerBound,
        indexPosition,
        keyType,
      );

      if (tableRows.length === 1 && result.length !== 0 && tableRows[0][boundFieldName] === lastBoundValue) {
        break;
      }

      iterations += 1;

      if (iterations >= maxIterationsLimit) {
        throw new Error('Max iterations number is exceeded');
      }
    }

    return result;
  }

  /**
   *
   * @param {string} smartContract
   * @param {string} scope
   * @param {string} table
   * @param {number} limit
   * @param {string | number | null} lowerBound
   * @param { number | null }indexPosition
   * @param {string | null} keyType
   * @returns {Promise<Object[]>}
   */
  static async getJsonTableRows(
    smartContract: string,
    scope: string,
    table: string,
    limit: number,
    lowerBound: any = null,
    indexPosition: number | null = null,
    keyType: string | null = null,
  ) {
    if (limit > 1000) {
      throw new Error('It is not recommended to have limit value more than 1000');
    }

    const rpc = EosClient.getRpcClient();

    const query: any = {
      limit,
      scope,
      table,

      code:         smartContract,
      json:         true,
    };

    if (lowerBound !== null) {
      query.lower_bound = lowerBound;
    }

    if (indexPosition !== null) {
      query.index_position = `${indexPosition}`;
    }

    if (keyType !== null) {
      query.key_type = keyType;
    }

    const data = await rpc.fetch(
      '/v1/chain/get_table_rows',
      query,
    );

    // const data = await rpc.get_table_rows(query);

    return data.rows;
  }
}

export = EosClient;
