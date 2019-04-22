import EosClient = require('./common/client/eos-client');
import SmartContractsDictionary = require('./dictionary/smart-contracts-dictionary');
import SocialTransactionsService = require('./service/social-transactions-service');

class SocialApi {
  // noinspection JSUnusedGlobalSymbols
  static async pushSignedTransactionJson(signedTransactionJson) {
    const signedParsed = SocialApi.parseSignedTransactionJson(signedTransactionJson);

    return EosClient.pushTransaction(signedParsed);
  }

  /**
   *
   * @param signed
   * @returns {string}
   */
  static signedTransactionToString(signed) {
    return JSON.stringify(signed);
  }

  /**
   *
   * @param {string} signedTransactionJson
   * @returns {any}
   */
  static parseSignedTransactionJson(signedTransactionJson) {
    const signedParsed = JSON.parse(signedTransactionJson);
    signedParsed.serializedTransaction = Uint8Array.from(Object.values(signedParsed.serializedTransaction));

    return signedParsed;
  }

  /**
   *
   * @param {string} accountNameFrom
   * @param {string} privateKey
   * @param {string} accountNameTo
   * @returns {Promise<Object>}
   */
  static async getTrustUserSignedTransaction(accountNameFrom, privateKey, accountNameTo) {
    const smartContract = SmartContractsDictionary.uosActivity();

    return SocialTransactionsService.getTrustUserSignedTransactions(
      accountNameFrom,
      privateKey,
      accountNameTo,
      smartContract,
    );
  }

  static async getUntrustUserSignedTransaction(accountNameFrom, privateKey, accountNameTo) {
    const smartContract = SmartContractsDictionary.uosActivity();

    return SocialTransactionsService.getUntrustUserSignedTransactions(
      accountNameFrom,
      privateKey,
      accountNameTo,
      smartContract,
    );
  }

  /**
   *
   * @param {string} accountNameFrom
   * @param {string} privateKey
   * @param {string} accountNameTo
   * @returns {Promise<string>}
   */
  static async getTrustUserSignedTransactionsAsJson(accountNameFrom, privateKey, accountNameTo) {
    const signed = await SocialApi.getTrustUserSignedTransaction(
      accountNameFrom,
      privateKey,
      accountNameTo,
    );

    return SocialApi.signedTransactionToString(signed);
  }

  static async getUnTrustUserSignedTransactionsAsJson(accountNameFrom, privateKey, accountNameTo) {
    const signed = await SocialApi.getUntrustUserSignedTransaction(
      accountNameFrom,
      privateKey,
      accountNameTo,
    );

    return SocialApi.signedTransactionToString(signed);
  }
}

export = SocialApi;